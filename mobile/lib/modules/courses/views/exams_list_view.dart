import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/widgets/breadcrumb_bar.dart';
import '../../scanner/views/camera_scanner_view.dart';

class ExamsListView extends StatefulWidget {
  final Map<String, dynamic> subject;
  final Map<String, dynamic> parallel;

  const ExamsListView({
    Key? key,
    required this.subject,
    required this.parallel,
  }) : super(key: key);

  @override
  State<ExamsListView> createState() => _ExamsListViewState();
}

class _ExamsListViewState extends State<ExamsListView> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _exams = [];
  bool _isPublishing = false;

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
          _exams = response.data is List ? response.data : (response.data['results'] ?? []);
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

  Future<void> _handlePublishGrades(String examId, String examTitle) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Publicar Calificaciones'),
        content: Text(
          '¿Desea hacer públicas las notas del examen "$examTitle"? '
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
      final response = await _apiClient.post(
        '/evaluations/exams/$examId/publish/',
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

  Future<void> _showScanModeModal({
    required String examId,
    required String title,
    required bool hasQr,
    required String parallelId,
    required String aulaLabel,
  }) async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Modalidad de Escaneo',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2C1810)),
                ),
                const SizedBox(height: 4),
                Text(
                  'Elija cómo desea vincular las evaluaciones al padrón:',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                ),
                const SizedBox(height: 16),

                // Opción 1: Modo General
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE8DCC8)),
                  ),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5E3C).withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.auto_awesome, color: Color(0xFF8B5E3C)),
                  ),
                  title: const Text(
                    'Modo General (IA Automático)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  subtitle: const Text(
                    'Reconocimiento automático de la matrícula y alumno desde la imagen o código QR.',
                    style: TextStyle(fontSize: 12),
                  ),
                  onTap: () {
                    Navigator.of(ctx).pop();
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CameraScannerView(
                          examId: examId,
                          parallelName: '$title ($aulaLabel)',
                          examHasQr: hasQr,
                          parallelId: parallelId,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),

                // Opción 2: Modo Dirigido
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFE8DCC8)),
                  ),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E3A8A).withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person_search, color: Color(0xFF1E3A8A)),
                  ),
                  title: const Text(
                    'Modo Dirigido (Seleccionar Alumno)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  subtitle: const Text(
                    'Selecciona el estudiante inscrito antes de disparar la cámara para asignar su ID de antemano.',
                    style: TextStyle(fontSize: 12),
                  ),
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _showDirectedStudentPicker(
                      examId: examId,
                      title: title,
                      hasQr: hasQr,
                      parallelId: parallelId,
                      aulaLabel: aulaLabel,
                    );
                  },
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _showDirectedStudentPicker({
    required String examId,
    required String title,
    required bool hasQr,
    required String parallelId,
    required String aulaLabel,
  }) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return FutureBuilder<dynamic>(
          future: _apiClient.get('/academics/parallels/$parallelId/students/'),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const AlertDialog(
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Color(0xFF8B5E3C)),
                    SizedBox(height: 16),
                    Text('Cargando alumnos inscritos...'),
                  ],
                ),
              );
            }

            if (snapshot.hasError || snapshot.data == null || snapshot.data.statusCode != 200) {
              return AlertDialog(
                title: const Text('Error al cargar alumnos'),
                content: Text('No se pudo obtener el listado de estudiantes (${snapshot.error ?? "error de servidor"}).'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogCtx).pop(),
                    child: const Text('Cerrar'),
                  ),
                ],
              );
            }

            final List<dynamic> studentsList = snapshot.data.data is List ? snapshot.data.data : [];

            if (studentsList.isEmpty) {
              return AlertDialog(
                title: const Text('Sin alumnos inscritos'),
                content: const Text('No hay alumnos inscritos en este paralelo para el modo dirigido.'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogCtx).pop(),
                    child: const Text('Aceptar'),
                  ),
                ],
              );
            }

            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Row(
                children: const [
                  Icon(Icons.people, color: Color(0xFF8B5E3C)),
                  SizedBox(width: 8),
                  Text('Seleccionar Alumno', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SizedBox(
                width: double.maxFinite,
                height: 320,
                child: ListView.separated(
                  itemCount: studentsList.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (ctx, idx) {
                    final st = studentsList[idx];
                    final stId = st['student_id_code'] ?? 'Sin ID';
                    final fullName = st['full_name'] ?? 'Alumno';
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFF8B5E3C).withOpacity(0.15),
                        foregroundColor: const Color(0xFF8B5E3C),
                        child: Text(fullName.isNotEmpty ? fullName[0].toUpperCase() : 'A'),
                      ),
                      title: Text(fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
                      subtitle: Text('Matrícula: $stId', style: const TextStyle(fontSize: 12)),
                      trailing: const Icon(Icons.camera_alt, color: Color(0xFF8B5E3C), size: 20),
                      onTap: () {
                        Navigator.of(dialogCtx).pop();
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => CameraScannerView(
                              examId: examId,
                              parallelName: '$title ($aulaLabel)',
                              examHasQr: hasQr,
                              parallelId: parallelId,
                              preselectedStudentId: stId,
                              preselectedStudentName: fullName,
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogCtx).pop(),
                  child: const Text('Cancelar'),
                ),
              ],
            );
          },
        );
      },
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
                onHomeTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
                items: [
                  BreadcrumbItem(
                    label: 'Mis Materias',
                    onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
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
                      child: const Icon(Icons.assignment, color: Color(0xFF8B5E3C), size: 28),
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
                            style: TextStyle(fontSize: 13, color: Colors.brown.shade600),
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
                        const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 40),
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
                        Icon(Icons.assignment_late_outlined, size: 48, color: Colors.black26),
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
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                                    color: const Color(0xFF8B5E3C).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(Icons.description, color: Color(0xFF8B5E3C)),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        title,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                      Text(
                                        '$subjectName - $aulaLabel',
                                        style: const TextStyle(color: Colors.black54, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ),
                                Chip(
                                  backgroundColor: hasQr ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                                  label: Text(
                                    hasQr ? 'Con QR' : 'Sin QR',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: hasQr ? const Color(0xFF059669) : const Color(0xFFD97706),
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
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2C1810)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF059669),
                                      side: const BorderSide(color: Color(0xFF059669)),
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    icon: const Icon(Icons.publish, size: 16),
                                    label: const Text('Publicar'),
                                    onPressed: _isPublishing ? null : () => _handlePublishGrades(examId, title),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF8B5E3C),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    icon: const Icon(Icons.camera_alt, size: 16),
                                    label: const Text('Escanear'),
                                    onPressed: () => _showScanModeModal(
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
