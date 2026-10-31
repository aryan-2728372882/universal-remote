# Feature Specification: Guided Pairing Wizard (docs/features/pairing.md)

## 1. User Story
As a user pairing a new TV, I want a step-by-step visual wizard tailored to my brand (PIN prompt, on-screen Accept dialog, or instant connect) so that authorization succeeds without technical confusion.

## 2. Acceptance Criteria
- [AC-PAIR-01] Brand-tailored pairing instructions:
  - **LG webOS**: *"Look at your TV screen and press 'Accept' using your physical remote."*
  - **Android TV**: Shows an input field for the 6-character code displayed on the TV.
  - **Roku**: Instant connect (no prompt required).
  - **Samsung**: Prompts for on-screen approval.
- [AC-PAIR-02] Lost-Remote Rescue Path: If the user does not have a physical remote, provides hardware button instructions on the TV casing (e.g. holding power/jog key) and recommends built-in IR blaster if supported.
- [AC-PAIR-03] Successful pairing persists cryptographic tokens/certificates exclusively into secure storage.

## 3. Test Cases
- **TC-PAIR-01**: Android TV pairing flow receives 6-character PIN and completes TLS pairing.
- **TC-PAIR-02**: LG webOS pairing handshake captures `client-key` and stores it via `SecureTokenStore`.
- **TC-PAIR-03**: Rejection or timeout yields clear error with "Retry Pairing" button.
