# Bus Loop 3D — Nhật ký phát triển

Ghi lại mọi thay đổi để sau này không quên. Mới nhất ở trên cùng.

Link chơi: https://vietptit.github.io/bus-loop-3d/ · Repo: https://github.com/vietptit/bus-loop-3d

---

## v3 — Game hoàn chỉnh (2026-11-05)

**Giao diện (tham khảo phong cách Snacky Dash, vẽ lại bằng CSS — không chép ảnh của project đó)**
- Tông tím + vàng + xanh lá: khung tím viền đậm, nút xanh/vàng bóng, ruy-băng tiêu đề.
- **Màn hình chính**: logo BUS LOOP, xe chạy qua lại, nút CHƠI (hiện màn đang tới), xu, tim (chưa dùng), nút cài đặt.
- **Thanh điều hướng dưới**: Cửa hàng · Trang chủ · Chọn màn.
- **Cài đặt**: bật/tắt âm thanh, rung, về trang chủ, xoá tiến độ.
- **Cửa hàng (bản thử)**: mua gợi ý / lùi bước / đầy tim bằng xu — hiện chỉ trừ xu, chưa cộng vật phẩm.
- **Thắng/thua**: ruy-băng HOÀN THÀNH / THẤT BẠI, phần thưởng xu, nút Màn tiếp / Chơi lại / Trang chủ.
- Trong game có thêm nút 🏠 và ⚙️; HUD tự ẩn khi ở màn hình chính.

**Gameplay / hình ảnh**
- **Xe theo sức chứa**: 3 chỗ (nhỏ, ×0.70), 6 chỗ (vừa, ×0.82), 9 chỗ (to, ×0.96).
- **Trạm dùng chung luôn cờ trắng**, không đổi màu khi khách xuống (trước đây đổi màu → dễ nhầm với trạm riêng).
  Trạm riêng (chỉ nhận 1 màu) có cờ + đế màu từ đầu.
- **Đường hầm → Cầu vượt**: xe đi dọc chạy lên cầu (dốc lên ở 2 ô kề), xe đi ngang chui dưới gầm.
  Luật không đổi: 2 xe dùng chung ô, phải đi thẳng, không dừng trên cầu. Icon 🌉 trong bảng chọn màn.

**Màu sắc (theo góp ý "tím quá, chưa rực rỡ")**
- Đổi sang tông sáng cho trẻ em: khung xanh dương tươi, nền trời xanh → vàng nắng, nút xanh lá / vàng, màn có cơ chế nền hồng.
- Màn hình chính có cảnh vẽ bằng CSS (tự làm, không dùng ảnh game khác): trời, mây, đường có vạch, cỏ, bụi cây; logo có ruy-băng "GIẢI ĐỐ XE BUÝT".

**Sửa theo review của Codex**
- Về trang chủ ngay sau thắng/thua không còn bị bảng kết quả bật đè lên.
- Cửa hàng tạm khoá nút mua ("Sắp có") — tránh trừ xu mà không có vật phẩm.
- Xe lên/xuống cầu tính độ cao theo quãng đường trên lộ trình (không giật khi rẽ cạnh cầu).
- Dốc cầu tính từ 2 đầu thật, khớp mặt cầu.

File vá: `tools/apply_ui_v3.js`, `tools/fix_v3_review.js` (+ sửa tay: ẩn HUD ở home, chữ "Màn X" một dòng, bảng màu sáng, cảnh nền home).
Kiểm thử: 50/50 màn thắng khi chạy lời giải mẫu.

## v2.3 — Chọn màn
- Chạm "Màn X" mở bảng 50 màn, mở khoá hết để test.
- Màn có cơ chế: nền tím + icon (🚌 sức chứa, 🚩 trạm màu, 🌉 cầu vượt, 🌀 dịch chuyển).
- Màn giới thiệu cơ chế: viền vàng + nhãn MỚI (màn 8, 15, 25, 33).

## v2.2 — Đếm theo người
- Mọi con số đếm **người** (mỗi nhóm = 3 người): cờ ghi 6 khi có 6 người, xe 0/6, bộ đếm dưới.
- Mỗi người lên/xuống hiện **+1** riêng (bản vá do Codex viết, Claude duyệt).

## v2.1 — 50 màn + 4 cơ chế
- Màn 9–50 sinh bằng `tools/gen_levels.js`: dựng lời giải trước rồi đặt khách/trạm; **loại màn chỉ cần đường ngắn nhất là thắng** (`tools/audit_levels.js`).
- Cơ chế: xe khác sức chứa (từ màn 9), trạm màu (15), cầu vượt (25), ống dịch chuyển (33).
- Xe buýt mui trần, chuyển động mượt: tăng/giảm tốc êm, chậm khi vào cua, nghiêng thân ra ngoài khi cua, chúi đầu khi phanh.

## v2 — Toon shader
- MeshToonMaterial 3 bậc + viền đậm (OutlineEffect), người chibi đầu to, giao diện kem-nâu, bỏ sao.
- Đồng hồ FPS (`?fps`) + tự hạ chất lượng khi < 40 fps (Q2 → Q1 → Q0).

## v1 — Làm lại đồ hoạ
- Đường vẽ dạng đường đất bo cua, mũi tên chạy theo màu xe; xe/người/cờ đồ chơi; âm thanh, rung, hiệu ứng nhảy.
- Luật nới cho trẻ em: chạm đường xe khác chỉ báo đỏ (không xoá cả đường); kéo lùi về ô cũ bất kỳ để cắt.

---

## Ghi chú kỹ thuật
- Một file duy nhất `bus_loop_3d.html` (Three.js r170 qua CDN, cần internet). `index.html` chuyển hướng vào game.
- API test trong console: `window.__bus3dTest` — `verify()`, `solveNow()`, `step(sec)`, `audit()`, `reset(i)`, `quality(q)`.
- Kiểm thử chuẩn sau mỗi thay đổi: `verify()` cả 50 màn + cho chạy lời giải mẫu từng màn phải `won`.
- Codex CLI (từ extension VS Code) chỉ chạy được ở `--sandbox read-only` trên máy này (chế độ ghi bị lỗi sandbox Windows).
- Gemini/Antigravity: chưa có CLI để điều khiển tự động.

## Việc còn lại / ý tưởng
- Cửa hàng chưa cộng vật phẩm thật; tim chưa trừ khi thua.
- Cân độ khó thủ công cho các màn sinh tự động.
- Âm nhạc nền, hiệu ứng chuyển cảnh giữa các màn hình.
