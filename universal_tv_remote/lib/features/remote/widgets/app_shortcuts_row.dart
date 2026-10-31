import 'package:flutter/material.dart';
import 'brand_logos.dart';
import 'tactile_button.dart';

/// Popular Smart TV Apps in India Quick Launcher Grid with Authentic Brand Logos
class AppShortcutsRow extends StatelessWidget {
  final Function(String appName, String appId) onLaunchApp;
  final VoidCallback? onOpenAllApps;

  const AppShortcutsRow({
    super.key,
    required this.onLaunchApp,
    this.onOpenAllApps,
  });

  @override
  Widget build(BuildContext context) {
    final apps = [
      {'name': 'JioHotstar', 'id': 'hotstar'},
      {'name': 'Netflix', 'id': 'netflix'},
      {'name': 'Prime', 'id': 'prime'},
      {'name': 'YouTube', 'id': 'youtube'},
      {'name': 'ZEE5', 'id': 'zee5'},
      {'name': 'SonyLIV', 'id': 'sonyliv'},
      {'name': 'JioCinema', 'id': 'jiocinema'},
      {'name': 'MX Player', 'id': 'mxplayer'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8, right: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  'POPULAR TV APPS IN INDIA',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: Color(0xFF8A99AD),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (onOpenAllApps != null)
                GestureDetector(
                  onTap: onOpenAllApps,
                  child: const Text(
                    'All Apps →',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF00F2FE),
                    ),
                  ),
                ),
            ],
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 1.45,
          ),
          itemCount: apps.length,
          itemBuilder: (context, index) {
            final app = apps[index];
            return TactileButton(
              padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
              borderRadius: BorderRadius.circular(14),
              backgroundColor: const Color(0xFF1E2538),
              borderColor: Colors.white.withOpacity(0.08),
              onTap: () => onLaunchApp(app['name']!, app['id']!),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  BrandLogo(appId: app['id']!, size: 20),
                  const SizedBox(height: 3),
                  Text(
                    app['name']!,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFF0F4F8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
