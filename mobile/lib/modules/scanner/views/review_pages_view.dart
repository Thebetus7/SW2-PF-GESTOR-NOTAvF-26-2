import 'dart:io';

import 'package:flutter/material.dart';

import '../models/scanned_page.dart';
import '../controllers/submission_controller.dart';

class ReviewPagesView extends StatefulWidget {
  final String examId;
  final String? examTitle;
  final Future<ScannedPage?> Function()? retakePage;
  final String? parallelId;
  final String? preselectedStudentId;
  final String? preselectedStudentName;
  final SubmissionController controller;

  const ReviewPagesView({
    Key? key,
    required this.examId,
    this.examTitle,
    this.retakePage,
    this.parallelId,
    this.preselectedStudentId,
    this.preselectedStudentName,
    required this.controller,
  }) : super(key: key);

  @override
  State<ReviewPagesView> createState() => _ReviewPagesViewState();
}

class _ReviewPagesViewState extends State<ReviewPagesView> {
  late final TextEditingController _studentIdCtrl;
  bool _changingStudent = false;
  bool _replacingPage = false;

  @override
  void initState() {
    super.initState();
    _studentIdCtrl = TextEditingController(
      text: widget.preselectedStudentId ?? '',
    );
  }

  @override
  void dispose() {
    _studentIdCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit({bool retry = false}) async {
    FocusScope.of(context).unfocus();
    final success = retry
        ? await widget.controller.retrySubmission()
        : await widget.controller.submitExamSubmission(
            examId: widget.examId,
            parallelId: widget.parallelId,
            studentIdentifier: _studentIdCtrl.text.trim().isEmpty
                ? null
                : _studentIdCtrl.text.trim(),
          );

    if (!mounted) return;

    if (success) {
      _showDetailedResultDialog();
    } else {
      if (!widget.controller.isRateLimited) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            content: Text(
              widget.controller.errorMessage ??
                  'Error al enviar examen al backend',
            ),
          ),
        );
      }
    }
  }

  void _showDetailedResultDialog() {
    final result = widget.controller.lastResult;
    final studentName =
        result?['student_name'] ??
        result?['raw_student_name'] ??
        widget.preselectedStudentName ??
        'Estudiante Sin Identificar';
    final studentId =
        result?['student_identifier'] ??
        result?['raw_student_identifier'] ??
        widget.preselectedStudentId ??
        'ESTUDIANTE_BORRADOR';
    final statusStr = result?['status'] ?? 'EN_REVISION';
    final score = result?['final_score'] ?? result?['ai_total_score'] ?? 0;
    final pagesList = result?['pages'] is List ? result['pages'] : [];
    final gradesList = result?['grades'] is List
        ? result['grades']
        : (result?['components_evaluation'] is List
              ? result['components_evaluation']
              : []);

    String? generalOcrText;
    if (pagesList.isNotEmpty &&
        pagesList[0]['ocr_raw_text'] != null &&
        pagesList[0]['ocr_raw_text'].toString().isNotEmpty) {
      generalOcrText = pagesList[0]['ocr_raw_text'].toString();
    }

    final isRevision = statusStr == 'REVISION_DOCENTE';

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 24,
          ),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 500, maxHeight: 680),
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Encabezado con Icono y Estado
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isRevision
                            ? const Color(0xFFFFFBEB)
                            : const Color(0xFFECFDF5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isRevision ? Icons.assignment_late : Icons.check_circle,
                        color: isRevision
                            ? const Color(0xFFD97706)
                            : const Color(0xFF059669),
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isRevision
                                ? 'Examen Registrado (Revisión)'
                                : '¡Examen Evaluado con Éxito!',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                            ),
                          ),
                          Text(
                            '${widget.controller.pages.length} páginas JPG digitalizadas',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Tarjeta de Identificación del Estudiante
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFDF6EC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE8DCC8)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 22,
                        backgroundColor: const Color(0xFF8B5E3C)
                            .withOpacity(0.2),
                        foregroundColor: const Color(0xFF8B5E3C),
                        child: Text(
                          studentName.isNotEmpty
                              ? studentName[0].toUpperCase()
                              : 'E',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              studentName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: Color(0xFF2C1810),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              'Matrícula: $studentId',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade700,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: isRevision
                                    ? const Color(0xFFFEF3C7)
                                    : const Color(0xFFD1FAE5),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                statusStr,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isRevision
                                      ? const Color(0xFF92400E)
                                      : const Color(0xFF065F46),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Puntaje',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                          Text(
                            '$score pts',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8B5E3C),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                const Text(
                  'Contenido Escaneado y Desglose IA:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2C1810),
                  ),
                ),
                const SizedBox(height: 8),

                // Lista con scroll de preguntas o transcripción completa
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: gradesList.isNotEmpty
                        ? ListView.separated(
                            padding: const EdgeInsets.all(10),
                            itemCount: gradesList.length,
                            separatorBuilder: (_, __) =>
                                const Divider(height: 16),
                            itemBuilder: (context, idx) {
                              final g = gradesList[idx];
                              final prompt =
                                  g['component_prompt'] ??
                                  g['prompt'] ??
                                  'Pregunta #${idx + 1}';
                              final finalSc =
                                  g['final_score'] ?? g['score_assigned'] ?? 0;
                              final maxSc = g['max_score'] ?? 0;
                              final ans =
                                  g['transcribed_answer'] ??
                                  '(Sin texto detectado)';
                              final feed =
                                  g['ai_feedback'] ?? g['feedback'] ?? '';

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Pregunta #${idx + 1}: $prompt',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 13,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF8B5E3C)
                                              .withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(
                                            4,
                                          ),
                                        ),
                                        child: Text(
                                          '$finalSc / $maxSc pts',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                            color: Color(0xFF8B5E3C),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: Colors.grey.shade300,
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          '📝 Transcripción manuscrita detectada:',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.black54,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          ans,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontStyle: FontStyle.italic,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (feed.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      '💡 Evaluación IA: $feed',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.brown.shade700,
                                      ),
                                    ),
                                  ],
                                ],
                              );
                            },
                          )
                        : SingleChildScrollView(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: const [
                                    Icon(
                                      Icons.notes,
                                      size: 18,
                                      color: Color(0xFF8B5E3C),
                                    ),
                                    SizedBox(width: 6),
                                    Text(
                                      'Transcripción Libre Reconocida:',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: Colors.grey.shade300,
                                    ),
                                  ),
                                  child: Text(
                                    generalOcrText ?? 'Texto escaneado guardado para revisión manual del docente.',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'ℹ️ El examen no coincidió con preguntas estructuradas y fue asignado al Estudiante Borrador.',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                OverflowBar(
                  spacing: 8,
                  overflowSpacing: 8,
                  children: [
                    TextButton(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        widget.controller.clearPages();
                        Navigator.of(context).pop();
                        Navigator.of(context).pop();
                      },
                      child: const Text('Volver al parcial'),
                    ),
                    FilledButton(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        widget.controller.clearPages();
                        final navigator = Navigator.of(context);
                        navigator.pop();
                        if (widget.preselectedStudentId != null)
                          navigator.pop();
                      },
                      child: const Text('Escanear siguiente estudiante'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        final pages = widget.controller.pages;
        final isSubmitting =
            widget.controller.status == SubmissionStatus.submitting;
        final isRateLimited = widget.controller.isRateLimited;
        final isPaused = widget.controller.isPaused;

        return PopScope(
          canPop: !isSubmitting && !_replacingPage,
          child: Scaffold(
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
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Banner de saturación de Gemini o pausa manual
                        if (isRateLimited || isPaused)
                          Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isRateLimited
                                  ? const Color(0xFFFFFBEB)
                                  : const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isRateLimited
                                    ? const Color(0xFFF59E0B)
                                    : const Color(0xFF9CA3AF),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    isRateLimited
                                        ? const Icon(
                                            Icons.schedule,
                                            color: Color(0xFF92400E),
                                          )
                                        : const Icon(
                                            Icons.pause_circle_outline,
                                            color: Color(0xFF4B5563),
                                            size: 20,
                                          ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        isRateLimited
                                            ? 'Análisis ocupado. Las fotos se conservan.'
                                            : 'Análisis en pausa. Las imágenes capturadas están listas.',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: isRateLimited
                                              ? const Color(0xFF92400E)
                                              : const Color(0xFF1F2937),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  isRateLimited
                                      ? 'Puedes pausar o reintentar cuando estés listo.'
                                      : 'Reintenta el análisis con las mismas fotos.',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Wrap(
                                  alignment: WrapAlignment.end,
                                  spacing: 8,
                                  children: [
                                    if (isRateLimited)
                                      OutlinedButton.icon(
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: const Color(
                                            0xFF92400E,
                                          ),
                                          side: const BorderSide(
                                            color: Color(0xFFF59E0B),
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 8,
                                          ),
                                        ),
                                        icon: const Icon(Icons.pause, size: 16),
                                        label: const Text('Pausar Análisis'),
                                        onPressed: () =>
                                            widget.controller.pauseAnalysis(),
                                      ),
                                    if (isPaused || isRateLimited)
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(
                                            0xFF8B5E3C,
                                          ),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 14,
                                            vertical: 8,
                                          ),
                                        ),
                                        icon: const Icon(
                                          Icons.play_arrow,
                                          size: 16,
                                        ),
                                        label: const Text('Reintentar Ahora'),
                                        onPressed: () =>
                                            _handleSubmit(retry: true),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                        // Tarjeta de cabecera informativa
                        Card(
                          elevation: 1,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.photo_library,
                                      color: Color(0xFF8B5E3C),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Páginas agrupadas: ${pages.length}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'Toca una hoja para ampliarla. Usa su menú para cambiar el orden o volver a tomarla.',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        Text(
                          widget.examTitle ?? 'Parcial',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        if (widget.preselectedStudentName != null &&
                            !_changingStudent)
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(widget.preselectedStudentName!),
                            subtitle: Text(_studentIdCtrl.text),
                          ),
                        if (widget.preselectedStudentId != null &&
                            !_changingStudent &&
                            !isRateLimited &&
                            !isPaused)
                          TextButton(
                            onPressed: () =>
                                setState(() => _changingStudent = true),
                            child: const Text('Cambiar estudiante'),
                          ),
                        if (widget.preselectedStudentId == null ||
                            _changingStudent)
                          TextField(
                            readOnly: isRateLimited || isPaused,
                            controller: _studentIdCtrl,
                            decoration: InputDecoration(
                              labelText:
                                  'Matrícula o Código de Estudiante (Opcional)',
                              hintText: 'Ej. EST-2026-001 (o dejar vacío para lectura IA)',
                              prefixIcon: const Icon(
                                Icons.badge,
                                color: Color(0xFF8B5E3C),
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        const SizedBox(height: 20),

                        // Galería de páginas escaneadas
                        const Text(
                          'Páginas del Examen',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
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
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final page = pages[index];
                              final file = File(page.imagePath);

                              return Card(
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: ListTile(
                                  leading: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: SizedBox(
                                      width: 50,
                                      height: 50,
                                      child: file.existsSync()
                                          ? Image.file(
                                              file,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) =>
                                                  const Icon(
                                                    Icons.broken_image_outlined,
                                                  ),
                                            )
                                          : Container(
                                              color: const Color(0xFFC4956A),
                                              child: const Icon(
                                                Icons.description,
                                                color: Colors.white,
                                              ),
                                            ),
                                    ),
                                  ),
                                  title: Text(
                                    'Página ${page.pageNumber}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Text(
                                    page.qrData != null
                                        ? 'QR del parcial detectado'
                                        : 'Hoja capturada',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                  onTap: () => showDialog<void>(
                                    context: context,
                                    builder: (context) => Dialog(
                                      child: InteractiveViewer(
                                        maxScale: 5,
                                        child: Image.file(
                                          file,
                                          fit: BoxFit.contain,
                                          errorBuilder: (_, __, ___) =>
                                              const Text(
                                                'La imagen no está disponible.',
                                              ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  trailing: PopupMenuButton<String>(
                                    tooltip:
                                        'Acciones de página ${page.pageNumber}',
                                    enabled:
                                        !_replacingPage &&
                                        !isRateLimited &&
                                        !isPaused,
                                    onSelected: (action) async {
                                      switch (action) {
                                        case 'up':
                                          widget.controller.movePage(
                                            index,
                                            index - 1,
                                          );
                                          break;
                                        case 'down':
                                          widget.controller.movePage(
                                            index,
                                            index + 1,
                                          );
                                          break;
                                        case 'delete':
                                          widget.controller.removePageAt(index);
                                          break;
                                        case 'retake':
                                          setState(() => _replacingPage = true);
                                          final replacement =
                                              await widget.retakePage!();
                                          if (!mounted) return;
                                          if (replacement != null)
                                            widget.controller.replacePage(
                                              index,
                                              replacement,
                                            );
                                          setState(
                                            () => _replacingPage = false,
                                          );
                                          break;
                                      }
                                    },
                                    itemBuilder: (context) => [
                                      if (index > 0)
                                        const PopupMenuItem(
                                          value: 'up',
                                          child: Text('Mover arriba'),
                                        ),
                                      if (index + 1 < pages.length)
                                        const PopupMenuItem(
                                          value: 'down',
                                          child: Text('Mover abajo'),
                                        ),
                                      if (widget.retakePage != null)
                                        const PopupMenuItem(
                                          value: 'retake',
                                          child: Text('Volver a tomar'),
                                        ),
                                      const PopupMenuItem(
                                        value: 'delete',
                                        child: Text('Eliminar'),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),

                        const SizedBox(height: 30),

                        // Botón de Enviar al Backend
                        SizedBox(
                          width: double.infinity,

                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF8B5E3C),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            icon: const Icon(Icons.cloud_upload),
                            label: const Text(
                              'Enviar a calificación',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            onPressed:
                                pages.isEmpty ||
                                    _replacingPage ||
                                    isPaused ||
                                    isRateLimited
                                ? null
                                : () => _handleSubmit(),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        );
      },
    );
  }
}
