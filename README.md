# 🛡️ TXA Auto Accept — Liquid Glass 2026 Premium

[![Version](https://img.shields.io/badge/version-4.0.2-6366f1.svg?style=for-the-badge)](https://github.com/TXAVLOG/txa-auto-accept)
[![Open VSX](https://img.shields.io/open-vsx/v/txa-team/txa-auto-accept?color=22d3ee&style=for-the-badge)](https://open-vsx.org/extension/txa-team/txa-auto-accept)
[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa.svg?style=for-the-badge)](LICENSE)

**TXA Auto Accept** là siêu trình mở rộng (Premium Extension) dành cho VS Code. Tự động hóa quá trình chấp nhận các hộp thoại khó chịu, click tự động thông minh, kết hợp cùng là một hệ thống Security Shield tường lửa vững chắc nhằm bảo vệ Editor của bạn khỏi mọi câu lệnh phá hoại.

Phiên bản **v4.0.x** được lột xác bằng **Liquid Glass 2026** — Giao diện Glassmorphism đỉnh nhất từ trước tới nay kết hợp cùng hiệu ứng hạt (Aurora Particles), mang lại trải nghiệm Coding tương lai.

---

## ✨ Điểm nhấn Quyền Năng trên v4.0.1

- 🌌 **Giao diện Liquid Glass 2026**: Trải nghiệm Dashboard tuyệt đẹp, viền kính siêu mỏng, hiệu ứng đổ bóng 3D, kết hợp hình nền Aurora chuyển động lơ lửng, tạo ra Dashboard phi thường ngay trong chính VS Code.
- 🎯 **Công nghệ Target Lock (CSS Selector)**: Cơ chế khóa mục tiêu siêu việt. Phân tích DOM và tự động thực thi click chính xác vào CSS Selector tuỳ chỉnh. Giải phóng triệt để việc click tay.
- 🛡️ **Shield Deny-List (Tường lửa thông minh)**: Bộ quy tắc chặn **60+ rules** được config sẵn: Chặn đứng `rm -rf`, `format C:`, xoá Docker image hàng loạt, xoá Node modules vô lý, mã độc reverse shell, hay các payload nguy hiểm.
- 📉 **Threat Meter (Ra-đa rủi ro)**: Phân tích mỗi lệnh rác bằng AI giả lập, đánh giá mức độ nguy hiểm từ LOW, MEDIUM đến HIGH (Chiến dịch Red Alert) trên từng dòng log.
- ⏱ **Uptime Ticker**: Bộ đếm thời gian sinh tồn Engine (Hoạt động không ngừng nghỉ tới từng giây).
- 🧠 **Smart Idle & Auto-Pause**: Nhận diện nhịp độ bàn phím để auto-pause Engine, chống click trùng lặp khi bạn đang code. Chế độ chờ siêu thông minh!
- ⚡ **Siêu mượt & Zero-Lag**: Tối ưu Node.js worker và tiến trình ngầm, cam kết 0% delay UI trên VS Code. Cài xong như đang dùng một tiện ích tàng hình.

---

## 🚀 Hướng dẫn Cài đặt & Triển khai

Là một Coder thực thụ, bạn có 2 cách siêu nhanh gọn để tích hợp hệ thống này vào Editor:

### 🌐 Cách 1: Cài trực tiếp từ Extensions Panel (Tự động Update — Khuyên Dùng)
*Lý tưởng cho VS Code, VSCodium, Cursor, Windsurf và các trình biên dịch mã nguồn mở khác.*
1. Mở VS Code → nhấn `Ctrl+Shift+X` để vào tab **Extensions**.
2. Gõ tìm kiếm: `TXA Auto Accept` hoặc dán mã định danh duy nhất:
   ```
   @id:txa-team.txa-auto-accept
   ```
3. Nhấn **Install** — xong! Extension sẽ **tự động cập nhật** mỗi khi có phiên bản mới.
4. Hoặc truy cập trực tiếp: [Open VSX Registry — TXA Auto Accept](https://open-vsx.org/extension/txa-team/txa-auto-accept).

### 📦 Cách 2: Setup file VSIX truyền thống (Cho Master Offline)
1. Thưởng thức UI Store cực đỉnh tại [Cửa hàng TXA TEAM Store](https://txavlog.github.io/txa-auto-accept/) hoặc xem logs ở repo [GitHub Releases](https://github.com/TXAVLOG/txa-auto-accept/releases).
2. Tải phiên bản `.vsix` đuôi mới nhất `txa-auto-accept-4.0.2.vsix`.
3. Mở VS Code → **Extensions** (`Ctrl+Shift+X`).
4. Tại góc trên cùng bên phải, nhấp vào menu dấu 3 chấm `...` → Chọn **Install from VSIX...** → Click vào file mới tải. Cài xong là chạy ngay!

---

## 🛠️ Hướng dẫn Sử dụng (Trực Quan Sinh Động)

Cài xong là Engine hoạt động luôn ngầm. Để tương tác toàn bộ tính năng cao cấp của TXA Auto Accept:

* **Bật Giao Diện**: Bấm nhanh phím tắt `Alt+Shift+A` hoặc click vào icon cái **Khiên Xanh (🛡️)** nằm khiêm tốn ở Status Bar phía dưới cùng màn hình VS Code.
* **💻 Tab GIÁM SÁT**: View bảng điều khiển thời gian thực: Radar quét lỗi, số lần đã ngăn chặn, log hoạt động (có cả thanh màu tương ứng: Xanh an toàn, Đỏ nguy hiểm).
* **⚙️ Tab CẤU HÌNH**: Set tốc độ click (Tính bằng Mili-giây), Đổi ngôn ngữ (Anh/Việt), và tuỳ chọn CSS Selector nâng cao (Cho dân Pro).
* **🛡️ Tab LÁ CHẮN (SHIELD)**: Thêm hoặc gỡ bỏ các câu lệnh bạn ghét cay ghét đắng. Cần chặn lệnh npm lỗi? Thêm vào Shield. Cần chặn lệnh format nhánh main? Thêm ngay! Tool đã trang bị Quick Suggest cho 60 lệnh hắc ám.
* **🎯 Element Picker Tool**: Sử dụng nút Target 🎯 để lấy tự động Class/ID của một phần tử bất kỳ. Không cần F12 mở DevTool căng mắt dò tìm.

---

## ⌨️ Bảng Phím tắt Thần thánh (Keymaps)

Bộ ba phím tắt tiết kiệm 99% thời gian click chuột:
| Phím tắt | Vũ khí kích hoạt | Diễn giải |
| :---: | :--- | :--- |
| `Alt + Shift + A` | **Giao diện Liquid Glass** | Kích hoạt ngay lập tức Dashboard quản lý và theo dõi Log. |
| `Alt + A` | **Trigger Engine** | Bật / Tắt trạng thái Auto Accept tức thời, áp dụng ngay tắp lự. |
| `Alt + R` | **Nuke State** | Xóa toàn bộ Log lỗi, đưa Counter về 0, F5 làm mới lại hệ thống sạch bóng. |

---

## 🤝 Tham Gia Nâng Cấp Engine (Cộng Đồng)

TXA Team tin rằng sự đóng góp của bạn là lõi sức mạnh:
- Report lỗi hoặc UI chưa mượt tại [GitHub Issues](https://github.com/TXAVLOG/txa-auto-accept/issues).
- Nếu bạn có kỹ năng React / Extension Dev? [Mở Pull Request](https://github.com/TXAVLOG/txa-auto-accept/pulls) nha, Team rất háo hức!

<p align="center">
<br/>
© 2026 Phiên bản Tương Lai chế tác bởi vũ trụ <strong>TXA Team</strong>.<br/>Free for all với chuẩn <b>MIT License</b> vĩnh viễn.
</p>
