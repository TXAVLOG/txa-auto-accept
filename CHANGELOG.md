# 📜 Nhật ký thay đổi (Changelog)

Tất cả các thay đổi đáng chú ý đối với dự án **TXA Auto Accept** sẽ được ghi lại trong tệp này.

---

## [8.0.0] — 2026-04-23
### Added
- **Enhanced Auto-Click Algorithm (v17 Engine)**: Thuật toán nhận diện phần tử mới với scoring system, retry mechanism (3 attempts), và post-click validation.
- **Element Validation**: Kiểm tra đầy đủ edge cases - obscured elements, out-of-viewport, hidden/disabled state, aria-disabled.
- **Element Fingerprinting**: Hệ thống fingerprint để tránh click trùng lặp với debounce 300ms.
- **Context Analysis**: Phân tích ngữ cảnh phần tử - modal, sidebar, editor, terminal, AI chat để đưa ra quyết định chính xác hơn.
- **Dangerous Pattern Detection**: Thêm kiểm tra các text nguy hiểm như delete, drop, remove, destroy, format, truncate.
### Changed
- **Event-Driven Architecture**: CDPHandler mở rộng từ EventEmitter, hỗ trợ events: connected, connectionLost, reconnecting, reconnected, healthCheck, scriptInjected, configUpdated, noConnections.
- **Health Check System**: Tự động kiểm tra kết nối CDP mỗi 10 giây với cơ chế reconnect tự động (max 3 attempts).
- **State Synchronization**: Thêm API `syncState()` để đồng bộ trạng thái giữa background và content scripts.
- **Memory Optimization**: Tự động garbage collection events khi vượt ngưỡng 50 items, theo dõi memory stats (GC count, peak events).
- **Connection Management**: Cải thiện WebSocket handling với timeout cấu hình được, heartbeat mechanism, và dispose() method.
### Fixed
- **Improved Error Handling**: Thêm _evalSafe() để không throw exception khi eval thất bại.
- **Script Caching**: Cache script content để tránh đọc file nhiều lần.
- **Race Condition Prevention**: Cải thiện cơ chế stop/start để tránh race conditions.
### Security
- **Backward Compatibility**: Đảm bảo tương thích ngược với VS Code ^1.85.0.
- **Versioned APIs**: Sử dụng API versioning (__txaStart_v17, __txaStop_v17, etc.) để dễ dàng migration.

## [7.4.5] — 2026-03-25
### Added
- **Git Protection Shield Boost**: Thêm `git checkout`, `git branch`, `git merge`, `git rebase` vào danh sách chặn mặc định (BUILTIN_DENY). ✅
- **Accidental Click Prevention**: Ngăn chặn triệt để việc tự động bấm vào các nút chuyển nhánh hoặc hợp nhất code trong IDE.

## [7.4.4] — 2026-03-25
### Added
- **CDP Relauncher Robustness (v16.3)**: Sửa lỗi script PowerShell (Array/Count) khi cài đặt CDP trên Windows. ✅
- **Improved Setup Script**: Nâng cao khả năng tìm kiếm shortcut IDE tại nhiều vị trí khác nhau (Desktop, OneDrive, Taskbar).
- **Error Handling**: Thêm Try/Catch khi lưu shortcut để tránh treo script khi gặp lỗi quyền truy cập.

## [7.4.3] — 2026-03-25
### Added
- **Ultra-Precise AI Command Detection (v16.2)**: Tối ưu bộ chọn cho các nút "Run" trong khung viền AI (`bg-primary`). ✅
- **Robust Click Simulation**: Thêm sự kiện `mousedown` và `mouseup` để tương thích hoàn toàn với các Framework UI hiện đại. 
- **Event Reporting Fix**: Sửa lỗi không hiển thị chi tiết "Target" và "Btn" trong nhật ký Dashboard. ✅
- **Shortcut Awareness**: Nhận diện thông minh các phím tắt (Alt+, Enter) hiển thị trên nút bấm.

## [7.4.2] — 2026-03-25
### Fixed
- **Version Synchronization**: Đồng bộ toàn bộ version 7.4.2 trên tất cả các file nguồn. 

## [7.4.1] — 2026-03-25
### Added
- **Manual Setup CDP**: Thêm lệnh `Setup CDP Connection (Manual)` để xử lý triệt để các lỗi kết nối. ✅
- **CDP Engine Fix**: Tăng độ nhạy khi nhận diện các nút có phím tắt (Alt+Enter).

## [7.4.0] — 2026-03-25
### Added
- **Command Management**: Bổ sung lệnh `toggleBackground` vào Command Palette.
- **Scope Fix**: Di chuyển hàm log ra phạm vi toàn cục để tránh lỗi ReferenceError khi khởi động. ✅
- **Stablity Build**: Bản dựng ổn định nhất phục vụ anh em TXA Team.

## [7.3.8] — 2026-03-25
### Added
- **PowerShell Shortcut Fixer**: Tích hợp logic sửa Shortcut mạnh mẽ từ MunKhin Agent.
- **CDP Setup Panel**: Giao diện hướng dẫn cài đặt CDP trực quan khi Engine không khả dụng. ✅
- **Auto-Relauncher Fix**: Sửa lỗi khởi tạo Relauncher khiến tính năng tự động tìm shortcut không hoạt động. ✅

## [7.3.6] — 2026-03-25
### Added
- **Backup & Restore (Sao lưu)**: Thêm chức năng Xuất và Nhập toàn bộ quy tắc (Rules) bảo vệ từ file JSON. ✅
- **Success Notifications**: Bổ sung thông báo "✅ Đã lưu cấu hình thành công!" khi người dùng bấm nút Save. ✅
### Fixed
- **CDP Connectivity Awareness**: Cải thiện hiển thị trên thanh trạng thái, báo `$(plug) OFF` màu vàng khi Engine bị ngắt kết nối trong khi tự động click vẫn bật. ✅
- **Engine Version Sync**: Đồng bộ hóa phiên bản v7.3.6 trên toàn bộ extension, Dashboard và tài liệu. ✅
- **VS Code Engine update**: Nâng cấp yêu cầu phiên bản VS Code tối thiểu lên `^1.85.0`. ✅

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
