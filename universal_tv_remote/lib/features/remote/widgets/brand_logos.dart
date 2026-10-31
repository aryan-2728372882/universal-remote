import 'package:flutter/material.dart';

/// Authentic Brand Logo Badges for Popular Smart TV Apps in India
class BrandLogo extends StatelessWidget {
  final String appId;
  final double size;

  const BrandLogo({super.key, required this.appId, this.size = 24});

  @override
  Widget build(BuildContext context) {
    switch (appId.toLowerCase()) {
      case 'netflix':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(size * 0.22),
          ),
          child: Center(
            child: Text(
              'N',
              style: TextStyle(
                fontFamily: 'serif',
                fontWeight: FontWeight.w900,
                fontSize: size * 0.75,
                color: const Color(0xFFE50914),
              ),
            ),
          ),
        );

      case 'youtube':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFFFF0000),
            borderRadius: BorderRadius.circular(size * 0.28),
          ),
          child: Center(
            child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: size * 0.75),
          ),
        );

      case 'prime':
      case 'primevideo':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF00A8E1),
            borderRadius: BorderRadius.circular(size * 0.22),
          ),
          child: Center(
            child: Text(
              'prime',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: size * 0.32,
                color: Colors.white,
              ),
            ),
          ),
        );

      case 'hotstar':
      case 'jiohotstar':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF071426),
            borderRadius: BorderRadius.circular(size * 0.22),
            border: Border.all(color: const Color(0xFF0077FF), width: 1.2),
          ),
          child: Center(
            child: Icon(Icons.star_rounded, color: const Color(0xFF00D2FF), size: size * 0.65),
          ),
        );

      case 'zee5':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF8F00FF),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              'Z5',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: size * 0.42,
                color: Colors.white,
              ),
            ),
          ),
        );

      case 'sonyliv':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(size * 0.22),
            border: Border.all(color: const Color(0xFFFF6600), width: 1),
          ),
          child: Center(
            child: Text(
              'LIV',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: size * 0.35,
                color: const Color(0xFFFF6600),
              ),
            ),
          ),
        );

      case 'jiocinema':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF9900FF),
            borderRadius: BorderRadius.circular(size * 0.22),
          ),
          child: Center(
            child: Icon(Icons.movie_filter_rounded, color: Colors.white, size: size * 0.65),
          ),
        );

      case 'mxplayer':
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF0284C7),
            borderRadius: BorderRadius.circular(size * 0.22),
          ),
          child: Center(
            child: Icon(Icons.play_circle_fill_rounded, color: const Color(0xFF00E676), size: size * 0.7),
          ),
        );

      default:
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(size * 0.22),
          ),
          child: Center(
            child: Icon(Icons.tv_rounded, color: Colors.white, size: size * 0.6),
          ),
        );
    }
  }
}
