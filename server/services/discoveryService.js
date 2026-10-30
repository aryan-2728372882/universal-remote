const os = require('os');
const net = require('net');
const dgram = require('dgram');
const { exec } = require('child_process');
const webosService = require('./webosService');
const androidTvService = require('./androidTvService');

class DiscoveryService {
  constructor() {
    this.discoveredDevices = [];
    this.isScanning = false;
    this.lastScanTime = null;
  }

  getLocalNetworkInfo() {
    const interfaces = os.networkInterfaces();
    let localIp = '127.0.0.1';
    let subnetPrefix = '192.168.1.';

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIp = iface.address;
          const parts = localIp.split('.');
          if (parts.length === 4) {
            subnetPrefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;
          }
          return { localIp, subnetPrefix, interfaceName: name };
        }
      }
    }
    return { localIp, subnetPrefix, interfaceName: 'default' };
  }

  checkPort(ip, port, timeout = 500) {
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

  async fetchCastInfo(ip) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`http://${ip}:8008/setup/eureka_info?params=name,device_info`, {
        signal: controller.signal
      });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.name || 'Android TV',
          model: data.device_info?.model_name || 'Smart TV',
          manufacturer: data.device_info?.manufacturer || 'Nokia'
        };
      }
    } catch {}
    return null;
  }

  getArpTable() {
    return new Promise((resolve) => {
      exec('arp -a', (err, stdout) => {
        const map = new Map();
        if (!err && stdout) {
          const lines = stdout.split('\n');
          for (const line of lines) {
            const match = line.trim().match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+([0-9a-fA-F-]+)/);
            if (match) {
              map.set(match[1], match[2].toUpperCase().replace(/-/g, ':'));
            }
          }
        }
        resolve(map);
      });
    });
  }

  /**
   * Real network sweep with genuine online/offline state detection
   */
  async scanNetwork(onProgress = null) {
    if (this.isScanning) {
      return { status: 'ALREADY_SCANNING', devices: this.discoveredDevices };
    }

    this.isScanning = true;
    const { localIp, subnetPrefix } = this.getLocalNetworkInfo();
    console.log(`[DiscoveryService] Live Wi-Fi scan on ${subnetPrefix}0/24...`);

    const liveDevices = [];
    const arpMap = await this.getArpTable();

    // Probe key ports
    const targetPorts = [3000, 8008, 8009, 6466, 5555];
    const totalIps = 254;
    let completedIps = 0;

    const ips = Array.from({ length: totalIps }, (_, i) => `${subnetPrefix}${i + 1}`);
    const batchSize = 32;

    for (let b = 0; b < ips.length; b += batchSize) {
      const batch = ips.slice(b, b + batchSize);

      await Promise.all(
        batch.map(async (ip) => {
          // Skip the local server itself
          if (ip === localIp) return;

          const portResults = await Promise.all(
            targetPorts.map(async (port) => ({
              port,
              open: await this.checkPort(ip, port, 400)
            }))
          );

          const openPorts = portResults.filter((p) => p.open).map((p) => p.port);

          if (openPorts.length > 0) {
            const mac = arpMap.get(ip) || 'Unknown MAC';
            let deviceType = 'SMART_DEVICE';
            let name = `Smart Device (${ip})`;
            let brand = 'Generic';
            let category = 'TV';

            if (openPorts.includes(3000)) {
              deviceType = 'LG_WEBOS_TV';
              name = 'LG webOS Smart TV';
              brand = 'LG';
              category = 'TV';
              webosService.setTvIp(ip, mac);
            }

            if (openPorts.includes(8008) || openPorts.includes(8009) || openPorts.includes(6466) || openPorts.includes(5555)) {
              deviceType = 'ANDROID_TV';
              name = 'Nokia Smart Android TV';
              brand = 'Nokia';
              category = 'TV';
              androidTvService.setTvIp(ip);

              if (openPorts.includes(8008)) {
                const castInfo = await this.fetchCastInfo(ip);
                if (castInfo?.name) name = castInfo.name;
              }
            }

            liveDevices.push({
              id: `live-${ip.replace(/\./g, '-')}`,
              ip,
              name,
              brand,
              category,
              deviceType,
              openPorts,
              mac,
              status: 'ONLINE',
              isLive: true,
              discoveredAt: new Date().toISOString()
            });
          }
        })
      );

      completedIps += batch.length;
      if (onProgress) onProgress(Math.min(95, Math.round((completedIps / totalIps) * 100)));
    }

    // Strictly return only real devices that actually responded on the network
    this.discoveredDevices = liveDevices;
    this.isScanning = false;
    this.lastScanTime = new Date().toISOString();

    if (onProgress) onProgress(100);
    return {
      status: 'SUCCESS',
      devices: this.discoveredDevices,
      scanTime: this.lastScanTime,
      localIp
    };
  }

  getDiscoveredDevices() {
    return {
      devices: this.discoveredDevices,
      isScanning: this.isScanning,
      lastScanTime: this.lastScanTime,
      networkInfo: this.getLocalNetworkInfo()
    };
  }

  addCustomDevice({ ip, name, category = 'TV', type = 'GENERIC' }) {
    const cleanIp = (ip || '').trim();
    if (!cleanIp) throw new Error('IP address is required');

    const device = {
      id: `custom-${cleanIp.replace(/\./g, '-')}`,
      ip: cleanIp,
      name: name || `Custom Device (${cleanIp})`,
      brand: 'Custom',
      category,
      deviceType: type,
      status: 'ONLINE',
      isLive: true,
      protocol: 'Direct Wi-Fi IP',
      discoveredAt: new Date().toISOString()
    };

    this.discoveredDevices = [
      device,
      ...this.discoveredDevices.filter((d) => d.ip !== cleanIp)
    ];

    return device;
  }
}

module.exports = new DiscoveryService();
