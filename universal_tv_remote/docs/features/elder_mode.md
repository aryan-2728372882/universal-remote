# Feature Specification: Elder Mode (docs/features/elder_mode.md)

## 1. User Story
As an older adult or user with low vision/motor fatigue, I want a simplified remote screen featuring ~6 extra-large, high-contrast buttons (Power, Vol +, Vol -, Ch +, Ch -, Mute, Back, OK) without complex menus or scrolling.

## 2. Acceptance Criteria
- [AC-ELDER-01] Toggleable in Settings -> Accessibility -> Elder Mode.
- [AC-ELDER-02] UI layout features 6–8 oversized buttons with high contrast ratios (>7:1).
- [AC-ELDER-03] Enhanced haptic response and audible audio tick support.
- [AC-ELDER-04] Zero scrolling required: entire interface fits on screen regardless of phone height.

## 3. Test Cases
- **TC-ELDER-01**: Toggling Elder Mode in settings updates state and renders large-format buttons.
- **TC-ELDER-02**: Pressing oversized volume button dispatches correct `RemoteKey.volumeUp`.
