# 📜 Nhật ký thay đổi (Changelog)

Tất cả các thay đổi đáng chú ý đối với dự án **TXA Auto Accept** sẽ được ghi lại trong tệp này.

---

## [7.3.5] — 2026-03-24
### Added
- **Invisible Mode (No UI Overhead)**: Loại bỏ hoàn toàn lớp phủ trạng thái (Overlay) trong IDE UI để đảm bảo không còn bất kỳ khung nào che khuất AI Chat Antigravity/Cursor. ✅
- **Engine v16.0 Ignition**: Tối ưu hóa hiệu năng quét ngầm sạch sẽ và Broad Element Selection cực nhạy. ✅
### Changed
- Phục hồi nhà phát hành (Publisher) về `txa-team` theo yêu cầu người dùng.
- Cập nhật đồng bộ link tải và ID tiện ích trên toàn bộ Dashboard và tài liệu.

## [7.3.1-preview] — 2026-03-24
### Fixed
- **Hotfix**: Sửa lỗi `relauncher.checkCDP is not a function` gây treo Engine khi khởi động.

## [7.3.0-preview] — 2026-03-24
### Added
- **Safety Guard (Chốt an toàn)**: Tự động chặn các nút nguy hiểm như "Delete", "Reset" hoặc "Force Push".
- **Ghost Click Preview**: Hiệu ứng "chuột ma" xung điện 600ms trước khi thực hiện cú click thật.
- **Aurora Overlay 2026 Premium**: Giao diện lớp phủ được nâng cấp với hiệu ứng Aurora và kính mờ (Glassmorphism) rực rỡ.
- **Improved AI Targeting**: Tối ưu bộ Selector cho mọi AI Assistant (Cline, Roo Code, Antigravity, Cursor).
- **Release Preview Branding**: Gắn tag và cập nhật giao diện Dashboard cho phiên bản xem trước.

## [7.2.1] — 2026-03-23
### Fixed
- **Triệt tiêu lỗi Engine Stop**: Sửa lỗi nghiêm trọng khi Engine báo đỏ (Off) nhưng vẫn tự động Click.
- Hợp nhất các vòng lặp quét (Unified Scan Loops) để tối ưu hóa tài nguyên IDE.
- Lệnh dừng tuyệt đối `__txaStop()` được gửi trực tiếp vào Browser/IDE UI.

## [7.2.0] — 2026-03-23
### Added
- **Dual-Loop Architecture**: Tách biệt hoàn toàn vòng lặp Bấm nút (Clicking) và Xoay Tab (Tab Cycling) mỗi 3 giây.
- **Auto IDE Detection**: Tự động nhận diện IDE (Cursor hoặc Antigravity) để áp dụng Selector chuẩn xác nhất.
- **User Interaction Guard**: Tự động tạm dừng Engine trong 1.5 giây khi phát hiện người dùng thao tác chuột thủ công.
- **Status Overlay 2.0**: Hiển thị danh sách Tab đang chạy ngầm và trạng thái hoàn thành trực tiếp trên màn hình.

## [7.1.0] — 2026-03-22
### Added
- Ra mắt phiên bản **Hybrid Engine** đầu tiên (Kết hợp CDP DOM Click + Terminal Output Monitor).
- **Dashboard Liquid Glass 2026 Premium**: Giao diện siêu mượt với hiệu ứng kính mờ và Aurora.
- **ROI Analytics**: Hệ thống theo dõi thời gian tiết kiệm được (Time Saved) theo thời gian thực.

## [6.0.0] — 2026-03-20
### Added
- Thiết kế lại toàn bộ hệ thống lõi sang hướng bảo mật Shield Protection.

## [4.0.8] - 2026-03-08
### Fixed
- Sửa lỗi nghiêm trọng: Toàn bộ shortcut và command không hoạt động do `onDidWriteTerminalData` (Proposed API).
- Extension giờ sẽ kiểm tra API tồn tại trước khi sử dụng.

---
*Phát triển bởi **TXA Team**.*
