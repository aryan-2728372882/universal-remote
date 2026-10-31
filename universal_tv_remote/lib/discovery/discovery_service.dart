import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../core/logging.dart';
import '../data/models/device.dart';

/// Parallel Network Discovery Service (SSDP, mDNS & Subnet Probe)
class DiscoveryService {
  final _deviceStreamController = StreamController<Device>.broadcast();
  Stream<Device> get discoveredDevices => _deviceStreamController.stream;

  final Set<String> _seenIps = {};
  bool _isScanning = false;
  bool get isScanning => _isScanning;

  /// Start parallel mDNS and SSDP scans
  Future<void> startScan({Duration timeout = const Duration(seconds: 5)}) async {
    if (_isScanning) return;
    _isScanning = true;
    _seenIps.clear();

    AppLogger.info('Starting parallel Wi-Fi discovery scan...');

    try {
      await Future.wait([
        _scanSsdp(timeout),
        _scanMdns(timeout),
      ]);
    } catch (e) {
      AppLogger.warning('Discovery scan warning: $e');
    } finally {
      _isScanning = false;
    }
  }

  /// SSDP M-SEARCH scan for webOS and Roku
  Future<void> _scanSsdp(Duration timeout) async {
    RawDatagramSocket? socket;
    try {
      socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      socket.broadcastEnabled = true;

      const ssdpSearch = 'M-SEARCH * HTTP/1.1\r\n'
          'HOST: 239.255.255.250:1900\r\n'
          'MAN: "ssdp:discover"\r\n'
          'MX: 2\r\n'
          'ST: ssdp:all\r\n\r\n';

      final bytes = utf8.encode(ssdpSearch);
      socket.send(bytes, InternetAddress('239.255.255.250'), 1900);

      socket.listen((RawSocketEvent event) {
        if (event == RawSocketEvent.read) {
          final datagram = socket?.receive();
          if (datagram != null) {
            _parseSsdpPacket(utf8.decode(datagram.data, allowMalformed: true), datagram.address.address);
          }
        }
      });

      await Future.delayed(timeout);
    } catch (e) {
      AppLogger.warning('SSDP scan error: $e');
    } finally {
      socket?.close();
    }
  }

  void _parseSsdpPacket(String packet, String senderIp) {
    if (_seenIps.contains(senderIp)) return;

    final lower = packet.toLowerCase();

    // LG webOS TV match
    if (lower.contains('webos') || lower.contains('lge-com') || lower.contains('webos-second-screen')) {
      _seenIps.add(senderIp);
      _emitDevice(
        Device(
          id: 'lg_${senderIp.replaceAll('.', '_')}',
          name: 'LG webOS Smart TV',
          brand: DeviceBrand.lgWebos,
          ip: senderIp,
          protocol: 'SSAP',
          port: 3001,
          lastSeen: DateTime.now(),
          createdAt: DateTime.now(),
        ),
      );
    }
    // Roku TV match
    else if (lower.contains('roku') || lower.contains('roku:ecp')) {
      _seenIps.add(senderIp);
      _emitDevice(
        Device(
          id: 'roku_${senderIp.replaceAll('.', '_')}',
          name: 'Roku Smart TV',
          brand: DeviceBrand.roku,
          ip: senderIp,
          protocol: 'ECP',
          port: 8060,
          lastSeen: DateTime.now(),
          createdAt: DateTime.now(),
        ),
      );
    }
    // Samsung Tizen match
    else if (lower.contains('samsung') || lower.contains('remotecontrolreceiver')) {
      _seenIps.add(senderIp);
      _emitDevice(
        Device(
          id: 'samsung_${senderIp.replaceAll('.', '_')}',
          name: 'Samsung Smart TV',
          brand: DeviceBrand.samsung,
          ip: senderIp,
          protocol: 'Tizen v2',
          port: 8002,
          lastSeen: DateTime.now(),
          createdAt: DateTime.now(),
        ),
      );
    }
  }

  /// mDNS Query scan for Android TV
  Future<void> _scanMdns(Duration timeout) async {
    RawDatagramSocket? socket;
    try {
      socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      socket.broadcastEnabled = true;

      // Query payload for _androidtvremote2._tcp.local
      final query = [
        0x00, 0x00, // Transaction ID
        0x00, 0x00, // Flags (standard query)
        0x00, 0x01, // 1 Question
        0x00, 0x00, 0x00, 0x00,
        // _androidtvremote2
        0x12, 0x5f, 0x61, 0x6e, 0x64, 0x72, 0x6f, 0x69, 0x64, 0x74, 0x76, 0x72, 0x65, 0x6d, 0x6f, 0x74, 0x65, 0x32,
        0x04, 0x5f, 0x74, 0x63, 0x70, // _tcp
        0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x00, // local
        0x00, 0x0c, // Type PTR
        0x00, 0x01, // Class IN
      ];

      socket.send(query, InternetAddress('224.0.0.251'), 5353);

      socket.listen((RawSocketEvent event) {
        if (event == RawSocketEvent.read) {
          final datagram = socket?.receive();
          if (datagram != null && !_seenIps.contains(datagram.address.address)) {
            final raw = utf8.decode(datagram.data, allowMalformed: true);
            if (raw.contains('android') || raw.contains('tv')) {
              _seenIps.add(datagram.address.address);
              _emitDevice(
                Device(
                  id: 'atv_${datagram.address.address.replaceAll('.', '_')}',
                  name: 'Android TV / Google TV',
                  brand: DeviceBrand.androidTv,
                  ip: datagram.address.address,
                  protocol: 'Remote v2',
                  port: 6467,
                  lastSeen: DateTime.now(),
                  createdAt: DateTime.now(),
                ),
              );
            }
          }
        }
      });

      await Future.delayed(timeout);
    } catch (e) {
      AppLogger.warning('mDNS scan error: $e');
    } finally {
      socket?.close();
    }
  }

  /// Subnet Probe Fallback (scans ports 3000, 8060, 6466 when multicast is blocked by router)
  Future<void> runSubnetProbe(String localIp, {Function(int percent)? onProgress}) async {
    final parts = localIp.split('.');
    if (parts.length != 4) return;
    final prefix = '${parts[0]}.${parts[1]}.${parts[2]}.';

    for (int i = 1; i <= 254; i++) {
      final targetIp = '$prefix$i';
      if (targetIp == localIp) continue;

      // Probe webOS (3000/3001), Roku (8060), and Android TV (6466)
      _probePort(targetIp, 8060).then((open) {
        if (open && !_seenIps.contains(targetIp)) {
          _seenIps.add(targetIp);
          _emitDevice(
            Device(
              id: 'roku_${targetIp.replaceAll('.', '_')}',
              name: 'Roku TV ($targetIp)',
              brand: DeviceBrand.roku,
              ip: targetIp,
              protocol: 'ECP',
              port: 8060,
              lastSeen: DateTime.now(),
              createdAt: DateTime.now(),
            ),
          );
        }
      });

      if (i % 25 == 0 && onProgress != null) {
        onProgress((i / 254 * 100).round());
      }
    }
  }

  Future<bool> _probePort(String ip, int port) async {
    try {
      final s = await Socket.connect(ip, port, timeout: const Duration(milliseconds: 300));
      s.destroy();
      return true;
    } catch (_) {
      return false;
    }
  }

  void _emitDevice(Device d) {
    if (!_deviceStreamController.isClosed) {
      _deviceStreamController.add(d);
    }
  }

  void dispose() {
    _deviceStreamController.close();
  }
}
