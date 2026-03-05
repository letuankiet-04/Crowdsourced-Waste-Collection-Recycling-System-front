# Kế hoạch: Thêm nút Reject ở màn Accept task (Collector) và báo Enterprise để reassign

## Mục tiêu
- Ở màn hình chi tiết task của Collector, tại trạng thái “Assigned” (đang có nút Accept), thêm nút **Reject** để Collector từ chối task.
- Sau khi Reject, trạng thái task được cập nhật và Enterprise nhận biết để **reassign** (theo khả năng hệ thống hiện có).

## Phạm vi thay đổi dự kiến
- Collector UI: trang chi tiết task và luồng gọi API reject.
- (Tuỳ backend trả dữ liệu) tạo notification cho Enterprise hoặc đảm bảo Enterprise nhìn thấy trạng thái để reassign.

## Các file/điểm chạm chính
- Collector detail (nút Accept hiện có): `src/features/collector/pages/Collector_ReportDetail.jsx`
- API collector: `src/services/collector.service.js` (đã có `rejectCollectorTask(requestId, reason)`)
- UI confirm: `src/shared/ui/ConfirmDialog.jsx`
- Enterprise reassign hiện có (tham chiếu): `src/features/enterprise/pages/Enterprise_ReportDetail.jsx`
- Notifications service (tham chiếu nếu cần): `src/services/notifications.js`

## Các bước thực hiện
1) **Xác định điều kiện hiển thị nút Reject**
   - Dựa trên logic hiện tại: `rawStatus === "assigned"` đang cho phép Accept.
   - Quy ước: Reject chỉ xuất hiện khi `rawStatus === "assigned"` (cùng vị trí với Accept) để đúng yêu cầu “ở accept task”.

2) **Thêm nút Reject trên Collector_ReportDetail**
   - Render thêm 1 `Button` cạnh nút Accept (cùng hàng action).
   - Style/variant: màu đỏ (phù hợp trạng thái “Rejected”) và icon phù hợp (nếu repo đã dùng lucide-react, ưu tiên icon sẵn có như `XCircle`/`Ban`).
   - Khi bấm: mở `ConfirmDialog` với nội dung xác nhận reject.

3) **Gọi API reject và cập nhật UI state**
   - Trong action của confirm:
     - `await rejectCollectorTask(requestId, reason)`:
       - Mặc định gửi `reason = ""` (vì ConfirmDialog hiện không có input). Nếu backend bắt buộc reason, sẽ xử lý bằng cách thêm UI nhập reason ở bước 3b.
     - Refetch `getCollectorTasks({ all: true })` giống flow Accept để lấy trạng thái mới.
     - `setTask(next)` nếu còn thấy task trong list; nếu task biến mất khỏi list (tuỳ backend), điều hướng về dashboard/tasks.
     - Hiển thị toast `notify.success("Rejected", "...")` và toast error khi fail.

   3b) **(Tuỳ chọn) Nếu backend yêu cầu reason bắt buộc**
   - Tạo một dialog đơn giản có `textarea` để nhập reason (tái dùng layout/dialog patterns hiện có), hoặc mở rộng ConfirmDialog theo pattern sẵn có.
   - Khi submit: gọi `rejectCollectorTask(requestId, reasonTrimmed)`.

4) **Đảm bảo Enterprise “nhận biết” để reassign**
   - Kiểm tra dữ liệu trả về sau reject/refetch:
     - Nếu task/report có sẵn `enterpriseUserId`/`enterpriseId` (hoặc tương đương):
       - Gọi `createNotification({ userId: enterpriseUserId, message: ... })` qua `src/services/notifications.js` để Enterprise thấy trên bell.
     - Nếu không có thông tin định danh Enterprise ở phía Collector:
       - Không thể tạo notification trực tiếp từ frontend một cách đúng đắn; khi đó **kỳ vọng backend** tự tạo notification và/hoặc chuyển trạng thái về dạng Enterprise có thể thấy và mở flow assign hiện có.
   - Với Enterprise UI hiện tại:
     - Xác nhận “reassign” đang nằm trong `Enterprise_ReportDetail` (flow assign collector).
     - Nếu sau reject backend đưa status về “Rejected” hoặc “Accepted”:
       - Bảo đảm Enterprise có thể nhìn thấy trạng thái và vào màn detail để assign lại (có thể cần nới điều kiện hiển thị nút assign nếu hiện tại chỉ cho “Accepted”).

5) **Kiểm tra/điều chỉnh điều kiện hiển thị Assign ở Enterprise (nếu cần)**
   - Nếu backend đặt status sau reject là “Rejected” và Enterprise vẫn cần assign:
     - Cập nhật điều kiện `canGoAssign` để cho phép mở phần assign ở trạng thái “Rejected” (hoặc trạng thái backend dùng cho case này), miễn là đúng business rule.
   - Nếu backend đặt status về “Accepted” và/hoặc “Assigned”:
     - Không đổi Enterprise UI nếu đã phù hợp.

6) **Xác minh hoạt động**
   - Chạy app, login Collector:
     - Mở task status “Assigned” → thấy 2 nút Accept + Reject.
     - Bấm Reject → confirm → trạng thái cập nhật (hoặc task biến mất khỏi list) và có toast thành công.
   - Login Enterprise:
     - Kiểm tra bell notifications (nếu backend/FE có tạo).
     - Mở report liên quan → có thể assign collector lại theo flow hiện có.
   - Kiểm tra lint/build (đảm bảo không vi phạm conventions hiện có).

## Giả định & rủi ro
- Backend đã hỗ trợ endpoint reject: `POST /api/collector/collections/{id}/reject` và xử lý nghiệp vụ “enterprise reassign”.
- Frontend hiện không có cách chắc chắn để suy ra `enterpriseUserId` từ dữ liệu Collector; nếu backend không cung cấp, notification cho Enterprise phải do backend xử lý hoặc cần thay đổi API trả thêm thông tin.

