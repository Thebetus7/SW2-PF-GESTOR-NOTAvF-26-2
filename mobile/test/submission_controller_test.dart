import 'package:flutter_test/flutter_test.dart';
import 'package:gestornotas_mobile/modules/scanner/controllers/submission_controller.dart';
import 'package:gestornotas_mobile/modules/scanner/models/scanned_page.dart';

void main() {
  group('SubmissionController Tests', () {
    test('addPage and removePageAt re-indexes pages correctly', () {
      final controller = SubmissionController();

      controller.addPage(ScannedPage(pageNumber: 1, imagePath: '/path/p1.jpg'));
      controller.addPage(ScannedPage(pageNumber: 2, imagePath: '/path/p2.jpg'));
      controller.addPage(ScannedPage(pageNumber: 3, imagePath: '/path/p3.jpg'));

      expect(controller.pages.length, 3);
      expect(controller.pages[0].pageNumber, 1);
      expect(controller.pages[1].pageNumber, 2);
      expect(controller.pages[2].pageNumber, 3);

      // Remove middle page
      controller.removePageAt(1);

      expect(controller.pages.length, 2);
      expect(controller.pages[0].pageNumber, 1);
      expect(controller.pages[0].imagePath, '/path/p1.jpg');
      expect(controller.pages[1].pageNumber, 2); // Re-indexed from 3 to 2
      expect(controller.pages[1].imagePath, '/path/p3.jpg');
    });

    test('submitExamSubmission fails when pages list is empty', () async {
      final controller = SubmissionController();

      final success = await controller.submitExamSubmission(
        examId: 'exam-123',
        parallelId: 'parallel-456',
      );

      expect(success, false);
      expect(controller.status, SubmissionStatus.initial);
      expect(controller.errorMessage, 'No hay páginas escaneadas para enviar');
    });

    test('clearPages resets state', () {
      final controller = SubmissionController();
      controller.addPage(ScannedPage(pageNumber: 1, imagePath: '/path/p1.jpg'));
      expect(controller.pages.isNotEmpty, true);

      controller.clearPages();
      expect(controller.pages.isEmpty, true);
      expect(controller.status, SubmissionStatus.initial);
      expect(controller.errorMessage, null);
    });
  });
}
