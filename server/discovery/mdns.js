const { Bonjour } = require('bonjour-service');
const fingerprinter = require('./fingerprint');

class MdnsDiscovery {
  constructor() {
    this.instance = null;
    this.discovered = new Map();
  }

  start(onDeviceFound) {
    if (this.instance) return;

    try {
      this.instance = new Bonjour();

      // 1. Android TV Remote v2 (_androidtvremote2._tcp)
      const atvBrowser = this.instance.find({ type: 'androidtvremote2' });
      atvBrowser.on('up', async (service) => {
        const ip = service.addresses?.find((a) => a.includes('.')) || service.referer?.address;
        if (ip && !this.discovered.has(ip)) {
          const device = {
            id: `atv-${ip.replace(/\./g, '-')}`,
            name: service.name || 'Android TV',
            type: 'android_tv',
            ip,
            brand: 'Nokia / Google',
            port: service.port || 6467,
            protocol: 'Android TV Remote v2 (mDNS)'
          };
          this.discovered.set(ip, device);
          if (onDeviceFound) onDeviceFound(device);
        }
      });

      // 2. Google Cast (_googlecast._tcp)
      const castBrowser = this.instance.find({ type: 'googlecast' });
      castBrowser.on('up', async (service) => {
        const ip = service.addresses?.find((a) => a.includes('.')) || service.referer?.address;
        if (ip && !this.discovered.has(ip)) {
          const fp = await fingerprinter.fingerprint(ip);
          const device = {
            id: `cast-${ip.replace(/\./g, '-')}`,
            name: fp?.name || service.txt?.fn || service.name || 'Google Cast TV',
            type: fp?.type || 'android_tv',
            ip,
            brand: fp?.brand || 'Google / Android',
            protocol: 'Google Cast (mDNS)'
          };
          this.discovered.set(ip, device);
          if (onDeviceFound) onDeviceFound(device);
        }
      });

      console.log('[mDNS] Browsers active for _androidtvremote2._tcp & _googlecast._tcp');
    } catch (err) {
      console.warn('[mDNS] Failed to start Bonjour discovery:', err.message);
    }
  }

  stop() {
    if (this.instance) {
      try {
        this.instance.destroy();
      } catch {}
      this.instance = null;
    }
  }
}

module.exports = new MdnsDiscovery();
