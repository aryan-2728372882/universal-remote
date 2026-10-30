/**
 * Render Keep-Alive / Ping Service
 * Prevents Render's free web service from sleeping (Render sleeps after 15 mins of inactivity).
 * Pings every 10-12 minutes to guarantee 24/7 uptime free of cost.
 */

class PingService {
  constructor() {
    this.timer = null;
    this.intervalMinutes = 11; // Sweet spot before 15 min idle sleep
    this.targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || '';
    this.history = [];
    this.isRunning = false;
    this.totalPings = 0;
    this.lastPingTime = null;
    this.lastStatus = null;
  }

  setTargetUrl(url) {
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    this.targetUrl = url;
    console.log(`[PingService] Target URL updated to: ${this.targetUrl}`);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[PingService] Keep-alive service initialized. Interval: ${this.intervalMinutes}m`);

    // Perform an initial ping after 30 seconds
    setTimeout(() => this.performPing(), 30000);

    // Schedule regular interval
    this.timer = setInterval(() => {
      this.performPing();
    }, this.intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[PingService] Keep-alive service stopped.');
  }

  async performPing() {
    const url = this.targetUrl ? `${this.targetUrl.replace(/\/+$/, '')}/api/ping` : null;
    const now = new Date();

    if (!url) {
      console.log(`[PingService] [${now.toLocaleTimeString()}] No public URL set. Running in local mode.`);
      this.recordPing(now, 'LOCAL_STANDBY', 200, 0);
      return;
    }

    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'UniversalRemote-KeepAlive/1.0' }
      });
      const duration = Date.now() - startTime;
      const statusText = response.ok ? 'HEALTHY' : `HTTP_${response.status}`;
      
      this.recordPing(now, statusText, response.status, duration);
      console.log(`[PingService] [${now.toLocaleTimeString()}] Self-ping sent to ${url} -> ${response.status} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - startTime;
      this.recordPing(now, 'FAILED', 0, duration, err.message);
      console.warn(`[PingService] [${now.toLocaleTimeString()}] Self-ping failed: ${err.message}`);
    }
  }

  recordPing(timestamp, status, code, duration, error = null) {
    this.lastPingTime = timestamp;
    this.lastStatus = status;
    this.totalPings++;

    this.history.unshift({
      timestamp: timestamp.toISOString(),
      status,
      code,
      duration,
      error
    });

    // Keep last 30 ping logs
    if (this.history.length > 30) {
      this.history.pop();
    }
  }

  getStatus() {
    return {
      active: this.isRunning,
      targetUrl: this.targetUrl,
      intervalMinutes: this.intervalMinutes,
      totalPings: this.totalPings,
      lastPingTime: this.lastPingTime ? this.lastPingTime.toISOString() : null,
      lastStatus: this.lastStatus,
      history: this.history.slice(0, 10),
      instructions: {
        renderTip: "Add your Render URL (e.g. https://your-app.onrender.com) in Settings to activate self-ping.",
        externalCronUrl: this.targetUrl ? `${this.targetUrl.replace(/\/+$/, '')}/api/ping` : '/api/ping',
        freeCronServices: ["cron-job.org", "uptimerobot.com"]
      }
    };
  }
}

module.exports = new PingService();
