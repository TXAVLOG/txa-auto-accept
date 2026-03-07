# 🛡️ TXA Auto Accept - Premium Edition

[![Version](https://img.shields.io/badge/version-3.2.4-blue.svg)](https://github.com/TXAVLOG/txa-auto-accept)
[![Open VSX](https://img.shields.io/open-vsx/v/txa-team/txa-auto-accept.svg)](https://open-vsx.org/extension/txa-team/txa-auto-accept)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**TXA Auto Accept** là một tiện ích mở rộng (extension) cho VS Code được thiết kế với giao diện **Liquid Glass Morphism** siêu đẹp, giúp tự động hóa việc chấp nhận hoặc từ chối các hộp thoại, lệnh trong môi trường lập trình của bạn một cách thông minh và an toàn.

## ✨ Tính năng nổi bật

- 🌊 **Giao diện Liquid Glass**: Dashboard giám sát thời gian thực với hiệu ứng kính mờ cao cấp.
- 🎯 **Target Lock (CSS Selector)**: Tự động tìm và bấm chính xác vào các phần tử UI được chỉ định.
- 🛡️ **Shield Deny-List**: Hệ thống bảo vệ mạnh mẽ, tự động chặn các lệnh nguy hiểm (ví dụ: `rm -rf`, `format C:`, ...).
- ⌨️ **Smart Idle**: Tự động tạm dừng khi bạn đang gõ phím để tránh xung đột.
- 🌍 **Đa ngôn ngữ**: Hỗ trợ đầy đủ Tiếng Việt và Tiếng Anh.
- ⚡ **Siêu nhẹ**: Hoạt động mượt mà, không gây lag VS Code.

## 🚀 Hướng dẫn cài đặt

Bạn có thể cài đặt **TXA Auto Accept** theo 1 trong 2 cách sau:

### Cách 1: Cài đặt qua Open VSX(Recommend)
1. Truy cập [Open VSX Registry - TXA Auto Accept](https://open-vsx.org/extension/txa-team/txa-auto-accept).
2. Tải về hoặc cài đặt trực tiếp từ chợ ứng dụng của trình biên soạn hỗ trợ Open VSX.

### Cách 2: Cài đặt thủ công bằng file VSIX (Dành cho VS Code)
1. Truy cập vào [Cửa hàng TXA TEAM](https://txavlog.github.io/txa-auto-accept/) hoặc mục [Releases](https://github.com/TXAVLOG/txa-auto-accept/releases).
2. Tải file `.vsix` phiên bản mới nhất.
3. Trong VS Code, mở tab **Extensions** (`Ctrl+Shift+X`).
4. Bấm vào dấu ba chấm `...` ở góc trên bên phải và chọn **Install from VSIX...**.
5. Chọn file đã tải về và cài đặt.

## 🛠️ Cách sử dụng

1. **Mở Dashboard**: Bấm vào biểu tượng Khiên Xanh ở thanh trạng thái (Status Bar) hoặc dùng lệnh `TXA: Open Dashboard`.
2. **Cấu hình**:
   - Tab **GIÁM SÁT**: Xem số lượng lệnh đã chấp nhận/chặn và nhật ký hoạt động. Có nút **Reset** để xóa sạch dữ liệu cũ.
   - Tab **CẤU HÌNH**: Tùy chỉnh ngôn ngữ, chu kỳ quét, thời gian chờ khi gõ phím.
   - Tab **LÁ CHẮN**: Thêm/Xóa các mẫu (Regex) lệnh cần chặn để bảo vệ hệ thống.
3. **Element Picker**: Sử dụng biểu tượng "🎯" cạnh ô Custom Selector trong tab Cấu hình để chọn trực tiếp phần tử trên trang webview (nếu cần).

## 📁 Cấu trúc dự án

- `extension.js`: Logic chính của Extension.
- `src/webview.js`: Engine tạo giao diện Dashboard.
- `src/i18n.js`: Quản lý ngôn ngữ (Việt/Anh).
- `src/constants.js`: Các hằng số và bộ lọc mặc định.
- `icon.png`: Biểu tượng Extension.

## 🤝 Đóng góp

Nếu bạn phát hiện lỗi hoặc có ý tưởng mới, đừng ngần ngại:
- Mở một [Issue](https://github.com/TXAVLOG/txa-auto-accept/issues)
- Gửi [Pull Request](https://github.com/TXAVLOG/txa-auto-accept/pulls)

## 📄 Bản quyền

Dự án được phát hành dưới giấy phép **MIT**. Phát triển bởi **TXAVLOG**.
