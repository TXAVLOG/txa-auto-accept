# 📜 Nhật ký thay đổi (Changelog)

Tất cả các thay đổi đáng chú ý đối với dự án **TXA Auto Accept** sẽ được ghi lại trong tệp này.

---

## [4.0.8] - 2026-03-08
### Fixed
- Sửa lỗi nghiêm trọng: Toàn bộ shortcut và command không hoạt động do `onDidWriteTerminalData` (Proposed API) đã bị xóa khỏi VS Code mới.
- Extension giờ sẽ kiểm tra API tồn tại trước khi sử dụng, đảm bảo activate thành công trên mọi phiên bản.

## [4.0.7] - 2026-03-07
- Sửa lỗi các nút bấm trên Dashboard không nhận thao tác click do lớp overlay của Pick Mode chặn sự kiện.

## [4.0.6] - 2026-03-07
### Added
- Tích hợp âm thanh thông báo cao cấp "Quantum Bloom" (Đã qua xử lý fade/trim).
- Chuyển âm thanh sang cơ chế Base64 để hoạt động ổn định trên mọi môi trường.
- Đồng bộ hóa phiên bản hệ thống lên v4.0.6.

## [4.0.5] - 2026-03-07
### Added
- Âm thanh thông báo (Sound Notifications) khi chặn hoặc chấp nhận mục tiêu.
- Mở rộng chi tiết nhật ký (Log Details) khi nhấp vào dòng log.
- Cải thiện bộ đếm thời gian (Uptime Ticker): Tự động tạm dừng khi Engine tắt.
- Bố sung nhãn (Label) và tooltip giải thích cho bộ đếm Uptime.
- Tên phiên bản trong thông báo khởi động giờ đã được cập nhật tự động.

## [4.0.4] - 2026-03-07
### Added
- Thiết kế lại mục Tính năng trong README sang phong cách hiện đại, bền vững hơn.

## [4.0.3] - 2026-03-07
### Added
- Bổ sung tệp `CHANGELOG.md` để hiển thị lịch sử cập nhật trên Open VSX.
- Tối ưu hóa mô tả hướng dẫn cài đặt trong README.

## [4.0.2] - 2026-03-07
### Fixed
- Cập nhật hướng dẫn cài đặt qua Extensions Panel với mã định danh `@id:txa-team.txa-auto-accept`.
- Tối ưu hóa hệ thống thông báo cập nhật tự động.

## [4.0.1] - 2026-03-07
### Added
- Mở rộng tài liệu hướng dẫn chi tiết trong README.
- Đồng bộ hóa phiên bản trên các nền tảng Store.

## [4.0.0] - 2026-03-07
### Added
- **Liquid Glass 2026 UI**: Giao diện hoàn toàn mới với hiệu ứng Aurora và Particles.
- **Target Lock**: Cơ chế khóa mục tiêu bằng CSS Selector.
- **Shield Deny-List**: Tích hợp sẵn 60+ quy tắc bảo vệ Terminal.
- **Threat Meter**: Thanh đo lường mức độ nguy hiểm thời gian thực.
- **Uptime Ticker**: Theo dõi thời gian hoạt động của Engine.
- **Smart Idle**: Tự động tạm dừng khi người dùng gõ phím.

---
*Phát triển bởi **TXA Team**.*
