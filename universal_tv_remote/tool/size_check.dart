// ignore_for_file: avoid_print
import 'dart:io';

void main() {
  final apkDir = Directory('build/app/outputs/flutter-apk');
  if (!apkDir.existsSync()) {
    print('APK output directory does not exist: ${apkDir.path}');
    exit(1);
  }

  final apks = apkDir.listSync().whereType<File>().where((f) => f.path.endsWith('.apk')).toList();

  if (apks.isEmpty) {
    print('No APKs found in ${apkDir.path}');
    exit(1);
  }

  print('=== APK SIZE REPORT ===');
  bool allPass = true;

  for (final apk in apks) {
    final bytes = apk.lengthSync();
    final mb = bytes / (1024 * 1024);
    final filename = apk.uri.pathSegments.last;
    final isArm64 = filename.contains('arm64-v8a');
    final status = (isArm64 && mb > 15.0) ? 'FAIL (>15MB)' : 'PASS';
    if (status.contains('FAIL')) allPass = false;

    print('${filename.padRight(40)}: ${mb.toStringAsFixed(2).padLeft(6)} MB [$status]');
  }

  if (!allPass) {
    print('FAIL: arm64 APK exceeded budget of 15.0 MB');
    exit(1);
  } else {
    print('SUCCESS: All release APKs within budget!');
  }
}
