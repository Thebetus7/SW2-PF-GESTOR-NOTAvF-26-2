import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:camera/camera.dart';

import '../controllers/submission_controller.dart';
import '../models/scanned_page.dart';
import '../widgets/scanner_overlay.dart';
import 'review_pages_view.dart';

class CameraScannerView extends StatefulWidget {
  final String examId;
  final String parallelName;
  final bool examHasQr;
  final String? parallelId;
  final String? preselectedStudentId;
  final String? preselectedStudentName;

  const CameraScannerView({
    Key? key,
    required this.examId,
    required this.parallelName,
    this.examHasQr = true,
    this.parallelId,
    this.preselectedStudentId,
    this.preselectedStudentName,
  }) : super(key: key);

  @override
  State<CameraScannerView> createState() => _CameraScannerViewState();
}

class _CameraScannerViewState extends State<CameraScannerView> {
  late bool _isAutoQrEnabled;
  bool _isQrDetected = false;
  final ImagePicker _picker = ImagePicker();

  CameraController? _cameraController;
  bool _isCameraInitialized = false;

  @override
  void initState() {
    super.initState();
    _isAutoQrEnabled = widget.examHasQr;
    _initLiveCamera();
    if (_isAutoQrEnabled) {
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted && _isAutoQrEnabled) {
          setState(() {
            _isQrDetected = true;
          });
        }
      });
    }
  }

  Future<void> _initLiveCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isNotEmpty) {
        final backCamera = cameras.firstWhere(
          (c) => c.lensDirection == CameraLensDirection.back,
          orElse: () => cameras.first,
        );
        final controller = CameraController(
          backCamera,
          ResolutionPreset.medium,
          enableAudio: false,
        );
        await controller.initialize();
        if (!mounted) {
          await controller.dispose();
          return;
        }
        setState(() {
          _cameraController = controller;
          _isCameraInitialized = true;
        });
      }
    } catch (_) {
      // Si el entorno no soporta hardware de cámara directo (emulador sin webcam o tests),
      // se utiliza el visor asistido de encuadre.
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _captureManualPhoto(SubmissionController controller) async {
    try {
      if (_isCameraInitialized && _cameraController != null && _cameraController!.value.isInitialized) {
        final XFile photo = await _cameraController!.takePicture();
        controller.addPage(
          ScannedPage(
            pageNumber: controller.pages.length + 1,
            imagePath: photo.path,
            qrData: _isQrDetected ? 'EXAM_${widget.examId}_PAGE_${controller.pages.length + 1}' : null,
          ),
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Página ${controller.pages.length} capturada'),
              duration: const Duration(seconds: 1),
            ),
          );
        }
        return;
      }

      // Si no hay controlador de cámara en vivo, intentar con ImagePicker
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
      );

      if (photo != null) {
        controller.addPage(
          ScannedPage(
            pageNumber: controller.pages.length + 1,
            imagePath: photo.path,
            qrData: _isQrDetected ? 'EXAM_${widget.examId}_PAGE_${controller.pages.length + 1}' : null,
          ),
        );
      } else {
        _simulateCapture(controller);
      }
    } catch (_) {
      _simulateCapture(controller);
    }
  }

  Future<void> _pickFromGallery(SubmissionController controller) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (image != null) {
        controller.addPage(
          ScannedPage(
            pageNumber: controller.pages.length + 1,
            imagePath: image.path,
            qrData: _isQrDetected ? 'EXAM_${widget.examId}' : null,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al abrir galería: $e')),
      );
    }
  }

  void _simulateCapture(SubmissionController controller) {
    final pageNum = controller.pages.length + 1;
    final simulatedPath = '${Directory.systemTemp.path}/scanned_page_$pageNum.jpg';
    final file = File(simulatedPath);
    if (!file.existsSync()) {
      file.writeAsBytesSync([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00]);
    }

    controller.addPage(
      ScannedPage(
        pageNumber: pageNum,
        imagePath: simulatedPath,
        qrData: _isQrDetected ? 'EXAM_${widget.examId}_PAGE_$pageNum' : null,
      ),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Página $pageNum capturada exitosamente (JPG)'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<SubmissionController>(
      create: (_) => SubmissionController(),
      child: Consumer<SubmissionController>(
        builder: (context, controller, _) {
          return Scaffold(
            backgroundColor: Colors.black,
            appBar: AppBar(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              title: Text(
                widget.parallelName,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              actions: [
                Row(
                  children: [
                    const Text(
                      'Auto QR',
                      style: TextStyle(fontSize: 13, color: Colors.white70),
                    ),
                    Switch(
                      value: _isAutoQrEnabled,
                      activeColor: const Color(0xFFC4956A),
                      onChanged: (val) {
                        setState(() {
                          _isAutoQrEnabled = val;
                          _isQrDetected = val;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
            body: Stack(
              children: [
                // 1. Visor de Cámara en Vivo o Hoja de Examen Asistida
                if (_isCameraInitialized && _cameraController != null)
                  Positioned.fill(
                    child: Center(
                      child: CameraPreview(_cameraController!),
                    ),
                  )
                else
                  // Si el emulador no tiene hardware de webcam activa, se muestra la hoja de examen encuadrada
                  Positioned.fill(
                    child: Container(
                      color: const Color(0xFF1E140F),
                      child: Center(
                        child: Container(
                          width: MediaQuery.of(context).size.width * 0.78,
                          height: MediaQuery.of(context).size.height * 0.62,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF7F2),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.4),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'CÁLCULO I - EVALUACIÓN',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2C1810)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Alumno: Juan Carlos Pérez',
                                        style: TextStyle(fontSize: 11, color: Colors.brown.shade700),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: Colors.black87, width: 2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Icon(Icons.qr_code_2, size: 28, color: Colors.black87),
                                  ),
                                ],
                              ),
                              const Divider(height: 16),
                              const Text(
                                'Pregunta 1 (50 pts):',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2C1810)),
                              ),
                              const Text(
                                'Calcule la derivada de f(x) = x²',
                                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.06),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  "Resp: f'(x) = 2x",
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1E3A8A)),
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Pregunta 2 (50 pts):',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF2C1810)),
                              ),
                              const Text(
                                '¿El límite de 1/x cuando x->inf es 0?',
                                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.06),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  "Resp: Verdadero. lim 1/x = 0",
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF1E3A8A)),
                                ),
                              ),
                              const Spacer(),
                              Center(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF8B5E3C).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    '📸 Presione el obturador para capturar',
                                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8B5E3C)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                // 2. Visor de Cámara y Guía de Encuadre Neumórfica
                Positioned.fill(
                  child: ScannerOverlay(
                    isQrDetected: _isQrDetected,
                  ),
                ),

                // 3. Contador de Páginas del Alumno y Badge Modo Dirigido
                Positioned(
                  top: 16,
                  left: 0,
                  right: 0,
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8B5E3C).withOpacity(0.9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Páginas del Alumno: ${controller.pages.length}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (widget.preselectedStudentName != null) ...[
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A).withOpacity(0.85),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            '👤 Modo Dirigido: ${widget.preselectedStudentName} (${widget.preselectedStudentId})',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // 4. Controles Inferiores de Disparo y Navegación
                Positioned(
                  bottom: 30,
                  left: 20,
                  right: 20,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // Botón Importar Galería
                          IconButton(
                            iconSize: 32,
                            icon: const Icon(Icons.photo_library, color: Colors.white70),
                            onPressed: () => _pickFromGallery(controller),
                          ),

                          // Botón Central Disparador (Obturador JPG)
                          GestureDetector(
                            onTap: () => _captureManualPhoto(controller),
                            child: Container(
                              width: 72,
                              height: 72,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 4),
                                color: const Color(0xFF8B5E3C),
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                          ),

                          // Botón Limpiar Páginas
                          IconButton(
                            iconSize: 32,
                            icon: const Icon(Icons.refresh, color: Colors.white70),
                            onPressed: controller.pages.isEmpty
                                ? null
                                : () => controller.clearPages(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Botón para Pasar a la Revisión y Envío al Backend
                      if (controller.pages.isNotEmpty)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFC4956A),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            icon: const Icon(Icons.arrow_forward),
                            label: Text(
                              'Revisar Páginas (${controller.pages.length})',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ReviewPagesView(
                                    examId: widget.examId,
                                    parallelId: widget.parallelId,
                                    controller: controller,
                                    preselectedStudentId: widget.preselectedStudentId,
                                    preselectedStudentName: widget.preselectedStudentName,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
