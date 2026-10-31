# Roku Protocol Specification (docs/protocols/roku.md)

**Protocol Name**: Roku External Control Protocol (ECP)  
**Last Verified Date**: October 31, 2026  
**Verified Hardware**: Roku OS 11.5, 12.0, 13.0 (Roku Streaming Stick, TCL Roku TV, Hisense Roku TV)

---

## 1. Network Transport & Ports
- **Port**: `8060` (HTTP REST).
- **Discovery**: SSDP M-SEARCH target `roku:ecp`.

---

## 2. Pairing & Authentication
- **Pairing**: None required. Roku ECP is open by default on the local subnet (unless user has set *Settings -> System -> Advanced system settings -> Control by mobile apps -> Network access* to Disabled).

---

## 3. Remote Commands
All commands use HTTP `POST` requests:
- `POST http://<ip>:8060/keypress/Home`
- `POST http://<ip>:8060/keypress/Back`
- `POST http://<ip>:8060/keypress/Select`
- `POST http://<ip>:8060/keypress/Up`
- `POST http://<ip>:8060/keypress/Down`
- `POST http://<ip>:8060/keypress/Left`
- `POST http://<ip>:8060/keypress/Right`
- `POST http://<ip>:8060/keypress/VolumeUp`
- `POST http://<ip>:8060/keypress/VolumeDown`
- `POST http://<ip>:8060/keypress/VolumeMute`
- `POST http://<ip>:8060/keypress/PowerOn` / `PowerOff`
- `POST http://<ip>:8060/launch/<appId>` (e.g. `12` for Netflix, `837` for YouTube)
- Query apps: `GET http://<ip>:8060/query/apps`
- Query device info: `GET http://<ip>:8060/query/device-info`

---

## 4. Latency Characteristics
- Returns HTTP `200 OK` upon keypress execution.
- Round-trip latency typically 8–25 ms on LAN.
