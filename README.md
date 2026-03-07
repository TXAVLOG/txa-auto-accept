# 🛡️ TXA Auto Accept — Liquid Glass 2026 Premium

[![Version](https://img.shields.io/badge/version-4.0.3-6366f1.svg?style=for-the-badge)](https://github.com/TXAVLOG/txa-auto-accept)
[![Open VSX](https://img.shields.io/open-vsx/v/txa-team/txa-auto-accept?color=22d3ee&style=for-the-badge)](https://open-vsx.org/extension/txa-team/txa-auto-accept)
[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa.svg?style=for-the-badge)](LICENSE)

**TXA Auto Accept** là siêu trình mở rộng (Premium Extension) dành cho VS Code. Tự động hóa quá trình chấp nhận các hộp thoại khó chịu, click tự động thông minh, kết hợp cùng là một hệ thống Security Shield tường lửa vững chắc nhằm bảo vệ Editor của bạn khỏi mọi câu lệnh phá hoại.

Phiên bản **v4.0.x** được tốc độ cao bằng **Liquid Glass 2026** — Giao diện Glassmorphism đỉnh cao nhất từ trước tới nay kết hợp cùng hiệu ứng hạt (Aurora Particles), mang lại trải nghiệm Coding tương lai.

---

## ✨ Điểm nhấn Quyền Năng trên v4.0.3

- 🌌 **Giao diện Liquid Glass 2026** : Trải nghiệm Dashboard tuyệt đẹp, viền kính siêu mỏng, hiệu ứng bóng 3D, kết hợp hình nền Aurora chuyển động lơ lửng, tạo ra Dashboard phi thường ngay trong chính VS Code.
- 🎯 **Công nghệ Target Lock (CSS Selector)** : Cơ chế siêu dữ liệu khóa mục. Phân tích DOM và tự động thực thi click chính xác vào CSS Selector tùy chỉnh. Giải phóng toàn bộ công việc click chuột.
- 🛡️ **Shield Deny-List (Tường lửa thông minh)** : Bộ quy tắc chặn 60+ quy tắc được cấu hình sẵn: Chặn `rm -rf`, `format C:`, xóa Docker image hàng loạt, xóa Node module vô lý, mã độc đảo ngược shell, hay các payload nguy hiểm.
- 📉 **Threat Meter (Ra-đa rủi ro)** : Phân tích từng lệnh rác bằng AI giả lập, đánh giá mức độ nguy hiểm từ THẤP, TRUNG BÌNH đến CAO (Cảnh báo đỏ chiến dịch) trên mỗi nhật ký dòng.
- ⏱ **Mã thời gian hoạt động** : Bộ đếm thời gian sinh tồn Engine (Hoạt động không liên tục nghỉ tới từng giây).
- 🧠 **Smart Idle & Auto-Pause** : Bàn phím có tốc độ giao diện để tự động tạm dừng Engine, chống lặp vòng nhấp chuột khi bạn đang viết mã. Chế độ chờ siêu thông tin!
- ⚡ **Siêu mượt & Zero-Lag** : Node.js Worker và tiến trình tối ưu, cam kết thúc UI có độ trễ 0% trên VS Code. Cài đặt xong như đang sử dụng một tiện ích màn hình.

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
2. Tải phiên bản `.vsix` đuôi mới nhất `txa-auto-accept-4.0.3.vsix`.
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
