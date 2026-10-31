# Samsung Tizen TV Protocol Specification (docs/protocols/samsung.md)

**Protocol Name**: Samsung Smart TV WebSocket API v2  
**Last Verified Date**: October 31, 2026  
**Verified Models**: Samsung Tizen 2016–2024 models (M, N, R, T, A, B, C, D series)

---

## 1. Network Transport & Ports
- **ws://<ip>:8001/api/v2/channels/samsung.remote.control**: Unencrypted WebSocket (older models).
- **wss://<ip>:8002/api/v2/channels/samsung.remote.control?name=<base64_name>&token=<token>**: Encrypted TLS WebSocket (2016+).
- **Discovery**: SSDP M-SEARCH `urn:samsung.com:device:RemoteControlReceiver:1`.

---

## 2. Pairing Sequence
1. Connect to `wss://<ip>:8002/api/v2/channels/samsung.remote.control?name=<base64_app_name>`.
2. TV displays on-screen prompt: *"Allow Universal Smart Remote to connect to this TV?"*.
3. User confirms with physical remote.
4. TV sends a JSON event containing `"token": "12345678"`.
5. Client persists the token. Future connections append `&token=<token>` to bypass prompts.

---

## 3. Remote Control Key Messages
Keys are sent as JSON text packets:
```json
{
  "method": "ms.remote.control",
  "params": {
    "Cmd": "Click",
    "DataOfCmd": "KEY_VOLDOWN",
    "Option": "false",
    "TypeOfRemote": "SendRemoteKey"
  }
}
```
Supported keys: `KEY_POWER`, `KEY_HOME`, `KEY_RETURN`, `KEY_ENTER`, `KEY_UP`, `KEY_DOWN`, `KEY_LEFT`, `KEY_RIGHT`, `KEY_VOLUP`, `KEY_VOLDOWN`, `KEY_MUTE`, `KEY_MENU`.
