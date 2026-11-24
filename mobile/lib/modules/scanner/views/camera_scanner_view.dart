import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:zxing2/qrcode.dart';
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
  final String? examTitle;
  final String parallelName;
  final bool examHasQr;
  final String? parallelId;
  final String? preselectedStudentId;
  final String? preselectedStudentName;

  const CameraScannerView({
    Key? key,
    required this.examId,
    this.examTitle,
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
  bool _busy = false;
  String? _cameraMessage;
  final ImagePicker _picker = ImagePicker();

  CameraController? _cameraController;
  bool _isCameraInitialized = false;

  @override
  void initState() {
    super.initState();
    _isAutoQrEnabled = widget.examHasQr;
    _initLiveCamera();
  }

  Future<void> _initLiveCamera() async {
    setState(() => _cameraMessage = null);
    CameraController? camera;
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) throw StateError('No camera');
      camera = CameraController(
        cameras.firstWhere(
          (camera) => camera.lensDirection == CameraLensDirection.back,
          orElse: () => cameras.first,
        ),
        ResolutionPreset.high,
        enableAudio: false,
      );
      await camera.initialize();
      if (!mounted) {
        await camera.dispose();
        return;
      }
      setState(() {
        _cameraController = camera;
        _isCameraInitialized = true;
      });
    } catch (_) {
      await camera?.dispose();
      if (mounted)
        setState(
          () => _cameraMessage = 'No se pudo abrir la cámara. Revisa el permiso o abre la galería.',
        );
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<ScannedPage?> _readPage(bool gallery, {bool retake = false}) async {
    if (_busy) return null;
    setState(() => _busy = true);
    try {
      if (retake && _cameraController != null) {
        final camera = _cameraController;
        setState(() {
          _cameraController = null;
          _isCameraInitialized = false;
        });
        await camera?.dispose();
      }
      final photo = gallery
          ? await _picker.pickImage(source: ImageSource.gallery)
          : _isCameraInitialized
          ? await _cameraController!.takePicture()
          : await _picker.pickImage(source: ImageSource.camera);
      if (photo == null) return null;
      final result = await compute(_inspectImage, await photo.readAsBytes());
      if (result == null) throw const FormatException('Imagen inválida');
      String? qr;
      if (_isAutoQrEnabled && result.isNotEmpty) {
        try {
          final payload = jsonDecode(result);
          if (payload is Map &&
              payload['format'] == 'PHYSICAL_EXAM_V1' &&
              payload['exam_id'] == widget.examId)
            qr = result;
        } on FormatException {
          // La hoja sigue disponible para revisión manual.
        }
      }
      return ScannedPage(pageNumber: 1, imagePath: photo.path, qrData: qr);
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo leer la imagen. Intenta otra captura.'),
          ),
        );
      return null;
    } finally {
      if (mounted) {
        setState(() => _busy = false);
        if (retake) await _initLiveCamera();
      }
    }
  }

  Future<void> _addPage(SubmissionController controller, bool gallery) async {
    final page = await _readPage(gallery);
    if (mounted && page != null) controller.addPage(page);
  }

  Future<bool> _confirmDiscard() async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('¿Descartar las hojas capturadas?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Conservar'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Descartar'),
              ),
            ],
          ),
        ) ??
        false;
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<SubmissionController>(
      create: (_) => SubmissionController(),
      child: Consumer<SubmissionController>(
        builder: (context, controller, _) {
          return PopScope(
            canPop: !_busy && controller.pages.isEmpty,
            onPopInvokedWithResult: (didPop, _) async {
              if (!didPop &&
                  !_busy &&
                  await _confirmDiscard() &&
                  context.mounted) {
                controller.clearPages();
                Navigator.of(context).pop();
              }
            },
            child: Scaffold(
              backgroundColor: Colors.black,
              appBar: AppBar(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                title: Text(
                  widget.examTitle ?? widget.parallelName,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
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
                        onChanged: _busy
                            ? null
                            : (val) {
                                setState(() {
                                  _isAutoQrEnabled = val;
                                });
                              },
                      ),
                    ],
                  ),
                ],
              ),
              body: SafeArea(
                child: Stack(
                  children: [
                    // 1. Visor de Cámara en Vivo o Hoja de Examen Asistida
                    if (_isCameraInitialized && _cameraController != null)
                      Positioned.fill(
                        child: Center(child: CameraPreview(_cameraController!)),
                      )
                    else
                      Center(
                        child: _cameraMessage == null
                            ? const CircularProgressIndicator()
                            : Padding(
                                padding: const EdgeInsets.all(32),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _cameraMessage!,
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                        color: Colors.white,
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: _busy ? null : _initLiveCamera,
                                      child: const Text('Reintentar cámara'),
                                    ),
                                    TextButton(
                                      onPressed: _busy
                                          ? null
                                          : () => _addPage(controller, false),
                                      child: const Text(
                                        'Abrir cámara del dispositivo',
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                      ),

                    // 2. Visor de Cámara y Guía de Encuadre Neumórfica
                    if (_isCameraInitialized)
                      Positioned.fill(
                        child: IgnorePointer(
                          child: ScannerOverlay(
                            isQrDetected:
                                _isAutoQrEnabled &&
                                controller.pages.isNotEmpty &&
                                controller.pages.last.qrData != null,
                          ),
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
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5E3C).withOpacity(0.9),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${controller.pages.length} hojas capturadas',
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
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E3A8A)
                                    .withOpacity(0.85),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                '${widget.preselectedStudentName} · ${widget.preselectedStudentId}',
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
                      bottom: 16,
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
                                icon: const Icon(
                                  Icons.photo_library,
                                  color: Colors.white70,
                                ),
                                tooltip: 'Abrir galería',
                                onPressed: _busy
                                    ? null
                                    : () => _addPage(controller, true),
                              ),

                              // Botón Central Disparador (Obturador JPG)
                              IconButton.filled(
                                tooltip: 'Capturar página',
                                iconSize: 36,
                                style: IconButton.styleFrom(
                                  minimumSize: const Size(72, 72),
                                ),
                                onPressed: _busy || !_isCameraInitialized
                                    ? null
                                    : () => _addPage(controller, false),
                                icon: const Icon(Icons.camera_alt),
                              ),

                              // Botón Limpiar Páginas
                              IconButton(
                                iconSize: 32,
                                icon: const Icon(
                                  Icons.refresh,
                                  color: Colors.white70,
                                ),
                                tooltip: 'Descartar todas las hojas',
                                onPressed: _busy || controller.pages.isEmpty
                                    ? null
                                    : () async {
                                        if (await _confirmDiscard() && mounted)
                                          controller.clearPages();
                                      },
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
                                  backgroundColor: const Color(0xFF8B5E3C),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: const Icon(Icons.arrow_forward),
                                label: Text(
                                  'Revisar Páginas (${controller.pages.length})',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                onPressed: _busy
                                    ? null
                                    : () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) => ReviewPagesView(
                                              examId: widget.examId,
                                              examTitle:
                                                  widget.examTitle ??
                                                  widget.parallelName,
                                              retakePage: () => _readPage(
                                                false,
                                                retake: true,
                                              ),
                                              parallelId: widget.parallelId,
                                              controller: controller,
                                              preselectedStudentId:
                                                  widget.preselectedStudentId,
                                              preselectedStudentName:
                                                  widget.preselectedStudentName,
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
              ),
            ),
          );
        },
      ),
    );
  }
}

String? _inspectImage(Uint8List bytes) {
  final image = img.decodeImage(bytes);
  if (image == null) return null;
  final pixels = image
      .convert(numChannels: 4)
      .getBytes(order: img.ChannelOrder.abgr);
  final source = RGBLuminanceSource(
    image.width,
    image.height,
    pixels.buffer.asInt32List(),
  );
  try {
    return QRCodeReader()
        .decode(BinaryBitmap(GlobalHistogramBinarizer(source)))
        .text;
  } on ReaderException {
    return '';
  }
}
