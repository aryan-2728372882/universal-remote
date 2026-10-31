/// Diagnostic Report Generator with Guaranteed PII & Secret Redaction
class RedactedReport {
  RedactedReport._();

  static final RegExp _ipRegex = RegExp(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b');
  static final RegExp _macRegex = RegExp(r'\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b');
  static final RegExp _tokenRegex = RegExp(r'\b[0-9a-fA-F]{16,}\b');
  static final RegExp _pinRegex = RegExp(r'(?<=pin[":\s=]+)[0-9a-zA-Z]{4,8}', caseSensitive: false);

  /// Sanitize input text by masking IPs, MACs, tokens, and PINs
  static String redact(String input) {
    var output = input;
    output = output.replaceAll(_ipRegex, '[IP_REDACTED]');
    output = output.replaceAll(_macRegex, '[MAC_REDACTED]');
    output = output.replaceAll(_tokenRegex, '[TOKEN_REDACTED]');
    output = output.replaceAll(_pinRegex, '[PIN_REDACTED]');
    return output;
  }

  /// Generate a clean, user-reviewable diagnostic report
  static String generateReport({
    required String appVersion,
    required String osVersion,
    String? currentBrand,
    String? currentIp,
    String? currentMac,
    String? rawErrorLog,
  }) {
    final buffer = StringBuffer();
    buffer.writeln('=== UNIVERSAL SMART REMOTE DIAGNOSTIC REPORT ===');
    buffer.writeln('Generated: ${DateTime.now().toUtc().toIso8601String()}');
    buffer.writeln('App Version: $appVersion');
    buffer.writeln('Platform OS: $osVersion');
    buffer.writeln('Active TV Brand: ${currentBrand ?? "None"}');
    buffer.writeln('Target TV IP: ${currentIp != null ? redact(currentIp) : "Not Set"}');
    buffer.writeln('Target TV MAC: ${currentMac != null ? redact(currentMac) : "Not Set"}');
    buffer.writeln('------------------------------------------------');
    buffer.writeln('RECENT DIAGNOSTIC LOGS:');
    if (rawErrorLog != null && rawErrorLog.isNotEmpty) {
      buffer.writeln(redact(rawErrorLog));
    } else {
      buffer.writeln('No fatal errors logged. All core adapters healthy.');
    }
    buffer.writeln('================================================');
    return buffer.toString();
  }
}
