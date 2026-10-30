const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Store {
  constructor(dataDir = path.join(__dirname, '../data')) {
    this.dataDir = dataDir;
    this.storePath = path.join(this.dataDir, 'store.json');
    this.keyPath = path.join(this.dataDir, 'master.key');
    this.data = {};
    this.encryptionKey = null;

    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize or load master encryption key (32 bytes = 256 bits)
    if (!fs.existsSync(this.keyPath)) {
      this.encryptionKey = crypto.randomBytes(32);
      fs.writeFileSync(this.keyPath, this.encryptionKey.toString('hex'), { mode: 0o600 });
    } else {
      const hex = fs.readFileSync(this.keyPath, 'utf-8').trim();
      this.encryptionKey = Buffer.from(hex, 'hex');
    }

    // Load store data
    if (fs.existsSync(this.storePath)) {
      try {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.warn('[Store] Warning: Failed to parse store.json, creating new store:', err.message);
        this.data = {};
      }
    } else {
      this.data = {};
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Error saving store:', err.message);
    }
  }

  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return value;
  }

  delete(key) {
    delete this.data[key];
    this.save();
  }

  /**
   * Encrypt sensitive secrets (e.g. ThinQ tokens, pairing certificates) using AES-256-GCM
   */
  setEncrypted(key, plainText) {
    if (plainText === null || plainText === undefined) {
      delete this.data[key];
      this.save();
      return;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    const textToEncrypt = typeof plainText === 'object' ? JSON.stringify(plainText) : String(plainText);
    let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    this.data[key] = {
      __encrypted: true,
      iv: iv.toString('hex'),
      authTag,
      payload: encrypted
    };
    this.save();
  }

  /**
   * Decrypt sensitive secrets
   */
  getEncrypted(key, defaultValue = null) {
    const entry = this.data[key];
    if (!entry || !entry.__encrypted) {
      return defaultValue;
    }

    try {
      const iv = Buffer.from(entry.iv, 'hex');
      const authTag = Buffer.from(entry.authTag, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(entry.payload, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (err) {
      console.error(`[Store] Decryption failed for key "${key}":`, err.message);
      return defaultValue;
    }
  }
}

module.exports = new Store();
