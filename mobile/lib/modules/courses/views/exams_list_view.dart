import 'package:flutter/material.dart';

import '../../../core/network/api_client.dart';
import '../../../core/widgets/breadcrumb_bar.dart';
import '../../scanner/views/camera_scanner_view.dart';

class ExamsListView extends StatefulWidget {
  final Map<String, dynamic> subject;
  final Map<String, dynamic> parallel;

  const ExamsListView({Key? key, required this.subject, required this.parallel})
    : super(key: key);

  @override
  State<ExamsListView> createState() => _ExamsListViewState();
}

class _ExamsListViewState extends State<ExamsListView> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _exams = [];

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final parallelId = widget.parallel['id'];
      final response = await _apiClient.get(
        '/exams/exams/',
        queryParameters: {'parallel_id': parallelId},
      );

      if (response.statusCode == 200) {
        setState(() {
          _exams = response.data is List
              ? response.data
              : (response.data['results'] ?? []);
        });
      } else {
        setState(() {
          _errorMessage = 'Error al obtener exámenes del aula.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'No se pudieron cargar los exámenes ($e)';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _openExam({
    required String examId,
    required String title,
    required bool hasQr,
    required String parallelId,
    required String aulaLabel,
  }) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _ExamRosterView(
          examId: examId,
          title: title,
          parallelId: parallelId,
          aulaLabel: aulaLabel,
          hasQr: hasQr,
          apiClient: _apiClient,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final subjectName = widget.subject['name'] ?? 'Materia';
    final groupCode = widget.parallel['group_code'] ?? 'A';
    final period = widget.parallel['period'] ?? '1-2026';
    final aulaLabel = 'Aula $groupCode ($period)';

    return Scaffold(
      appBar: AppBar(
        title: Text('Exámenes - $aulaLabel'),
        backgroundColor: const Color(0xFF8B5E3C),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _loadExams,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Barra de Migas de Pan (Exacta a la versión Web)
              BreadcrumbBar(
                onHomeTap: () =>
                    Navigator.of(context).popUntil((route) => route.isFirst),
                items: [
                  BreadcrumbItem(
                    label: 'Mis Materias',
                    onTap: () =>
                        Navigator.of(context)
                            .popUntil((route) => route.isFirst),
                  ),
                  BreadcrumbItem(
                    label: subjectName,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  BreadcrumbItem(
                    label: aulaLabel,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const BreadcrumbItem(
                    label: 'Exámenes Parciales',
                    isCurrent: true,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Cabecera Informativa
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDF6EC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8DCC8)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF8B5E3C).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.assignment,
                        color: Color(0xFF8B5E3C),
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$subjectName - $aulaLabel',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2C1810),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Digitalización y Calificación Asistida con Google Gemini',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.brown.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              const Text(
                'Exámenes Programados',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2C1810),
                ),
              ),
              const SizedBox(height: 12),

              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(color: Color(0xFF8B5E3C)),
                  ),
                )
              else if (_errorMessage != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Color(0xFFEF4444),
                          size: 40,
                        ),
                        const SizedBox(height: 8),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: _loadExams,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF8B5E3C),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                )
              else if (_exams.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: const [
                        Icon(
                          Icons.assignment_late_outlined,
                          size: 48,
                          color: Colors.black26,
                        ),
                        SizedBox(height: 12),
                        Text('No se encontraron exámenes para este paralelo.'),
                      ],
                    ),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _exams.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final exam = _exams[index];
                    final title = exam['title'] ?? 'Examen';
                    final hasQr = exam['has_qr_code'] ?? true;
                    final totalScore = exam['total_score'] ?? 100;
                    final examId = exam['id'].toString();
                    final parallelId = widget.parallel['id'].toString();

                    return Card(
                      elevation: 2,
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
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF8B5E3C)
                                        .withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.description,
                                    color: Color(0xFF8B5E3C),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        title,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      Text(
                                        '$subjectName - $aulaLabel',
                                        style: const TextStyle(
                                          color: Colors.black54,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Chip(
                                  backgroundColor: hasQr
                                      ? const Color(0xFFECFDF5)
                                      : const Color(0xFFFFFBEB),
                                  label: Text(
                                    hasQr ? 'Con QR' : 'Sin QR',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: hasQr
                                          ? const Color(0xFF059669)
                                          : const Color(0xFFD97706),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Puntaje Total: $totalScore pts',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF2C1810),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF8B5E3C),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 10,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    icon: const Icon(
                                      Icons.camera_alt,
                                      size: 16,
                                    ),
                                    label: const Text('Ver estudiantes'),
                                    onPressed: () => _openExam(
                                      examId: examId,
                                      title: title,
                                      hasQr: hasQr,
                                      parallelId: parallelId,
                                      aulaLabel: aulaLabel,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExamRosterView extends StatefulWidget {
  const _ExamRosterView({
    required this.examId,
    required this.title,
    required this.parallelId,
    required this.aulaLabel,
    required this.hasQr,
    required this.apiClient,
  });

  final String examId;
  final String title;
  final String parallelId;
  final String aulaLabel;
  final bool hasQr;
  final ApiClient apiClient;

  @override
  State<_ExamRosterView> createState() => _ExamRosterViewState();
}

class _ExamRosterViewState extends State<_ExamRosterView> {
  List<Map<String, dynamic>> _students = [];
  Set<String> _scanned = {};
  bool _loading = true;
  bool _failed = false;
  bool _isPublishing = false;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _loadRoster();
  }

  Future<void> _loadRoster() async {
    setState(() {
      _loading = true;
      _failed = false;
    });
    try {
      final responses = await Future.wait([
        widget.apiClient.get(
          '/academics/parallels/${widget.parallelId}/students/',
        ),
        widget.apiClient.get(
          '/evaluations/',
          queryParameters: {'exam_id': widget.examId},
        ),
      ]);
      final students = List<Map<String, dynamic>>.from(
        responses.first.data as List,
      );
      final data = responses.last.data;
      final evaluations = data is List ? data : data['results'] as List;
      final scanned = evaluations
          .whereType<Map>()
          .where(
            (entry) =>
                entry['student'] != null &&
                (entry['pages_count'] as num? ?? 0) > 0,
          )
          .map((entry) => entry['student'].toString())
          .toSet();
      if (!mounted) return;
      setState(() {
        _students = students;
        _scanned = scanned;
      });
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _scan([Map<String, dynamic>? student]) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => CameraScannerView(
          examId: widget.examId,
          examTitle: widget.title,
          parallelName: widget.aulaLabel,
          examHasQr: widget.hasQr,
          parallelId: widget.parallelId,
          preselectedStudentId: student?['student_id_code'] as String?,
          preselectedStudentName: student?['full_name'] as String?,
        ),
      ),
    );
    if (mounted) await _loadRoster();
  }

  Future<void> _publishGrades() async {
    if (_isPublishing) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Publicar calificaciones del parcial'),
        content: Text(
          '¿Desea hacer públicas las notas del examen "${widget.title}"? '
          'Los estudiantes inscritos podrán ver sus calificaciones y retroalimentación de inmediato en el portal web.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Publicar Ahora'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      _isPublishing = true;
    });

    try {
      final response = await widget.apiClient.post(
        '/evaluations/exams/${widget.examId}/publish/',
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final count = response.data['published_count'] ?? 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            content: Text('¡Se publicaron $count calificaciones con éxito!'),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          content: Text('Error al publicar calificaciones: $e'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isPublishing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final visible = _students
        .where(
          (student) => '${student['full_name']} ${student['student_id_code']}'
              .toLowerCase()
              .contains(_query),
        )
        .toList();
    final scannedCount = _students
        .where((student) => _scanned.contains(student['id']))
        .length;
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadRoster,
          child: ListView.builder(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            itemCount: _loading || _failed || visible.isEmpty
                ? 1
                : visible.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(widget.aulaLabel),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: () => _scan(),
                      icon: const Icon(Icons.camera_alt_outlined),
                      label: const Text('Escanear para identificar'),
                    ),
                    OutlinedButton(
                      onPressed: _isPublishing || _loading || _failed
                          ? null
                          : _publishGrades,
                      child: const Text('Publicar calificaciones del parcial'),
                    ),
                    const SizedBox(height: 12),
                    if (_loading)
                      const LinearProgressIndicator()
                    else if (_failed) ...[
                      const Text(
                        'No se pudo cargar el listado. Revisa tu conexión.',
                      ),
                      TextButton(
                        onPressed: _loadRoster,
                        child: const Text('Reintentar'),
                      ),
                    ] else ...[
                      Text('$scannedCount de ${_students.length} con escaneo'),
                      const SizedBox(height: 8),
                      TextField(
                        decoration: const InputDecoration(
                          labelText: 'Buscar por nombre o matrícula',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) =>
                            setState(() => _query = value.trim().toLowerCase()),
                      ),
                      if (visible.isEmpty)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          child: Text(
                            _students.isEmpty
                                ? 'Este paralelo no tiene inscritos.'
                                : 'Sin coincidencias.',
                          ),
                        ),
                    ],
                  ],
                );
              }
              final student = visible[index - 1];
              final scanned = _scanned.contains(student['id']);
              return Card(
                child: ListTile(
                  title: Text(student['full_name'].toString()),
                  subtitle: Text(
                    '${student['student_id_code']} · ${scanned ? 'Escaneado' : 'Sin escaneo'}',
                  ),
                  trailing: IconButton(
                    tooltip: 'Escanear examen de ${student['full_name']}',
                    icon: const Icon(Icons.document_scanner_outlined),
                    onPressed: () => _scan(student),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
