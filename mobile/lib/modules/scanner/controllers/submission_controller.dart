import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../core/network/api_client.dart';
import '../models/scanned_page.dart';

enum SubmissionStatus {
  initial,
  submitting,
  rateLimited,
  paused,
  success,
  error,
}

class SubmissionController extends ChangeNotifier {
  final ApiClient _apiClient;

  SubmissionController({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final List<ScannedPage> _pages = [];
  SubmissionStatus _status = SubmissionStatus.initial;
  String? _errorMessage;
  dynamic _lastResult;

  int _retryAttempt = 0;
  String? _currentEvaluationId;
  String? _lastExamId;
  String? _lastParallelId;
  String? _lastStudentIdentifier;
  Timer? _retryTimer;

  ApiClient get apiClient => _apiClient;
  List<ScannedPage> get pages => List.unmodifiable(_pages);
  SubmissionStatus get status => _status;
  String? get errorMessage => _errorMessage;
  dynamic get lastResult => _lastResult;

  int get retryAttempt => _retryAttempt;
  String? get currentEvaluationId => _currentEvaluationId;
  bool get isRateLimited => _status == SubmissionStatus.rateLimited;
  bool get isPaused => _status == SubmissionStatus.paused;

  @override
  void dispose() {
    _retryTimer?.cancel();
    super.dispose();
  }

  void addPage(ScannedPage page) {
    final newNumber = _pages.length + 1;
    _pages.add(page.copyWith(pageNumber: newNumber));
    notifyListeners();
  }

  void removePageAt(int index) {
    if (index >= 0 && index < _pages.length) {
      _pages.removeAt(index);
      for (int i = 0; i < _pages.length; i++) {
        _pages[i] = _pages[i].copyWith(pageNumber: i + 1);
      }
      notifyListeners();
    }
  }

  void movePage(int from, int to) {
    final page = _pages.removeAt(from);
    _pages.insert(to, page);
    for (var index = 0; index < _pages.length; index++) {
      _pages[index] = _pages[index].copyWith(pageNumber: index + 1);
    }
    notifyListeners();
  }

  void replacePage(int index, ScannedPage page) {
    _pages[index] = page.copyWith(pageNumber: index + 1);
    notifyListeners();
  }

  void clearPages() {
    _retryTimer?.cancel();
    _pages.clear();
    _status = SubmissionStatus.initial;
    _errorMessage = null;
    _lastResult = null;
    _retryAttempt = 0;
    _currentEvaluationId = null;
    _lastExamId = null;
    _lastParallelId = null;
    _lastStudentIdentifier = null;
    notifyListeners();
  }

  void pauseAnalysis() {
    _retryTimer?.cancel();
    _status = SubmissionStatus.paused;
    _errorMessage =
        'Análisis pausado. Las fotografías se mantienen en memoria.';
    notifyListeners();
  }

  Future<bool> retrySubmission() async {
    _retryTimer?.cancel();
    _retryAttempt++;
    if (_lastExamId != null) {
      return submitExamSubmission(
        examId: _lastExamId!,
        parallelId: _lastParallelId,
        studentIdentifier: _lastStudentIdentifier,
      );
    }
    return false;
  }

  Future<bool> submitExamSubmission({
    required String examId,
    String? parallelId,
    String? studentIdentifier,
  }) async {
    if (_status == SubmissionStatus.submitting) return false;
    if (_pages.isEmpty) {
      _errorMessage = 'No hay páginas escaneadas para enviar';
      _status = SubmissionStatus.initial;
      notifyListeners();
      return false;
    }

    _lastExamId = examId;
    _lastParallelId = parallelId;
    _lastStudentIdentifier = studentIdentifier;

    _status = SubmissionStatus.submitting;
    _errorMessage = null;
    notifyListeners();

    try {
      final formData = FormData();
      formData.fields.add(MapEntry('exam_id', examId));
      if (parallelId != null && parallelId.isNotEmpty) {
        formData.fields.add(MapEntry('parallel_id', parallelId));
      }
      if (studentIdentifier != null && studentIdentifier.isNotEmpty) {
        formData.fields.add(MapEntry('student_identifier', studentIdentifier));
      }

      for (final page in _pages) {
        final file = File(page.imagePath);
        final fileName = 'page_${page.pageNumber}.jpg';
        if (await file.exists()) {
          formData.files.add(
            MapEntry(
              'pages',
              await MultipartFile.fromFile(page.imagePath, filename: fileName),
            ),
          );
        } else {
          throw StateError(
            'Falta la imagen de la página ${page.pageNumber}. Vuelve a tomarla.',
          );
        }
      }

      final response = await _apiClient.postMultipart(
        '/evaluations/submit/',
        formData: formData,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        _status = SubmissionStatus.success;
        _lastResult = response.data;
        _retryAttempt = 0;
        notifyListeners();
        return true;
      } else if (response.statusCode == 429 ||
          response.data?['error'] == 'IA_SATURADA') {
        _status = SubmissionStatus.rateLimited;
        _currentEvaluationId = response.data?['evaluation_id']?.toString();
        _errorMessage = 'El análisis está ocupado. Puedes volver a intentarlo con las mismas fotos.';
        notifyListeners();
        return false;
      } else {
        _status = SubmissionStatus.error;
        _errorMessage = 'Error del servidor: ${response.statusCode}';
        notifyListeners();
        return false;
      }
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      final responseData = e.response?.data;

      if (statusCode == 429 ||
          (responseData is Map && responseData['error'] == 'IA_SATURADA')) {
        _status = SubmissionStatus.rateLimited;
        if (responseData is Map) {
          _currentEvaluationId = responseData['evaluation_id']?.toString();
        }
        _errorMessage = 'El análisis está ocupado. Puedes volver a intentarlo con las mismas fotos.';
        notifyListeners();
        return false;
      }

      _status = SubmissionStatus.error;
      _errorMessage =
          (responseData is Map
              ? (responseData['error'] ?? responseData['detail'])
              : null) ??
          e.message ??
          'Error al conectar con el servidor';
      notifyListeners();
      return false;
    } catch (e) {
      _status = SubmissionStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
