# Android TV / Google TV Protocol Specification (docs/protocols/android_tv.md)

**Protocol Name**: Android TV Remote Protocol v2  
**Last Verified Date**: October 31, 2026  
**Verified Hardware/OS**: Google TV (Chromecast with Google TV, Android TV 11, 12, 14, Nokia Smart TV, Sony Bravia, Xiaomi Mi Box)

---

## 1. Network Transport & Ports
- **Pairing Port**: `6467` (TLS with client certificate verification).
- **Remote Control Port**: `6466` (TLS with client certificate verification).
- **Discovery**: mDNS service type `_androidtvremote2._tcp.local`.

---

## 2. Pairing Sequence
1. Client generates a self-signed X.509 certificate and private key.
2. Client connects to TLS port `6467` and transmits a Pairing Request message.
3. TV verifies TLS handshake and generates a **6-character alphanumeric code** on the screen (e.g., `W3K9P1`).
4. User inputs the 6-character code into the app.
5. Client computes the SHA-256 HMAC of the certificate hashes with the code and sends the Secret message.
6. TV confirms pairing and client persists the TLS certificate for subsequent sessions.

---

## 3. Remote Control Keycodes (Port 6466)
Keys are transmitted as protobuf RemoteKey messages with key direction (`START_LONG`, `SHORT_PRESS`, `END_LONG`):
- `DPAD_UP` (Code 19)
- `DPAD_DOWN` (Code 20)
- `DPAD_LEFT` (Code 21)
- `DPAD_RIGHT` (Code 22)
- `DPAD_CENTER` / OK (Code 23)
- `BACK` (Code 4)
- `HOME` (Code 3)
- `VOLUME_UP` (Code 24)
- `VOLUME_DOWN` (Code 25)
- `VOLUME_MUTE` (Code 164)
- `MEDIA_PLAY_PAUSE` (Code 85)
- `POWER` (Code 26)

---

## 4. Power-On Matrix
- **Power Off**: Key code 26 (`POWER`) puts TV into standby.
- **Power On**: Wake-on-LAN (MAC required) or HDMI CEC ping.

| Connection Type | Standby Setting | Power-On Reliability | Notes |
|---|---|---|---|
| Ethernet | Network Standby = ON | High | Works reliably |
| Wi-Fi | Network Standby = ON | Medium | Dependent on router multicast filtering |
| Wi-Fi | Network Standby = OFF | Unsupported | Hardware sleeps deeply |
