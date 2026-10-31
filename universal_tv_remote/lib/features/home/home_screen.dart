import 'package:flutter/material.dart';
import '../../core/haptics.dart';
import '../../core/theme.dart';
import '../../data/device_repository.dart';
import '../../data/models/device.dart';
import '../../data/models/room.dart';
import '../../discovery/discovery_service.dart';
import '../remote/widgets/tactile_button.dart';

/// Home Dashboard Screen
class HomeScreen extends StatefulWidget {
  final DeviceRepository repository;
  final DiscoveryService discoveryService;
  final Function(Device device) onSelectDevice;
  final Function(Device device) onPairDevice;
  final VoidCallback onOpenConnectionDoctor;
  final VoidCallback onOpenSettings;
  final VoidCallback onAddDeviceManual;

  const HomeScreen({
    super.key,
    required this.repository,
    required this.discoveryService,
    required this.onSelectDevice,
    required this.onPairDevice,
    required this.onOpenConnectionDoctor,
    required this.onOpenSettings,
    required this.onAddDeviceManual,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Device> _savedDevices = [];
  List<Room> _rooms = [];
  String _selectedRoom = 'All';
  final List<Device> _discoveredDevices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _setupDiscoveryListener();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final devs = await widget.repository.getDevices();
    final rms = await widget.repository.getRooms();
    setState(() {
      _savedDevices = devs;
      _rooms = rms;
      _isLoading = false;
    });
  }

  void _setupDiscoveryListener() {
    widget.discoveryService.discoveredDevices.listen((device) {
      if (mounted) {
        final alreadySaved = _savedDevices.any((d) => d.ip == device.ip);
        final alreadyDiscovered = _discoveredDevices.any((d) => d.ip == device.ip);
        if (!alreadySaved && !alreadyDiscovered) {
          setState(() {
            _discoveredDevices.add(device);
          });
        }
      }
    });
  }

  void _triggerScan() {
    HapticsService.feedback(HapticType.light);
    setState(() => _discoveredDevices.clear());
    widget.discoveryService.startScan();
  }

  @override
  Widget build(BuildContext context) {
    final filteredDevices = _selectedRoom == 'All'
        ? _savedDevices
        : _savedDevices.where((d) => d.room == _selectedRoom).toList();

    return Scaffold(
      backgroundColor: AppTokens.background,
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.settings_remote_rounded, color: AppTokens.primary, size: 24),
            SizedBox(width: 8),
            Text('Universal Remote'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.healing_rounded, color: AppTokens.accentCyan),
            onPressed: widget.onOpenConnectionDoctor,
            tooltip: 'Connection Doctor',
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded, color: AppTokens.textPrimary),
            onPressed: widget.onAddDeviceManual,
            tooltip: 'Add TV by IP',
          ),
          IconButton(
            icon: const Icon(Icons.settings_rounded, color: AppTokens.textSecondary),
            onPressed: widget.onOpenSettings,
            tooltip: 'Settings',
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTokens.primary,
          backgroundColor: AppTokens.surface,
          onRefresh: () async {
            _triggerScan();
            await _loadData();
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            children: [
              // 1. Room Switcher Tabs
              _buildRoomTabs(),

              const SizedBox(height: 12),

              // 2. Discovered Devices Strip
              if (_discoveredDevices.isNotEmpty) _buildDiscoveredStrip(),

              // 3. Saved Devices List or Empty State
              if (_isLoading)
                const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator()))
              else if (filteredDevices.isEmpty)
                _buildEmptyState()
              else
                ...filteredDevices.map((d) => _buildDeviceCard(d)),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoomTabs() {
    final allRooms = ['All', ..._rooms.map((r) => r.name)];

    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: allRooms.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final room = allRooms[index];
          final isSelected = _selectedRoom == room;

          return GestureDetector(
            onTap: () {
              HapticsService.feedback(HapticType.selection);
              setState(() => _selectedRoom = room);
            },
            child: AnimatedContainer(
              duration: AppTokens.durationFast,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTokens.primary : AppTokens.surface,
                borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                border: Border.all(
                  color: isSelected ? AppTokens.primary : AppTokens.surfaceBorder,
                ),
              ),
              child: Text(
                room,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppTokens.textSecondary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDiscoveredStrip() {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTokens.surfaceElevated,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.primary.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTokens.accentEmerald),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Discovered on Wi-Fi (${_discoveredDevices.length})',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ],
              ),
              const Icon(Icons.wifi_tethering_rounded, size: 16, color: AppTokens.primary),
            ],
          ),
          const SizedBox(height: 8),
          ..._discoveredDevices.map(
            (d) => ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.tv_rounded, color: AppTokens.primary),
              title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              subtitle: Text('${d.ip} • ${d.brand.displayName}', style: const TextStyle(fontSize: 11, color: AppTokens.textMuted)),
              trailing: TactileButton(
                height: 32,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                backgroundColor: AppTokens.primary,
                onTap: () {
                  widget.repository.saveDevice(d);
                  widget.onPairDevice(d);
                },
                child: const Text('Pair', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceCard(Device device) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.surfaceBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          onTap: () {
            HapticsService.feedback(HapticType.light);
            widget.onSelectDevice(device);
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Icon
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: AppTokens.surfaceElevated,
                    borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                    border: Border.all(color: AppTokens.surfaceBorder),
                  ),
                  child: const Center(
                    child: Icon(Icons.tv_rounded, size: 28, color: AppTokens.primary),
                  ),
                ),
                const SizedBox(width: 14),
                // Titles
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        device.name,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTokens.accentEmerald,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${device.brand.displayName} • ${device.ip}',
                            style: const TextStyle(fontSize: 11, color: AppTokens.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Power Toggle
                TactileButton(
                  width: 44,
                  height: 44,
                  padding: EdgeInsets.zero,
                  backgroundColor: AppTokens.surfaceElevated,
                  borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                  onTap: () {
                    // Send quick power toggle to device
                    widget.onSelectDevice(device);
                  },
                  child: const Icon(Icons.power_settings_new_rounded, size: 20, color: AppTokens.accentRose),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(AppTokens.radiusLg),
        border: Border.all(color: AppTokens.surfaceBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.tv_off_rounded, size: 48, color: AppTokens.textMuted),
          const SizedBox(height: 16),
          const Text(
            'No TVs Connected',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppTokens.textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Make sure your TV is turned on from the wall socket and connected to the same Wi-Fi router.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppTokens.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 20),
          TactileButton(
            height: 46,
            backgroundColor: AppTokens.primary,
            onTap: _triggerScan,
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.refresh_rounded, size: 18, color: Colors.white),
                SizedBox(width: 8),
                Text('Scan Wi-Fi Network', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: widget.onOpenConnectionDoctor,
            child: const Text("Can't find my TV? Run Connection Doctor", style: TextStyle(color: AppTokens.accentAmber, fontSize: 12, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
