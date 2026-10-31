# Feature Specification: Sleep Timer (docs/features/sleep_timer.md)

## 1. User Story
As a user watching TV before bed, I want to set a sleep timer (15, 30, 45, 60, 90 minutes) that automatically turns off the TV when time expires, so the TV doesn't run all night.

## 2. Acceptance Criteria
- [AC-SLEEP-01] Provides quick presets: 15m, 30m, 45m, 60m, 90m, or custom duration.
- [AC-SLEEP-02] Active sleep timer displays a pulsing countdown badge in the top navigation bar.
- [AC-SLEEP-03] User can cancel or adjust remaining time with one tap.
- [AC-SLEEP-04] Upon expiration, dispatches `powerOff()` to the active TV.

## 3. Test Cases
- **TC-SLEEP-01**: Starting a timer updates remaining seconds and emits tick events.
- **TC-SLEEP-02**: Expiration of a 1-second timer invokes `powerOff()` on the adapter.
- **TC-SLEEP-03**: Cancelling the timer stops the countdown and prevents power off.
