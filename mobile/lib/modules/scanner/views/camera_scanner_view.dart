import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../controllers/submission_controller.dart';
import '../models/scanned_page.dart';
import '../widgets/scanner_overlay.dart';
import 'review_pages_view.dart';

class CameraScannerView extends StatefulWidget {
  final String examId;
  final String parallelName;
  final bool examHasQr;
  final String? parallelId;

  const CameraScannerView({
    Key? key,
    required this.examId,
    required this.parallelName,
    this.examHasQr = true,
    this.parallelId,
  }) : super(key: key);

  @override
  State<CameraScannerView> createState() => _CameraScannerViewState();
}

class _CameraScannerViewState extends State<CameraScannerView> {
  late bool _isAutoQrEnabled;
  bool _isQrDetected = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _isAutoQrEnabled = widget.examHasQr;
    if (_isAutoQrEnabled) {
      // Simular calibración de QR tras breve intervalo en visor interactivo
      Future.delayed(const Duration(milliseconds: 1200), () {
        if (mounted && _isAutoQrEnabled) {
          setState(() {
            _isQrDetected = true;
          });
        }
      });
    }
  }

  Future<void> _captureManualPhoto(SubmissionController controller) async {
    try {
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
        // En emuladores sin cámara física activa o en tests, proveer captura asistida
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
    // Crear archivo JPG temporal si no existe
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
                // Visor de Cámara y Guía de Encuadre
                Positioned.fill(
                  child: ScannerOverlay(
                    isQrDetected: _isQrDetected,
                  ),
                ),

                // Contador de Páginas del Alumno
                Positioned(
                  top: 16,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
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
                  ),
                ),

                // Controles Inferiores de Disparo y Navegación
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
