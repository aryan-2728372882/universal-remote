import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'adapters/android_tv/android_tv_adapter.dart';
import 'adapters/lg_webos/lg_webos_adapter.dart';
import 'adapters/remote_adapter.dart';
import 'adapters/roku/roku_adapter.dart';
import 'adapters/samsung/samsung_adapter.dart';
import 'core/theme.dart';
import 'data/device_repository.dart';
import 'data/models/device.dart';
import 'data/models/room.dart';
import 'data/secure_token_store.dart';
import 'discovery/discovery_service.dart';
import 'features/diagnostics/connection_doctor_screen.dart';
import 'features/home/home_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/pairing/pairing_wizard_screen.dart';
import 'features/remote/elder_remote.dart';
import 'features/remote/remote_screen.dart';
import 'features/settings/settings_screen.dart';
import 'services/sleep_timer_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final tokenStore = SecureTokenStore();
  final repository = DeviceRepository(prefs: prefs);
  final discovery = DiscoveryService();
  final sleepTimer = SleepTimerService();

  runApp(
    ProviderScope(
      child: UniversalRemoteApp(
        repository: repository,
        tokenStore: tokenStore,
        discovery: discovery,
        sleepTimer: sleepTimer,
      ),
    ),
  );
}

class UniversalRemoteApp extends StatefulWidget {
  final DeviceRepository repository;
  final SecureTokenStore tokenStore;
  final DiscoveryService discovery;
  final SleepTimerService sleepTimer;

  const UniversalRemoteApp({
    super.key,
    required this.repository,
    required this.tokenStore,
    required this.discovery,
    required this.sleepTimer,
  });

  @override
  State<UniversalRemoteApp> createState() => _UniversalRemoteAppState();
}

class _UniversalRemoteAppState extends State<UniversalRemoteApp> {
  Device? _activeDevice;
  Device? _pairingDevice;
  bool _showConnectionDoctor = false;
  bool _showSettings = false;
  bool _showOnboarding = false;
  AppSettings _settings = const AppSettings();

  @override
  void initState() {
    super.initState();
    _loadInitialState();
  }

  Future<void> _loadInitialState() async {
    final s = await widget.repository.getSettings();
    final devices = await widget.repository.getDevices();
    setState(() {
      _settings = s;
      if (devices.isEmpty) {
        _showOnboarding = true;
      }
    });
  }

  RemoteAdapter _resolveAdapter(DeviceBrand brand) {
    switch (brand) {
      case DeviceBrand.lgWebos:
        return LgWebosAdapter(tokenStore: widget.tokenStore);
      case DeviceBrand.androidTv:
        return AndroidTvAdapter(tokenStore: widget.tokenStore);
      case DeviceBrand.roku:
        return RokuAdapter();
      case DeviceBrand.samsung:
        return SamsungAdapter(tokenStore: widget.tokenStore);
      case DeviceBrand.generic:
      case DeviceBrand.sony:
      case DeviceBrand.fireTv:
        return LgWebosAdapter(tokenStore: widget.tokenStore);
    }
  }

  void _showSleepTimerDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTokens.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTokens.radiusLg)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Set Sleep Timer',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Automatically turn off TV after:',
                  style: TextStyle(fontSize: 12, color: AppTokens.textMuted),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 12,
                  runSpacing: 10,
                  children: [15, 30, 45, 60, 90].map((mins) {
                    return ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTokens.surfaceElevated,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                          side: const BorderSide(color: AppTokens.surfaceBorder),
                        ),
                      ),
                      onPressed: () {
                        widget.sleepTimer.start(
                          minutes: mins,
                          onExpire: () async {
                            if (_activeDevice != null) {
                              final adapter = _resolveAdapter(_activeDevice!.brand);
                              await adapter.powerOff();
                            }
                          },
                        );
                        Navigator.pop(context);
                      },
                      child: Text('$mins mins'),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),
                if (widget.sleepTimer.isActive)
                  TextButton(
                    onPressed: () {
                      widget.sleepTimer.cancel();
                      Navigator.pop(context);
                    },
                    child: const Text('Cancel Active Timer', style: TextStyle(color: AppTokens.accentRose)),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showAddByIpDialog() {
    final ipController = TextEditingController();
    final nameController = TextEditingController();
    DeviceBrand selectedBrand = DeviceBrand.lgWebos;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppTokens.surface,
          title: const Text('Add TV by IP', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'TV Name',
                  hintText: 'Living Room TV',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: ipController,
                decoration: const InputDecoration(
                  labelText: 'IP Address',
                  hintText: '192.168.1.100',
                ),
              ),
              const SizedBox(height: 12),
              DropdownButton<DeviceBrand>(
                value: selectedBrand,
                isExpanded: true,
                dropdownColor: AppTokens.surface,
                items: DeviceBrand.values.map((b) {
                  return DropdownMenuItem(value: b, child: Text(b.displayName));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedBrand = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final ip = ipController.text.trim();
                final name = nameController.text.trim().isEmpty ? selectedBrand.displayName : nameController.text.trim();
                if (ip.isNotEmpty) {
                  final newDev = Device(
                    id: 'dev_${ip.replaceAll('.', '_')}',
                    name: name,
                    brand: selectedBrand,
                    ip: ip,
                    protocol: 'LAN',
                    port: selectedBrand == DeviceBrand.roku ? 8060 : 3000,
                    lastSeen: DateTime.now(),
                    createdAt: DateTime.now(),
                  );
                  widget.repository.saveDevice(newDev);
                  Navigator.pop(context);
                  setState(() => _pairingDevice = newDev);
                }
              },
              child: const Text('Save & Pair'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget currentScreen;

    if (_showOnboarding) {
      currentScreen = OnboardingScreen(
        onFinish: () => setState(() => _showOnboarding = false),
      );
    } else if (_showConnectionDoctor) {
      currentScreen = ConnectionDoctorScreen(
        targetIp: _activeDevice?.ip,
      );
    } else if (_showSettings) {
      currentScreen = SettingsScreen(
        repository: widget.repository,
        onSettingsChanged: () async {
          final s = await widget.repository.getSettings();
          setState(() => _settings = s);
        },
      );
    } else if (_pairingDevice != null) {
      currentScreen = PairingWizardScreen(
        device: _pairingDevice!,
        adapter: _resolveAdapter(_pairingDevice!.brand),
        onPaired: () {
          setState(() {
            _activeDevice = _pairingDevice;
            _pairingDevice = null;
          });
        },
        onCancel: () => setState(() => _pairingDevice = null),
      );
    } else if (_activeDevice != null) {
      if (_settings.elderMode) {
        currentScreen = ElderRemoteScreen(
          device: _activeDevice!,
          adapter: _resolveAdapter(_activeDevice!.brand),
          onExitElderMode: () async {
            final updated = _settings.copyWith(elderMode: false);
            await widget.repository.saveSettings(updated);
            setState(() => _settings = updated);
          },
        );
      } else {
        currentScreen = RemoteScreen(
          device: _activeDevice!,
          adapter: _resolveAdapter(_activeDevice!.brand),
          sleepTimer: widget.sleepTimer,
          onOpenConnectionDoctor: () => setState(() => _showConnectionDoctor = true),
          onOpenSleepTimer: _showSleepTimerDialog,
          onBack: () => setState(() => _activeDevice = null),
        );
      }
    } else {
      currentScreen = HomeScreen(
        repository: widget.repository,
        discoveryService: widget.discovery,
        onSelectDevice: (d) => setState(() => _activeDevice = d),
        onPairDevice: (d) => setState(() => _pairingDevice = d),
        onOpenConnectionDoctor: () => setState(() => _showConnectionDoctor = true),
        onOpenSettings: () => setState(() => _showSettings = true),
        onAddDeviceManual: _showAddByIpDialog,
      );
    }

    return MaterialApp(
      title: 'Universal Remote',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: PopScope(
        canPop: _activeDevice == null && !_showConnectionDoctor && !_showSettings && _pairingDevice == null,
        onPopInvokedWithResult: (didPop, _) {
          if (didPop) return;
          setState(() {
            _showConnectionDoctor = false;
            _showSettings = false;
            _pairingDevice = null;
            _activeDevice = null;
          });
        },
        child: currentScreen,
      ),
    );
  }
}
