# Feature Specification: Lost Remote Rescue (docs/features/lost_remote_rescue.md)

## 1. User Story
As a user who has lost or broken their physical TV remote, I want clear instructions on how to use the TV's physical buttons or phone IR blaster to accept pairing prompts or enable network control without a working physical remote.

## 2. Acceptance Criteria
- [AC-RESCUE-01] Brand-specific hardware button walkthroughs:
  - **LG TV**: Single jog button beneath center logo (short press = navigate, long press = accept).
  - **Android TV / Sony**: Center power button long-press brings up on-screen input/menu selector.
  - **Samsung TV**: Jog controller on rear right bottom.
- [AC-RESCUE-02] Phone IR Option: If the phone possesses an IR blaster (`ConsumerIrManager`), offers direct IR pairing codes for TV, DTH set-top box, or AC to press "OK" on screen.
- [AC-RESCUE-03] One-tap navigation into the Pairing Wizard once hardware button step is completed.

## 3. Test Cases
- **TC-RESCUE-01**: Selecting brand returns accurate physical button steps.
- **TC-RESCUE-02**: IR fallback indicates availability depending on device hardware sensor.
