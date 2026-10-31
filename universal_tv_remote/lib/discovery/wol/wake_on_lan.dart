import 'dart:io';
import 'dart:typed_data';
import '../../core/logging.dart';

/// Wake-on-LAN Packet Engine with Subnet Broadcast Support
class WakeOnLan {
  WakeOnLan._();

  /// Parse MAC address into 6-byte buffer
  static Uint8List parseMac(String mac) {
    final clean = mac.replaceAll(RegExp(r'[^0-9A-Fa-f]'), '');
    if (clean.length != 12) {
      throw ArgumentError('Invalid MAC address length: $mac');
    }
    final bytes = Uint8List(6);
    for (int i = 0; i < 6; i++) {
      bytes[i] = int.parse(clean.substring(i * 2, (i * 2) + 2), radix: 16);
    }
    return bytes;
  }

  /// Construct standard 102-byte Magic Packet
  static Uint8List createMagicPacket(String mac) {
    final macBytes = parseMac(mac);
    final packet = Uint8List(102);

    // 6 bytes of 0xFF
    for (int i = 0; i < 6; i++) {
      packet[i] = 0xFF;
    }

    // 16 repetitions of MAC address
    for (int rep = 0; rep < 16; rep++) {
      final offset = 6 + (rep * 6);
      for (int i = 0; i < 6; i++) {
        packet[offset + i] = macBytes[i];
      }
    }

    return packet;
  }

  /// Derive subnet broadcast address (e.g., 192.168.1.45/24 -> 192.168.1.255)
  static String calculateBroadcast(String ip, [String netmask = '255.255.255.0']) {
    try {
      final ipParts = ip.split('.').map(int.parse).toList();
      final maskParts = netmask.split('.').map(int.parse).toList();
      final bcastParts = List<int>.generate(4, (i) => ipParts[i] | (~maskParts[i] & 255));
      return bcastParts.join('.');
    } catch (_) {
      return '255.255.255.255';
    }
  }

  /// Send directed magic packet to port 9
  static Future<bool> send({
    required String mac,
    String? ip,
    int port = 9,
  }) async {
    try {
      final packet = createMagicPacket(mac);
      final targets = <InternetAddress>{
        InternetAddress('255.255.255.255'),
      };

      if (ip != null) {
        final subnetBcast = calculateBroadcast(ip);
        targets.add(InternetAddress(subnetBcast));
      }

      final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      socket.broadcastEnabled = true;

      for (final target in targets) {
        socket.send(packet, target, port);
        AppLogger.info('Sent WoL packet to $target:$port for MAC $mac');
      }

      await Future.delayed(const Duration(milliseconds: 50));
      socket.close();
      return true;
    } catch (e) {
      AppLogger.error('Failed to send WoL packet', e);
      return false;
    }
  }
}
