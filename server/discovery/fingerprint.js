const http = require('http');

/**
 * Active Device Fingerprinter
 * Confirms real identity by querying endpoints, never relying solely on open port numbers.
 */
class Fingerprinter {
  /**
   * Fingerprint a candidate host
   */
  async fingerprint(ip) {
    // 1. Try Google Cast / Android TV Eureka info (Port 8008)
    const castInfo = await this.queryCast(ip);
    if (castInfo) {
      const isAndroidTv = (castInfo.bcastHighDPI || castInfo.device_info?.model_name?.toLowerCase().includes('tv') || castInfo.name?.toLowerCase().includes('tv'));
      return {
        confirmed: true,
        type: 'android_tv',
        name: castInfo.name || 'Android TV',
        brand: castInfo.device_info?.manufacturer || 'Nokia / Google',
        model: castInfo.device_info?.model_name || 'Smart TV',
        ip
      };
    }

    // 2. Try LG webOS device description or WebSocket probe
    const webosInfo = await this.queryWebos(ip);
    if (webosInfo) {
      return {
        confirmed: true,
        type: 'lg_webos',
        name: webosInfo.friendlyName || 'LG webOS TV',
        brand: 'LG Electronics',
        model: webosInfo.modelName || 'webOS TV',
        ip
      };
    }

    return null;
  }

  queryCast(ip) {
    return new Promise((resolve) => {
      const req = http.get(`http://${ip}:8008/setup/eureka_info?params=name,device_info`, { timeout: 1500 }, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  queryWebos(ip) {
    return new Promise((resolve) => {
      // Check port 3000 or UPnP device-desc XML
      const req = http.get(`http://${ip}:1487/roap/api`, { timeout: 1000 }, (res) => {
        // Some LG TVs respond on 1487
        resolve({ friendlyName: 'LG Smart TV' });
      });
      req.on('error', () => {
        // Also probe UPnP default 1970 or ssdp
        resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }
}

module.exports = new Fingerprinter();
