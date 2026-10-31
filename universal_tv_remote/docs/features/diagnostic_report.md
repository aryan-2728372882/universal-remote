# Feature Specification: Diagnostic Report & Redaction (docs/features/diagnostic_report.md)

## 1. User Story
As a user encountering an issue, I want to generate a diagnostic report that I can inspect and share with support, with absolute certainty that my private IP addresses, Wi-Fi passwords, MAC addresses, and TV pairing tokens are completely redacted.

## 2. Acceptance Criteria
- [AC-DIAG-01] Compiles local diagnostic data: App version, OS version, Flutter runtime, device brand/model, recent adapter errors, active connection state.
- [AC-DIAG-02] **Strict Privacy Redaction**: Automatically matches and replaces:
  - IPv4 addresses (`\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b`) -> `[IP_REDACTED]`
  - MAC addresses (`\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b`) -> `[MAC_REDACTED]`
  - Tokens and hex keys (`[0-9a-fA-F]{16,}`) -> `[TOKEN_REDACTED]`
  - PIN codes (`\b\d{4,8}\b` or alphanumeric 6-char pairing pins) -> `[PIN_REDACTED]`
- [AC-DIAG-03] Report is presented in a plain text viewer allowing user review before copy or sharing. No background uploading.

## 3. Test Cases
- **TC-DIAG-01**: Text with IP `192.168.1.105` is redacted to `[IP_REDACTED]`.
- **TC-DIAG-02**: Text with MAC `AA:BB:CC:DD:EE:FF` is redacted to `[MAC_REDACTED]`.
- **TC-DIAG-03**: Text with 64-character webOS client key is redacted to `[TOKEN_REDACTED]`.
