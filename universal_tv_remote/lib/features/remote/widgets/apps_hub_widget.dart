import 'package:flutter/material.dart';
import 'brand_logos.dart';
import 'tactile_button.dart';

class AppsHubWidget extends StatefulWidget {
  final Function(String appName, String appId) onLaunchApp;

  const AppsHubWidget({super.key, required this.onLaunchApp});

  @override
  State<AppsHubWidget> createState() => _AppsHubWidgetState();
}

class _AppsHubWidgetState extends State<AppsHubWidget> {
  String _search = '';
  String _activeCategory = 'All';

  final apps = const [
    {'name': 'JioHotstar', 'id': 'hotstar', 'category': 'Live Cricket & Shows'},
    {'name': 'Netflix', 'id': 'netflix', 'category': 'Movies & Global Series'},
    {'name': 'Prime Video', 'id': 'prime', 'category': 'Movies & Amazon Originals'},
    {'name': 'YouTube', 'id': 'youtube', 'category': 'Videos & Music'},
    {'name': 'ZEE5', 'id': 'zee5', 'category': 'Regional & Hindi Shows'},
    {'name': 'SonyLIV', 'id': 'sonyliv', 'category': 'Live Sports & Shows'},
    {'name': 'JioCinema', 'id': 'jiocinema', 'category': 'Movies & HBO Max'},
    {'name': 'MX Player', 'id': 'mxplayer', 'category': 'Web Series & Music'},
    {'name': 'Spotify', 'id': 'spotify', 'category': 'Music & Podcasts'},
    {'name': 'Apple TV+', 'id': 'appletv', 'category': 'Apple Originals'},
  ];

  final categories = ['All', 'Movies', 'Sports', 'Music', 'Regional'];

  @override
  Widget build(BuildContext context) {
    final filtered = apps.where((app) {
      final matchesSearch = app['name']!.toLowerCase().contains(_search.toLowerCase());
      final matchesCategory = _activeCategory == 'All' || app['category']!.contains(_activeCategory);
      return matchesSearch && matchesCategory;
    }).toList();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF161B2A).withOpacity(0.92),
        borderRadius: BorderRadius.circular(44),
        border: Border.all(color: Colors.white.withOpacity(0.12), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF00F2FE),
                        boxShadow: [BoxShadow(color: Color(0xFF00F2FE), blurRadius: 8)],
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'SMART TV APPS',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF00F2FE).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF00F2FE).withOpacity(0.35)),
                ),
                child: const Text(
                  '1-Tap Launch',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF00F2FE)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Search Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.35),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                icon: Icon(Icons.search_rounded, size: 18, color: Colors.white60),
                hintText: 'Search TV apps, movies, sports...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 12),
                border: InputBorder.none,
              ),
              onChanged: (val) => setState(() => _search = val),
            ),
          ),
          const SizedBox(height: 12),

          // Category Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: categories.map((cat) {
                final isSelected = _activeCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => setState(() => _activeCategory = cat),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF00F2FE) : Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isSelected ? const Color(0xFF07090E) : Colors.white70,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),

          // Apps Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.1,
            ),
            itemCount: filtered.length,
            itemBuilder: (context, idx) {
              final a = filtered[idx];
              return TactileButton(
                padding: const EdgeInsets.all(10),
                borderRadius: BorderRadius.circular(16),
                backgroundColor: const Color(0xFF1E2538),
                onTap: () => widget.onLaunchApp(a['name']!, a['id']!),
                child: Row(
                  children: [
                    BrandLogo(appId: a['id']!, size: 30),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            a['name']!,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            a['category']!,
                            style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: Color(0xFF8A99AD)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
