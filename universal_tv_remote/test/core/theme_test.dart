import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/core/result.dart';
import 'package:universal_tv_remote/core/theme.dart';

void main() {
  test('AppTheme returns dark theme configuration', () {
    final theme = AppTheme.darkTheme;
    expect(theme.brightness, Brightness.dark);
    expect(theme.scaffoldBackgroundColor, AppTokens.background);
    expect(theme.colorScheme.primary, AppTokens.primary);
  });

  test('Result type correctly distinguishes Success and Failure', () {
    const success = Success<int, String>(42);
    expect(success.isSuccess, isTrue);
    expect(success.isFailure, isFalse);
    expect(success.valueOrNull, 42);
    expect(success.errorOrNull, isNull);

    const failure = Failure<int, String>('Network error');
    expect(failure.isSuccess, isFalse);
    expect(failure.isFailure, isTrue);
    expect(failure.valueOrNull, isNull);
    expect(failure.errorOrNull, 'Network error');
  });
}
