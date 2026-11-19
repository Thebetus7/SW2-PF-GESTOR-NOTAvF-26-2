import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/widgets/breadcrumb_bar.dart';
import 'exams_list_view.dart';

class ParallelsListView extends StatefulWidget {
  final Map<String, dynamic> subject;

  const ParallelsListView({
    Key? key,
    required this.subject,
  }) : super(key: key);

  @override
  State<ParallelsListView> createState() => _ParallelsListViewState();
}

class _ParallelsListViewState extends State<ParallelsListView> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _parallels = [];

  @override
  void initState() {
    super.initState();
    _loadParallels();
  }

  Future<void> _loadParallels() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final subjectId = widget.subject['id'];
      final response = await _apiClient.get(
        '/academics/parallels/',
        queryParameters: {'subject_id': subjectId},
      );

      if (response.statusCode == 200) {
        setState(() {
          _parallels = response.data is List ? response.data : (response.data['results'] ?? []);
        });
      } else {
        setState(() {
          _errorMessage = 'Error del servidor al obtener las aulas.';
        });
      }
    } catch (e) {
      // Fallback a los paralelos anidados en la materia si existen
      if (widget.subject['parallels'] is List && (widget.subject['parallels'] as List).isNotEmpty) {
        setState(() {
          _parallels = widget.subject['parallels'];
        });
      } else {
        setState(() {
          _errorMessage = 'No se pudieron cargar los paralelos ($e)';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final subjectCode = widget.subject['code'] ?? '';
    final subjectName = widget.subject['name'] ?? 'Materia';

    return Scaffold(
      appBar: AppBar(
        title: Text('$subjectCode - $subjectName'),
        backgroundColor: const Color(0xFF8B5E3C),
        foregroundColor: Colors.white,
      ),
      body: RefreshIndicator(
        onRefresh: _loadParallels,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Barra de Migas de Pan (Breadcrumbs)
              BreadcrumbBar(
                onHomeTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
                items: [
                  BreadcrumbItem(
                    label: 'Mis Materias',
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  BreadcrumbItem(
                    label: subjectName,
                    isCurrent: true,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Cabecera de la Materia
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
                      child: const Icon(Icons.school, color: Color(0xFF8B5E3C), size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$subjectCode - $subjectName',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF2C1810),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Seleccione un aula o paralelo para ver sus exámenes',
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
                'Aulas y Paralelos Asignados',
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
                          onPressed: _loadParallels,
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
              else if (_parallels.isEmpty)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: const [
                        Icon(Icons.meeting_room_outlined, size: 48, color: Colors.black26),
                        SizedBox(height: 12),
                        Text('No hay aulas ni paralelos creados en esta materia.'),
                      ],
                    ),
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _parallels.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final parallel = _parallels[index];
                    final groupCode = parallel['group_code'] ?? 'A';
                    final period = parallel['period'] ?? '1-2026';
                    final studentCount = parallel['student_count'] ?? 0;

                    return Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(12),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ExamsListView(
                                subject: widget.subject,
                                parallel: parallel,
                              ),
                            ),
                          );
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFC4956A).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.meeting_room, color: Color(0xFF8B5E3C)),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Aula $groupCode ($period)',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF2C1810),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '👥 $studentCount ${studentCount == 1 ? 'alumno inscrito' : 'alumnos inscritos'}',
                                      style: const TextStyle(fontSize: 13, color: Colors.black54),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right, color: Color(0xFF8B5E3C)),
                            ],
                          ),
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
