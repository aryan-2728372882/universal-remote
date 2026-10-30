const { Client } = require('node-ssdp');
const http = require('http');

class SsdpDiscovery {
  constructor() {
    this.client = null;
    this.discovered = new Map();
  }

  start(onDeviceFound) {
    if (this.client) return;

    try {
      this.client = new Client();

      this.client.on('response', async (headers, statusCode, rinfo) => {
        const ip = rinfo.address;
        const usn = headers.USN || '';
        const server = headers.SERVER || '';
        const location = headers.LOCATION || '';

        // Check if LG webOS
        const isLg = usn.includes('lge-com') || server.includes('LG') || server.includes('webOS');

        if (!this.discovered.has(ip)) {
          let deviceName = isLg ? 'LG webOS Smart TV' : 'Smart Device';
          let deviceType = isLg ? 'lg_webos' : 'generic';

          // Try fetching UPnP description XML
          if (location) {
            try {
              const xml = await this.fetchXml(location);
              if (xml) {
                const fnMatch = xml.match(/<friendlyName>(.*?)<\/friendlyName>/i);
                if (fnMatch) deviceName = fnMatch[1];
                if (xml.includes('LG') || xml.includes('webOS')) deviceType = 'lg_webos';
                if (xml.includes('Roku')) deviceType = 'roku';
              }
            } catch {}
          }

          if (isLg || deviceType === 'lg_webos') {
            const device = {
              id: `lg-${ip.replace(/\./g, '-')}`,
              name: deviceName,
              type: 'lg_webos',
              ip,
              brand: 'LG Electronics',
              protocol: 'webOS SSAP (UPnP/SSDP)'
            };
            this.discovered.set(ip, device);
            if (onDeviceFound) onDeviceFound(device);
          }
        }
      });

      // Search every 45s
      this.client.search('ssdp:all');
      this.client.search('urn:lge-com:service:webos-second-screen:1');
      console.log('[SSDP] Active M-SEARCH discovery started');
    } catch (err) {
      console.warn('[SSDP] Error starting SSDP discovery:', err.message);
    }
  }

  fetchXml(url) {
    return new Promise((resolve) => {
      const req = http.get(url, { timeout: 2000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => {
        req.destroy();
        resolve('');
      });
    });
  }

  stop() {
    if (this.client) {
      try { this.client.stop(); } catch {}
      this.client = null;
    }
  }
}

module.exports = new SsdpDiscovery();
