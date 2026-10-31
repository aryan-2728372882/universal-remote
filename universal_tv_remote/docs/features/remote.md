# Feature Specification: Remote Screen & Controls (docs/features/remote.md)

## 1. User Story
As a user controlling my TV, I want a responsive, tactile remote control screen with sub-100ms dispatch latency, realistic haptic ticks, and capability-aware controls that hide unsupported buttons.

## 2. Acceptance Criteria
- [AC-REM-01] Controls:
  - Power (toggle with WoL fallback when off).
  - Navigation: 5-way D-Pad (Up, Down, Left, Right, OK) and switchable Touchpad/Swipe surface.
  - Core Navigation: Back, Home, Menu / Settings, Input / Source.
  - Audio: Volume Rockers (+ / -), Mute toggle with instant visual state.
  - Channels: Channel Rockers (+ / -).
  - Media Controls: Play, Pause, Rewind, Fast-Forward.
  - Drawer controls: Collapsible Number Pad (0–9), Color keys (Red, Green, Yellow, Blue).
  - Quick App Launch row (Netflix, YouTube, Prime Video, Disney+).
  - Text input field for remote typing into TV search bars.
  - Sleep timer pill with animated remaining countdown.
- [AC-REM-02] Capability-aware: Unsupported buttons are hidden, never dead or non-responsive.
- [AC-REM-03] Key Press-and-Hold: Pressing and holding Volume Up/Down sends repeating volume commands at a controlled interval (150ms).
- [AC-REM-04] Tactile Physics & Haptics: Haptic feedback tick on tap down; micro-scaling animated press state.
- [AC-REM-05] Dispatch Latency: Measured phone-side tap-to-socket dispatch under 100 ms on a live socket.

## 3. Test Cases
- **TC-REM-01**: Pressing D-pad Up triggers `sendKey(RemoteKey.up)` on active adapter.
- **TC-REM-02**: Long-pressing Volume Up triggers periodic repeat events.
- **TC-REM-03**: Switching to Touchpad mode dispatches delta coordinates `pointerMove(dx, dy)`.
- **TC-REM-04**: Offline state disables controls with ambient badge indicating `ConnectionState.lost`.
