# 🛡️ TXA Auto Accept — Liquid Glass 2026 Edition

[![Version](https://img.shields.io/badge/version-4.0.0-6366f1.svg)](https://github.com/TXAVLOG/txa-auto-accept)
[![Open VSX](https://img.shields.io/open-vsx/v/txa-team/txa-auto-accept?color=22d3ee)](https://open-vsx.org/extension/txa-team/txa-auto-accept)
[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa.svg)](LICENSE)

**TXA Auto Accept** là tiện ích mở rộng cho VS Code với giao diện **Liquid Glass 2026** — tự động hóa việc chấp nhận/từ chối các hộp thoại, lệnh trong môi trường lập trình một cách thông minh và an toàn.

## ✨ Tính năng nổi bật

- 🌊 **Giao diện Liquid Glass 2026**: Aurora animated background, particle system, glass morphism dashboard.
- 🎯 **Target Lock (CSS Selector)**: Tự động tìm và bấm chính xác vào các phần tử UI được chỉ định.
- 🛡️ **Shield Deny-List**: Hệ thống bảo vệ 60+ rules mặc định, chặn `rm -rf`, `format C:`, reverse shell, Docker prune,...
- 📊 **Threat Meter**: Thanh đo mức độ đe dọa thời gian thực (LOW/MEDIUM/HIGH).
- ⏱ **Uptime Ticker**: Hiển thị thời gian engine hoạt động liên tục.
- 🔍 **Shield Search**: Tìm kiếm nhanh trong danh sách deny rules.
- ⌨️ **Smart Idle**: Tạm dừng khi gõ phím để tránh xung đột.
- 🌍 **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và Tiếng Anh.
- ⚡ **Siêu nhẹ**: Hoạt động mượt mà, không gây lag VS Code.

## 🚀 Hướng dẫn cài đặt

### Cách 1: Cài đặt qua Open VSX (Khuyên dùng)

1. Truy cập [Open VSX Registry — TXA Auto Accept](https://open-vsx.org/extension/txa-team/txa-auto-accept).
2. Bấm **Install** hoặc tải về trực tiếp từ chợ ứng dụng.

### Cách 2: Cài đặt thủ công bằng file VSIX

1. Truy cập [Cửa hàng TXA TEAM](https://txavlog.github.io/txa-auto-accept/) hoặc [Releases](https://github.com/TXAVLOG/txa-auto-accept/releases).
2. Tải file `.vsix` phiên bản mới nhất.
3. Trong VS Code, mở tab **Extensions** (`Ctrl+Shift+X`).
4. Bấm `...` → **Install from VSIX...** → Chọn file vừa tải.

## 🛠️ Cách sử dụng

1. **Mở Dashboard**: Bấm biểu tượng 🛡️ ở thanh Status Bar hoặc dùng lệnh `TXA: Open Dashboard` (`Alt+Shift+A`).
2. **Tab GIÁM SÁT**: Xem số lệnh chấp nhận/chặn, threat meter, uptime và nhật ký hoạt động.
3. **Tab CẤU HÌNH**: Tùy chỉnh ngôn ngữ, chu kỳ quét, idle timeout, custom CSS selector.
4. **Tab LÁ CHẮN**: Thêm/xóa rules (hỗ trợ Regex), tìm kiếm nhanh, auto-suggest 60+ patterns.
5. **Tab GIỚI THIỆU**: Thông tin phiên bản, links GitHub và Marketplace.
6. **Element Picker**: Biểu tượng 🎯 trong tab Cấu hình để chọn phần tử trực tiếp.

## ⌨️ Phím tắt

| Phím tắt | Chức năng |
|----------|-----------|
| `Alt+Shift+A` | Mở Dashboard |
| `Alt+A` | Bật/tắt Engine |
| `Alt+R` | Reset Counter & Logs |

## 🤝 Đóng góp

- Mở [Issue](https://github.com/TXAVLOG/txa-auto-accept/issues) nếu phát hiện lỗi
- Gửi [Pull Request](https://github.com/TXAVLOG/txa-auto-accept/pulls) nếu có ý tưởng mới

## 📄 Bản quyền

Dự án được phát hành dưới giấy phép **MIT**. Phát triển bởi **TXA Team**.
