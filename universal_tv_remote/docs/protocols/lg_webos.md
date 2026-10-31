# LG webOS TV Protocol Specification (docs/protocols/lg_webos.md)

**Protocol Name**: LG Second Screen / SSAP (Smart Station Access Protocol)  
**Last Verified Date**: October 31, 2026  
**Verified Firmware**: webOS 3.5, webOS 4.5, webOS 6.0, webOS 23 (2023–2024 models)

---

## 1. Network Transport & Ports
- **ws://<ip>:3000**: Plaintext WebSocket used on older webOS models (webOS 3.0–4.0).
- **wss://<ip>:3001**: TLS WebSocket (Self-signed certificate). Standard on webOS 4.5+ and 2020+ TVs.
- **Handshake Timeout**: 2500 ms.

---

## 2. Pairing & Registration
1. Send registration payload over the open WebSocket:
```json
{
  "type": "register",
  "id": "register_0",
  "payload": {
    "forcePairing": false,
    "pairingType": "PROMPT",
    "client-key": "<persisted_key_if_known>",
    "manifest": {
      "manifestVersion": 1,
      "appVersion": "1.0",
      "signed": {
        "created": "20240101",
        "appId": "com.universaltv.remote",
        "vendorId": "com.universal",
        "localizedAppNames": { "": "Universal Smart Remote" },
        "permissions": [
          "LAUNCH", "LAUNCH_WEBAPP", "APP_TO_APP", "CONTROL_AUDIO",
          "CONTROL_DISPLAY", "CONTROL_INPUT_JOYSTICK", "CONTROL_INPUT_MEDIA_PLAYBACK",
          "CONTROL_INPUT_TV", "READ_APP_STATUS", "READ_CURRENT_CHANNEL",
          "READ_INPUT_DEVICE_LIST", "READ_NETWORK_STATUS", "READ_RUNNING_APPS",
          "READ_TV_CHANNEL_LIST", "WRITE_NOTIFICATION_TOAST"
        ]
      }
    }
  }
}
```
2. If `client-key` is missing or rejected, the TV shows a prompt: *"Allow Universal Smart Remote to connect?"*.
3. When the user clicks **Accept** on their physical remote, the TV replies:
```json
{
  "type": "registered",
  "payload": {
    "client-key": "49f82d... (64 hex characters)"
  }
}
```
4. The hub/app securely stores `client-key` in Keystore/Keychain.

---

## 3. Remote Control Buttons & Pointer Socket
- Traditional SSAP request URIs (`ssap://tv/rewind`) do not control D-Pad arrow navigation reliably in menus.
- Real D-Pad navigation requires requesting the network input pointer socket:
  - Request: `ssap://com.webos.service.networkinput/getPointerInputSocket`
  - Response: `{ "socketPath": "wss://<ip>:3001/ws/pointerInput..." }`
  - Over the pointer socket, buttons are sent as raw text packets:
    `type:button\nname:<BUTTON_NAME>\n\n`
  - Supported Button Names: `UP`, `DOWN`, `LEFT`, `RIGHT`, `ENTER`, `BACK`, `HOME`, `MENU`, `VOLUME_UP`, `VOLUME_DOWN`, `MUTE`, `RED`, `GREEN`, `YELLOW`, `BLUE`.

---

## 4. Power-On Matrix & Wake-on-LAN
- **Power Off**: `ssap://system/turnOff` (Reliable, instantaneous).
- **Power On**: Wake-on-LAN (WoL) UDP port 9 to subnet broadcast (`192.168.1.255`).

| Connection Type | Standby Setting | Power-On Reliability | Notes |
|---|---|---|---|
| Ethernet (Wired) | "Mobile TV On" = ON | High | TV Ethernet chip listens in low-power standby |
| Ethernet (Wired) | "Mobile TV On" = OFF | Unsupported | TV cuts PHY power completely |
| Wi-Fi (Wireless) | "Turn on via Wi-Fi" = ON | Medium/Unreliable | Many routers drop ARP cache after 15–30 min |
| Wi-Fi (Wireless) | "Turn on via Wi-Fi" = OFF | Unsupported | Wi-Fi radio powered off |
