import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gestornotas_mobile/core/theme/cafeblend_theme.dart';
import 'package:gestornotas_mobile/modules/scanner/models/scanned_page.dart';
import 'package:gestornotas_mobile/modules/scanner/widgets/scanner_overlay.dart';
import 'package:gestornotas_mobile/modules/scanner/views/camera_scanner_view.dart';

void main() {
  group('Scanner Models & Overlay Tests', () {
    test('ScannedPage model serializes and instantiates correctly', () {
      final page = ScannedPage(
        pageNumber: 1,
        imagePath: '/tmp/exam_p1.jpg',
        qrData: 'EXAM_123_QR',
      );

      expect(page.pageNumber, 1);
      expect(page.imagePath, '/tmp/exam_p1.jpg');
      expect(page.qrData, 'EXAM_123_QR');

      final map = page.toMap();
      expect(map['page_number'], 1);
      expect(map['image_path'], '/tmp/exam_p1.jpg');
      expect(map['qr_data'], 'EXAM_123_QR');

      final reconstructed = ScannedPage.fromMap(map);
      expect(reconstructed.pageNumber, 1);
      expect(reconstructed.qrData, 'EXAM_123_QR');
    });

    testWidgets('ScannerOverlay renders QR calibrated text when isQrDetected is true',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ScannerOverlay(isQrDetected: true),
          ),
        ),
      );

      expect(find.text('✓ Código QR Calibrado'), findsOneWidget);
    });

    testWidgets('ScannerOverlay renders manual guide when isQrDetected is false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ScannerOverlay(isQrDetected: false),
          ),
        ),
      );

      expect(find.text('Alinee la hoja física'), findsOneWidget);
    });

    testWidgets('CameraScannerView renders title and switch mode',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: CafeBlendTheme.lightTheme(),
          home: const CameraScannerView(
            examId: 'exam-uuid-123',
            parallelName: 'Cálculo I - Grupo A',
            examHasQr: true,
          ),
        ),
      );

      expect(find.text('Cálculo I - Grupo A'), findsOneWidget);
      expect(find.text('Auto QR'), findsOneWidget);
      expect(find.byType(Switch), findsOneWidget);
      expect(find.text('Páginas del Alumno: 0'), findsOneWidget);
    });
  });
}
