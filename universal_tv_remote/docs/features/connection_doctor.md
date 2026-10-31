# Feature Specification: Connection Doctor (docs/features/connection_doctor.md)

## 1. User Story
When a TV cannot be found or connection drops, I want a plain-language diagnostic wizard that tests local network conditions step-by-step and tells me exactly what is wrong and how to fix it.

## 2. Acceptance Criteria
- [AC-DOC-01] Runs 8 sequential diagnostic checks:
  1. Phone Wi-Fi enabled and connected to an SSID.
  2. Subnet verification (valid private IPv4 assigned).
  3. Router AP/Client Isolation or Guest Network detection.
  4. Active VPN or private DNS filtering multicast/local sockets.
  5. Multicast socket responsiveness.
  6. Target TV power/standby status.
  7. Target TV protocol port accessibility.
  8. Pairing credentials validity.
- [AC-DOC-02] Each failed check presents a plain-language explanation and actionable fix (e.g., *"Your phone is on a 5GHz guest network; switch to your primary 2.4GHz Wi-Fi"*; *"Disable AP Isolation in router settings"*).
- [AC-DOC-03] Diagnostics run 100% locally on the device; no network telemetry leaves the phone.

## 3. Test Cases
- **TC-DOC-01**: Diagnostic runner detects offline Wi-Fi interface and reports `StepResult.failed` with fix recommendation.
- **TC-DOC-02**: Diagnostic runner validates healthy private subnet (e.g. `192.168.1.50`).
- **TC-DOC-03**: Redacted report generator redacts all IP octets, MAC addresses, and token values into `[REDACTED]`.
