const os = require('os');
const net = require('net');
const fingerprinter = require('./fingerprint');

class SubnetScan {
  /**
   * Detect all private IPv4 interfaces, subnet base, mask, and broadcast address
   */
  getPrivateInterfaces() {
    const interfaces = os.networkInterfaces();
    const list = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      for (const iface of addrs) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const ip = iface.address;
          const isPrivate =
            ip.startsWith('10.') ||
            ip.startsWith('192.168.') ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

          if (isPrivate) {
            // Calculate broadcast address
            const ipParts = ip.split('.').map(Number);
            const maskParts = (iface.netmask || '255.255.255.0').split('.').map(Number);
            const broadcastParts = ipParts.map((b, i) => (b | (~maskParts[i] & 255)));
            const broadcastAddress = broadcastParts.join('.');

            const subnetPrefix = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;

            list.push({
              name,
              ip,
              netmask: iface.netmask,
              broadcastAddress,
              subnetPrefix
            });
          }
        }
      }
    }

    return list;
  }

  /**
   * Fast port probe
   */
  probePort(ip, port, timeout = 350) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, ip);
    });
  }

  /**
   * Fallback sweep of subnet for devices that don't respond to mDNS/SSDP
   */
  async scan(onProgress = null) {
    const privateNets = this.getPrivateInterfaces();
    if (privateNets.length === 0) return [];

    const primaryNet = privateNets[0];
    const results = [];
    const targetPorts = [3000, 8008, 6466]; // webOS, Cast/DIAL, Android TV
    const total = 254;
    let checked = 0;

    const ips = Array.from({ length: total }, (_, i) => `${primaryNet.subnetPrefix}${i + 1}`);
    const batchSize = 32;

    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (ip) => {
          if (ip === primaryNet.ip) return;

          const openPortResults = await Promise.all(
            targetPorts.map(async (port) => ({
              port,
              open: await this.probePort(ip, port)
            }))
          );

          const open = openPortResults.filter((p) => p.open).map((p) => p.port);
          if (open.length > 0) {
            // Confirm identity via fingerprinting
            const fp = await fingerprinter.fingerprint(ip);
            if (fp && fp.confirmed) {
              results.push({
                id: `${fp.type}-${ip.replace(/\./g, '-')}`,
                name: fp.name,
                type: fp.type,
                ip,
                brand: fp.brand,
                protocol: 'Subnet Scan + Fingerprint'
              });
            }
          }
        })
      );

      checked += batch.length;
      if (onProgress) onProgress(Math.round((checked / total) * 100));
    }

    return results;
  }
}

module.exports = new SubnetScan();
