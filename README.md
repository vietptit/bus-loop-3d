# Bus Loop 3D

Game giải đố vẽ đường cho xe buýt, chơi trực tiếp trên trình duyệt (tối ưu cho điện thoại, màn hình dọc).

**Chơi:** mở `index.html` (hoặc link GitHub Pages của repo).

## Cách chơi
- Chạm vào xe rồi kéo để vẽ đường tới cổng cùng màu.
- Xe đi ngang **cờ màu** sẽ đón khách cùng màu (nếu còn chỗ).
- Xe đi ngang **trạm cờ** sẽ trả hết khách đang chở.
- Vẽ xong mọi xe là xe tự chạy. Đưa hết khách về trạm để qua màn.

## Cơ chế
| Từ màn | Cơ chế |
|---|---|
| 12 | Xe sức chứa khác nhau (số trên xe) |
| 15 | Trạm có màu – chỉ nhận khách cùng màu |
| 25 | Đường hầm – 2 xe đi chung ô, phải đi thẳng |
| 33 | Ống dịch chuyển – vẽ vào ống để sang ống cùng màu |

50 màn; màn 9–50 được sinh tự động bằng `tools/gen_levels.js` và đều đã kiểm chứng có lời giải.

Thêm `?fps` vào địa chỉ để xem FPS.

## Công cụ
- `tools/gen_levels.js` – sinh màn (luôn giải được, loại màn quá dễ).
- `tools/audit_levels.js` – kiểm tra màn nào chỉ cần đường ngắn nhất là thắng.
