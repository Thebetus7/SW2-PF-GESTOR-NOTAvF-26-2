import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/api_client.dart';
import '../../auth/views/login_view.dart';
import '../../scanner/views/camera_scanner_view.dart';

class CourseSelectionView extends StatefulWidget {
  const CourseSelectionView({Key? key}) : super(key: key);

  @override
  State<CourseSelectionView> createState() => _CourseSelectionViewState();
}

class _CourseSelectionViewState extends State<CourseSelectionView> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _errorMessage;
  String _userName = 'Docente';
  List<dynamic> _exams = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final prefs = await SharedPreferences.getInstance();
    _userName = prefs.getString('user_name') ?? 'Docente';

    try {
      final response = await _apiClient.get('/exams/exams/');
      if (response.statusCode == 200) {
        setState(() {
          _exams = response.data is List ? response.data : (response.data['results'] ?? []);
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'No se pudieron cargar los exámenes del servidor ($e)';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginView()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exámenes Asignados'),
        backgroundColor: const Color(0xFF8B5E3C),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF8B5E3C)))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Saludo de bienvenida
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDF6EC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE8DCC8)),
                      ),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            backgroundColor: Color(0xFF8B5E3C),
                            child: Icon(Icons.person, color: Colors.white),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '¡Bienvenido, $_userName!',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Seleccione un examen para iniciar el escaneo de hojas físicas.',
                                  style: TextStyle(fontSize: 12, color: Colors.black54),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13),
                        ),
                      ),

                    const Text(
                      'Exámenes Disponibles para Digitalización',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),

                    if (_exams.isEmpty)
                      Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              const Icon(Icons.inbox_outlined, size: 48, color: Colors.black38),
                              const SizedBox(height: 12),
                              const Text(
                                'No hay exámenes registrados en este momento.',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Puedes crear un examen desde el panel web del docente en localhost:3001 o iniciar una prueba rápida de escaneo.',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 12, color: Colors.black54),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF8B5E3C),
                                  foregroundColor: Colors.white,
                                ),
                                icon: const Icon(Icons.camera_alt),
                                label: const Text('Escaneo de Prueba Directo'),
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const CameraScannerView(
                                        examId: 'demo-exam-001',
                                        parallelName: 'Aula Demo - Cálculo I',
                                        examHasQr: true,
                                      ),
                                    ),
                                  );
                                },
                              ),
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
                          final parallelName = exam['parallel_name'] ?? exam['parallel'] ?? 'Aula General';
                          final hasQr = exam['has_qr_code'] ?? true;
                          final totalScore = exam['total_score'] ?? 100;
                          final examId = exam['id'].toString();
                          final parallelId = exam['parallel_id']?.toString() ?? exam['parallel']?.toString();

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
                                        child: const Icon(Icons.assignment, color: Color(0xFF8B5E3C)),
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
                                              parallelName,
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
                                        'Puntaje: $totalScore pts',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                      ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF8B5E3C),
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                        ),
                                        icon: const Icon(Icons.camera_alt, size: 16),
                                        label: const Text('Escanear'),
                                        onPressed: () {
                                          Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (_) => CameraScannerView(
                                                examId: examId,
                                                parallelName: '$title ($parallelName)',
                                                examHasQr: hasQr,
                                                parallelId: parallelId,
                                              ),
                                            ),
                                          );
                                        },
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
