const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const store = require('./Store');

class Auth {
  constructor() {
    this.jwtSecret = store.get('jwt_secret');
    if (!this.jwtSecret) {
      this.jwtSecret = require('crypto').randomBytes(32).toString('hex');
      store.set('jwt_secret', this.jwtSecret);
    }
  }

  isConfigured() {
    return Boolean(store.get('hub_pin_hash'));
  }

  async setPin(pin) {
    if (!pin || String(pin).length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }
    const hash = await bcrypt.hash(String(pin), 10);
    store.set('hub_pin_hash', hash);
    return this.createSessionToken();
  }

  async verifyPin(pin) {
    const hash = store.get('hub_pin_hash');
    if (!hash) {
      throw new Error('Hub PIN is not configured yet');
    }
    const match = await bcrypt.compare(String(pin), hash);
    if (!match) {
      return null;
    }
    return this.createSessionToken();
  }

  createSessionToken() {
    return jwt.sign({ hubAuth: true, timestamp: Date.now() }, this.jwtSecret, {
      expiresIn: '30d'
    });
  }

  verifyToken(token) {
    if (!token) return false;
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return Boolean(decoded && decoded.hubAuth);
    } catch {
      return false;
    }
  }

  /**
   * Express Middleware to enforce session token
   */
  middleware() {
    return (req, res, next) => {
      const p = req.path;
      const isAuthStatus = p === '/auth/status' || p === '/api/auth/status';
      const isAuthSetup = p === '/auth/setup' || p === '/api/auth/setup';
      const isAuthLogin = p === '/auth/login' || p === '/api/auth/login';

      // If PIN is not configured yet, allow setup endpoints
      if (!this.isConfigured()) {
        if (isAuthStatus || isAuthSetup) {
          return next();
        }
        return res.status(403).json({ error: 'FIRST_RUN_REQUIRED', message: 'First-run PIN setup required' });
      }

      // Public read-only auth routes
      if (isAuthStatus || isAuthLogin) {
        return next();
      }

      // Extract token from Cookie or Authorization header
      const token = req.cookies?.hub_session || req.headers.authorization?.replace(/^Bearer\s+/, '');

      if (!token || !this.verifyToken(token)) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      next();
    };
  }

  /**
   * Security configuration middlewares
   */
  securityMiddlewares() {
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30, // Max 30 attempts per 15 min window
      message: { error: 'TOO_MANY_ATTEMPTS', message: 'Too many PIN attempts. Please wait 15 minutes.' }
    });

    const apiLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 300, // Max 300 command requests per minute
      message: { error: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' }
    });

    const helmetMiddleware = helmet({
      contentSecurityPolicy: false // Allow local PWA assets & inline icons
    });

    return {
      cookieParser: cookieParser(),
      helmet: helmetMiddleware,
      authLimiter,
      apiLimiter
    };
  }
}

module.exports = new Auth();
