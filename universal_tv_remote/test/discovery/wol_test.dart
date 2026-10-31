import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:universal_tv_remote/discovery/wol/wake_on_lan.dart';

void main() {
  group('WakeOnLan Tests', () {
    test('parseMac correctly converts colon and hyphen formats', () {
      final mac1 = WakeOnLan.parseMac('AA:BB:CC:DD:EE:FF');
      expect(mac1, Uint8List.fromList([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]));

      final mac2 = WakeOnLan.parseMac('aa-bb-cc-dd-ee-ff');
      expect(mac2, Uint8List.fromList([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]));

      final mac3 = WakeOnLan.parseMac('AABBCCDDEEFF');
      expect(mac3, Uint8List.fromList([0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]));
    });

    test('parseMac throws ArgumentError on malformed MAC', () {
      expect(() => WakeOnLan.parseMac('invalid-mac'), throwsArgumentError);
      expect(() => WakeOnLan.parseMac('AA:BB:CC:DD:EE'), throwsArgumentError);
    });

    test('createMagicPacket produces exact 102 bytes with 6x0xFF and 16xMAC', () {
      const macStr = '12:34:56:78:9A:BC';
      final packet = WakeOnLan.createMagicPacket(macStr);

      expect(packet.length, 102);

      // First 6 bytes are 0xFF
      for (int i = 0; i < 6; i++) {
        expect(packet[i], 0xFF, reason: 'Byte $i must be 0xFF');
      }

      // 16 repetitions of MAC
      final macBytes = [0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC];
      for (int rep = 0; rep < 16; rep++) {
        final offset = 6 + (rep * 6);
        for (int i = 0; i < 6; i++) {
          expect(packet[offset + i], macBytes[i],
              reason: 'MAC byte mismatch at rep $rep, index $i');
        }
      }
    });

    test('calculateBroadcast derives correct directed subnet broadcast', () {
      expect(WakeOnLan.calculateBroadcast('192.168.1.45'), '192.168.1.255');
      expect(WakeOnLan.calculateBroadcast('10.0.4.150'), '10.0.4.255');
      expect(WakeOnLan.calculateBroadcast('172.16.20.5'), '172.16.20.255');
      expect(WakeOnLan.calculateBroadcast('invalid-ip'), '255.255.255.255');
    });
  });
}
