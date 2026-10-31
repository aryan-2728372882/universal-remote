# Feature Specification: Device Discovery (docs/features/discovery.md)

## 1. User Story
As a user opening the app, I want my TVs on the local Wi-Fi network discovered automatically within seconds, so I can tap and pair immediately without typing IP addresses.

## 2. Acceptance Criteria
- [AC-DISC-01] Runs mDNS (`_androidtvremote2._tcp`, `_googlecast._tcp`) and SSDP M-SEARCH (`urn:lge-com:service:webos-second-screen:1`, `roku:ecp`, `urn:samsung.com:device:RemoteControlReceiver:1`) in parallel.
- [AC-DISC-02] Discovered devices stream into the UI dynamically as responses arrive (no blocking until the full 5-second scan window elapses).
- [AC-DISC-03] Devices are fingerprinted into `(brand, model, ip, mac, protocol, port)`.
- [AC-DISC-04] Provides "Manual Add by IP" with brand selection fallback.
- [AC-DISC-05] If multicast is completely blocked by router AP isolation, offers Subnet Probe fallback (scans ports 3000, 8060, 6466 across the `/24` subnet).
- [AC-DISC-06] Auto-reconnect: if a saved TV's DHCP IP changes, matches by MAC address or mDNS name and updates saved IP silently.

## 3. Edge Cases & Failure Behavior
- Wi-Fi disconnected: UI immediately transitions to "Wi-Fi Disconnected" state with one-tap link to Connection Doctor.
- Router AP Isolation active: Multicast probe times out; auto-triggers Connection Doctor step pointing out guest network/AP isolation.

## 4. Test Cases
- **TC-DISC-01**: Parse SSDP LG webOS M-SEARCH notification -> returns `Device` with brand `lg_webos`, correct IP and port 3001/3000.
- **TC-DISC-02**: Parse SSDP Roku M-SEARCH notification -> returns `Device` with brand `roku`, correct IP and port 8060.
- **TC-DISC-03**: Parse mDNS Android TV response -> returns `Device` with brand `android_tv`, port 6467.
- **TC-DISC-04**: Deduplication: identical device responding on multiple interfaces is merged into a single device record.
- **TC-DISC-05**: Subnet probe fallback correctly identifies active ports on a fake local server.
