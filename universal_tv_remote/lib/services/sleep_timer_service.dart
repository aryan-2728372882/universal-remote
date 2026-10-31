import 'dart:async';

/// Sleep Timer Service for powering off TV after a duration
class SleepTimerService {
  Timer? _timer;
  int _remainingSeconds = 0;
  final _tickController = StreamController<int>.broadcast();

  Stream<int> get ticks => _tickController.stream;
  int get remainingSeconds => _remainingSeconds;
  bool get isActive => _remainingSeconds > 0;

  void start({
    required int minutes,
    required Future<void> Function() onExpire,
  }) {
    cancel();
    _remainingSeconds = minutes * 60;
    _tickController.add(_remainingSeconds);

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      if (_remainingSeconds > 0) {
        _remainingSeconds--;
        _tickController.add(_remainingSeconds);
      } else {
        cancel();
        await onExpire();
      }
    });
  }

  void cancel() {
    _timer?.cancel();
    _timer = null;
    _remainingSeconds = 0;
    _tickController.add(0);
  }

  void dispose() {
    cancel();
    _tickController.close();
  }
}
