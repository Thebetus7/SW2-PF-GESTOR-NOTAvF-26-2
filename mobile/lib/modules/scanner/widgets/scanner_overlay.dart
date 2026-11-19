import 'package:flutter/material.dart';

class ScannerOverlay extends StatelessWidget {
  final bool isQrDetected;

  const ScannerOverlay({
    Key? key,
    required this.isQrDetected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = constraints.maxHeight;

        // Marco proporcional para hoja tamaño carta / examen físico
        final frameWidth = width * 0.85;
        final frameHeight = height * 0.70;

        return Stack(
          alignment: Alignment.center,
          children: [
            // Fondo semitransparente oscuro con corte central
            CustomPaint(
              size: Size(width, height),
              painter: _OverlayPainter(
                frameWidth: frameWidth,
                frameHeight: frameHeight,
                isDetected: isQrDetected,
              ),
            ),

            // Marco decorativo y esquinas de enfoque
            Container(
              width: frameWidth,
              height: frameHeight,
              decoration: BoxDecoration(
                border: Border.all(
                  color: isQrDetected ? const Color(0xFF059669) : Colors.white70,
                  width: isQrDetected ? 3.0 : 1.5,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
            ),

            // Banner superior de estado
            Positioned(
              top: (height - frameHeight) / 2 - 48,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                decoration: BoxDecoration(
                  color: isQrDetected
                      ? const Color(0xFF059669).withOpacity(0.9)
                      : Colors.black.withOpacity(0.65),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isQrDetected ? Icons.check_circle_outline : Icons.crop_free,
                      color: Colors.white,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isQrDetected ? '✓ Código QR Calibrado' : 'Alinee la hoja física',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _OverlayPainter extends CustomPainter {
  final double frameWidth;
  final double frameHeight;
  final bool isDetected;

  _OverlayPainter({
    required this.frameWidth,
    required this.frameHeight,
    required this.isDetected,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final backgroundPaint = Paint()..color = Colors.black.withOpacity(0.5);

    final left = (size.width - frameWidth) / 2;
    final top = (size.height - frameHeight) / 2;
    final frameRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(left, top, frameWidth, frameHeight),
      const Radius.circular(16),
    );

    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(frameRect)
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, backgroundPaint);
  }

  @override
  bool shouldRepaint(covariant _OverlayPainter oldDelegate) {
    return oldDelegate.isDetected != isDetected ||
        oldDelegate.frameWidth != frameWidth ||
        oldDelegate.frameHeight != frameHeight;
  }
}
