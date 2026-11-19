class ScannedPage {
  final int pageNumber;
  final String imagePath;
  final String? qrData;

  ScannedPage({
    required this.pageNumber,
    required this.imagePath,
    this.qrData,
  });

  Map<String, dynamic> toMap() {
    return {
      'page_number': pageNumber,
      'image_path': imagePath,
      'qr_data': qrData,
    };
  }

  factory ScannedPage.fromMap(Map<String, dynamic> map) {
    return ScannedPage(
      pageNumber: map['page_number'] as int? ?? 1,
      imagePath: map['image_path'] as String? ?? '',
      qrData: map['qr_data'] as String?,
    );
  }

  ScannedPage copyWith({
    int? pageNumber,
    String? imagePath,
    String? qrData,
  }) {
    return ScannedPage(
      pageNumber: pageNumber ?? this.pageNumber,
      imagePath: imagePath ?? this.imagePath,
      qrData: qrData ?? this.qrData,
    );
  }
}
