import 'package:flutter/material.dart';

class BreadcrumbItem {
  final String label;
  final VoidCallback? onTap;
  final bool isCurrent;

  const BreadcrumbItem({
    required this.label,
    this.onTap,
    this.isCurrent = false,
  });
}

class BreadcrumbBar extends StatelessWidget {
  final List<BreadcrumbItem> items;
  final VoidCallback? onHomeTap;

  const BreadcrumbBar({
    Key? key,
    required this.items,
    this.onHomeTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF261A13), // Dark Mocha background similar to Web header bar
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF38281E)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icono de Home
            InkWell(
              onTap: onHomeTap,
              borderRadius: BorderRadius.circular(4),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                child: Icon(
                  Icons.home_outlined,
                  size: 18,
                  color: Color(0xFFD4A373),
                ),
              ),
            ),

            for (int i = 0; i < items.length; i++) ...[
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 4),
                child: Icon(
                  Icons.chevron_right,
                  size: 16,
                  color: Color(0xFF8C7A6B),
                ),
              ),
              InkWell(
                onTap: items[i].isCurrent ? null : items[i].onTap,
                borderRadius: BorderRadius.circular(4),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Text(
                    items[i].label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: items[i].isCurrent ? FontWeight.bold : FontWeight.w500,
                      color: items[i].isCurrent
                          ? const Color(0xFFF59E0B) // Amber / Golden Crema highlight
                          : const Color(0xFFD4A373),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
