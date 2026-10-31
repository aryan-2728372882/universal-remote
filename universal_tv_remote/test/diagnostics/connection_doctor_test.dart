import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/diagnostics/connection_doctor/connection_doctor.dart';

void main() {
  group('ConnectionDoctor Tests', () {
    test('Initializes with 8 comprehensive diagnostic steps', () {
      final doctor = ConnectionDoctor();
      expect(doctor.steps.length, 8);
      expect(doctor.steps[0].id, 'wifi_state');
      expect(doctor.steps[1].id, 'subnet');
      expect(doctor.steps[2].id, 'ap_isolation');
      expect(doctor.steps[3].id, 'vpn_check');
      expect(doctor.steps[4].id, 'multicast');
      expect(doctor.steps[5].id, 'tv_standby');
      expect(doctor.steps[6].id, 'protocol_port');
      expect(doctor.steps[7].id, 'pairing_token');
    });

    test('runDiagnostics streams progress and updates steps', () async {
      final doctor = ConnectionDoctor();
      final updates = <List<DoctorStep>>[];

      await for (final stepList in doctor.runDiagnostics()) {
        updates.add(stepList);
      }

      expect(updates, isNotEmpty);
      final finalReport = updates.last;
      expect(finalReport.length, 8);
      // All steps should have progressed past pending
      for (final step in finalReport) {
        expect(step.status, isNot(DoctorStepStatus.pending));
      }
    });

    test('DoctorStep copyWith updates values correctly', () {
      const step = DoctorStep(id: 'test', title: 'Test Step');
      final updated = step.copyWith(
        status: DoctorStepStatus.passed,
        details: 'All good',
        fixSuggestion: 'None needed',
      );

      expect(updated.id, 'test');
      expect(updated.status, DoctorStepStatus.passed);
      expect(updated.details, 'All good');
      expect(updated.fixSuggestion, 'None needed');
    });
  });
}
