import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/diagnostics/redacted_report.dart';

void main() {
  group('RedactedReport Tests', () {
    test('Redacts IP addresses', () {
      const text = 'Connected to 192.168.1.105 via gateway 192.168.1.1';
      final sanitized = RedactedReport.redact(text);
      expect(sanitized, isNot(contains('192.168.1.105')));
      expect(sanitized, isNot(contains('192.168.1.1')));
      expect(sanitized, contains('[IP_REDACTED]'));
    });

    test('Redacts MAC addresses in colon and dash notation', () {
      const text = 'Device MAC is AA:BB:CC:11:22:33 or 00-14-22-01-23-45';
      final sanitized = RedactedReport.redact(text);
      expect(sanitized, isNot(contains('AA:BB:CC:11:22:33')));
      expect(sanitized, isNot(contains('00-14-22-01-23-45')));
      expect(sanitized, contains('[MAC_REDACTED]'));
    });

    test('Redacts auth tokens and long hex strings', () {
      const text = 'Token: a1b2c3d4e5f60718293a4b5c6d7e8f90';
      final sanitized = RedactedReport.redact(text);
      expect(sanitized, isNot(contains('a1b2c3d4e5f60718293a4b5c6d7e8f90')));
      expect(sanitized, contains('[TOKEN_REDACTED]'));
    });

    test('generateReport masks IP and MAC in the diagnostic output', () {
      final report = RedactedReport.generateReport(
        appVersion: '1.0.0',
        osVersion: 'Android 14',
        currentBrand: 'lg_webos',
        currentIp: '192.168.1.45',
        currentMac: 'AA:BB:CC:DD:EE:FF',
        rawErrorLog: 'Connection failed to 192.168.1.45:3001 with token 9876543210abcdef0123456789abcdef',
      );

      expect(report, contains('App Version: 1.0.0'));
      expect(report, contains('Platform OS: Android 14'));
      expect(report, isNot(contains('192.168.1.45')));
      expect(report, isNot(contains('AA:BB:CC:DD:EE:FF')));
      expect(report, isNot(contains('9876543210abcdef0123456789abcdef')));
      expect(report, contains('[IP_REDACTED]'));
      expect(report, contains('[MAC_REDACTED]'));
      expect(report, contains('[TOKEN_REDACTED]'));
    });
  });
}
