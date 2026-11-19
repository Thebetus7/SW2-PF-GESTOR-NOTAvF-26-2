import 'dart:io';
import 'package:flutter/material.dart';
import '../controllers/submission_controller.dart';

class ReviewPagesView extends StatefulWidget {
  final String examId;
  final String? parallelId;
  final SubmissionController controller;

  const ReviewPagesView({
    Key? key,
    required this.examId,
    this.parallelId,
    required this.controller,
  }) : super(key: key);

  @override
  State<ReviewPagesView> createState() => _ReviewPagesViewState();
}

class _ReviewPagesViewState extends State<ReviewPagesView> {
  final TextEditingController _studentIdCtrl = TextEditingController();

  @override
  void dispose() {
    _studentIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final success = await widget.controller.submitExamSubmission(
      examId: widget.examId,
      parallelId: widget.parallelId,
      studentIdentifier: _studentIdCtrl.text.trim().isEmpty ? null : _studentIdCtrl.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      final result = widget.controller.lastResult;
      final studentName = result?['student_name'] ?? result?['raw_student_name'] ?? 'Identificado por IA';
      final statusStr = result?['status'] ?? 'EN_REVISION';
      final score = result?['ai_total_score'] ?? result?['final_score'] ?? 0;

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: Color(0xFF059669), size: 28),
              SizedBox(width: 10),
              Text('Examen Registrado', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Las ${widget.controller.pages.length} páginas JPG han sido guardadas en el backend y evaluadas con Gemini AI.',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDF6EC),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE8DCC8)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('👤 Alumno: $studentName', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('📊 Estado: $statusStr', style: const TextStyle(fontSize: 13)),
                    const SizedBox(height: 4),
                    Text('🎯 Puntaje Asignado: $score pts', style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF8B5E3C))),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5E3C),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {
                Navigator.of(ctx).pop(); // Cierra diálogo
                widget.controller.clearPages();
                Navigator.of(context).pop(); // Regresa al escáner de cámara
              },
              child: const Text('Escanear Siguiente Examen'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          content: Text(widget.controller.errorMessage ?? 'Error al enviar examen al backend'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        final pages = widget.controller.pages;
        final isSubmitting = widget.controller.status == SubmissionStatus.submitting;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Revisar Páginas del Alumno'),
            backgroundColor: const Color(0xFF8B5E3C),
            foregroundColor: Colors.white,
          ),
          body: isSubmitting
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      CircularProgressIndicator(color: Color(0xFF8B5E3C)),
                      SizedBox(height: 20),
                      Text(
                        'Enviando fotos JPG al backend...\nProcesando evaluación con Google Gemini AI',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tarjeta de cabecera informativa
                      Card(
                        elevation: 1,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.photo_library, color: Color(0xFF8B5E3C)),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Páginas agrupadas: ${pages.length}',
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Verifique el orden de las páginas. Al confirmar, los archivos JPG se transmitirán al backend para su almacenamiento y corrección con Gemini.',
                                style: TextStyle(fontSize: 13, color: Colors.black54),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Campo opcional para Matrícula/ID del alumno
                      TextField(
                        controller: _studentIdCtrl,
                        decoration: InputDecoration(
                          labelText: 'Matrícula o Código de Estudiante (Opcional)',
                          hintText: 'Ej. EST-2026-001 (o dejar vacío para lectura IA)',
                          prefixIcon: const Icon(Icons.badge, color: Color(0xFF8B5E3C)),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Galería de páginas escaneadas
                      const Text(
                        'Páginas del Examen',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),

                      if (pages.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(32),
                            child: Text('No hay páginas escaneadas.'),
                          ),
                        )
                      else
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: pages.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final page = pages[index];
                            final file = File(page.imagePath);

                            return Card(
                              elevation: 2,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: ListTile(
                                leading: ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: SizedBox(
                                    width: 50,
                                    height: 50,
                                    child: file.existsSync()
                                        ? Image.file(file, fit: BoxFit.cover)
                                        : Container(
                                            color: const Color(0xFFC4956A),
                                            child: const Icon(Icons.description, color: Colors.white),
                                          ),
                                  ),
                                ),
                                title: Text(
                                  'Página ${page.pageNumber}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Text(
                                  page.qrData != null ? 'QR: ${page.qrData}' : 'Captura manual JPG',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444)),
                                  onPressed: () => widget.controller.removePageAt(index),
                                ),
                              ),
                            );
                          },
                        ),

                      const SizedBox(height: 30),

                      // Botón de Enviar al Backend
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF8B5E3C),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(Icons.cloud_upload),
                          label: const Text(
                            'Enviar Examen a Calificación con IA',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          onPressed: pages.isEmpty ? null : _handleSubmit,
                        ),
                      ),
                    ],
                  ),
                ),
        );
      },
    );
  }
}
