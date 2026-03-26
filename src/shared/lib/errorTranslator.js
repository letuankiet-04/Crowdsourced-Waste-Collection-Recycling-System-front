export function translateErrorMessage(message) {
  if (!message) return "";

  const lowerMsg = message.toLowerCase();

  const dict = {
    // Collector Report Creation
    "thiếu requestid": "Missing request ID",
    "user hiện tại không phải collector": "Current user is not a Collector",
    "report đã được tạo cho collection request này": "Report already created for this request",
    "collection request không tồn tại": "Collection request not found",
    "chỉ có thể tạo report khi task đang ở trạng thái collected": "Report can only be created when task is in COLLECTED status",
    "collection request thiếu toạ độ ban đầu": "Collection request is missing initial coordinates",
    "cần ít nhất 1 ảnh": "At least 1 image is required",
    "phải chọn ít nhất 1 danh mục": "At least 1 category must be selected",
    "dữ liệu khối lượng không hợp lệ": "Invalid quantity data",
    "thiếu toạ độ trong báo cáo": "Missing coordinates in report",
    "vị trí báo cáo thu gom cách vị trí rác quá 30m": "Collection report location is more than 30m away from the waste location",
    "không thể xác nhận hoàn tất task": "Cannot confirm task completion",

    // Collector Service
    "task này không thuộc về bạn": "This task does not belong to you",
    "không tìm thấy task": "Task not found",
    "không tìm thấy báo cáo cho task này": "Report for this task not found",
    "bắt buộc phải có lý do từ chối": "Rejection reason is required",
    "không tìm thấy yêu cầu thu gom": "Collection request not found",
    "yêu cầu này không thuộc về bạn": "This request does not belong to you",
    "lỗi không xác định khi từ chối nhiệm vụ": "Unknown error when rejecting task",

    // Others (common)
    "request không hợp lệ": "Invalid request",
    "file không hợp lệ": "Invalid file",
  };

  // Exact match
  if (dict[lowerMsg]) {
    return dict[lowerMsg];
  }

  // Partial match for dynamic strings
  if (lowerMsg.includes("trạng thái không hợp lệ. mong đợi")) {
    return "Invalid status. Status does not match expected state.";
  }
  if (lowerMsg.includes("category id") && lowerMsg.includes("không tồn tại")) {
    return message.replace("không tồn tại", "not found");
  }

  return message;
}
