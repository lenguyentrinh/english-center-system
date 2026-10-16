import axios from "axios";

type ApiErrorPayload = {
  message?: string;
  origin?: string;
  status?: string | number;
  errors?: Record<string, string>;
};

/** Tên hiển thị (tiếng Việt) của các trường form mà backend có thể báo lỗi. */
const FIELD_LABELS: Record<string, string> = {
  username: "Tên đăng nhập",
  password: "Mật khẩu",
  newPassword: "Mật khẩu mới",
  currentPassword: "Mật khẩu hiện tại",
  email: "Email",
  fullName: "Họ và tên",
  phone: "Số điện thoại",
  status: "Trạng thái",
  code: "Mã",
  otp: "Mã xác nhận",
  name: "Tên",
  color: "Màu",
  title: "Tiêu đề",
  description: "Mô tả",
  startDate: "Ngày bắt đầu",
  endDate: "Ngày kết thúc",
  startTime: "Giờ bắt đầu",
  endTime: "Giờ kết thúc",
  maxStudent: "Sĩ số tối đa",
  sessionNumber: "Số buổi",
  sessionDate: "Ngày học",
  userId: "Người dùng",
  categoryIds: "Chuyên môn",
};

const fieldLabel = (field: string): string => FIELD_LABELS[field] ?? "Thông tin này";

const FIELD_NAMES_IN_MESSAGE: Record<string, string> = {
  Username: "Tên đăng nhập",
  Email: "Email",
  Phone: "Số điện thoại",
  Code: "Mã",
  Name: "Tên",
};

/** Câu lỗi chung theo mã HTTP, dùng khi không có thông báo cụ thể. */
const messageForStatus = (status: number, fallback: string): string => {
  if (status >= 500) return "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút, nếu vẫn lỗi hãy liên hệ trung tâm.";
  switch (status) {
    case 400:
      return "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô đã nhập.";
    case 401:
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu. Có thể dữ liệu đã bị xoá, vui lòng tải lại trang.";
    case 409:
      return "Thao tác này không thực hiện được vì xung đột với dữ liệu hiện có.";
    case 429:
      return "Bạn thao tác quá nhanh. Vui lòng chờ một lát rồi thử lại.";
    default:
      return fallback;
  }
};

/** Bảng dịch các thông báo tiếng Anh từ backend sang tiếng Việt dễ hiểu. Khớp đầu tiên sẽ được dùng. */
const RULES: Array<[RegExp, string | ((m: RegExpMatchArray) => string)]> = [
  // Đăng nhập / tài khoản
  [/^(Invalid username or password|Email or password incorrect)/i, "Tên đăng nhập hoặc mật khẩu không đúng."],
  [/^User account is not active/i, "Tài khoản đang bị khoá hoặc chưa được kích hoạt. Vui lòng liên hệ trung tâm."],
  [/^Email not verified/i, "Email chưa được xác nhận. Vui lòng nhập mã đã gửi về email của bạn."],
  [/^Account has no role assigned|^User has no roles assigned/i, "Tài khoản chưa được cấp quyền sử dụng. Vui lòng liên hệ trung tâm."],
  [/^Invalid or expired refresh token|^Token has expired|^Authentication required/i, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
  [/^Invalid or expired code/i, "Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc yêu cầu gửi mã mới."],
  [/^Current password is incorrect/i, "Mật khẩu hiện tại không đúng."],
  [/^New password must be different/i, "Mật khẩu mới phải khác mật khẩu cũ."],
  [/^Student role not found/i, "Hệ thống chưa sẵn sàng để tạo tài khoản học viên. Vui lòng liên hệ trung tâm."],
  [/^Too many requests/i, "Bạn thao tác quá nhanh. Vui lòng chờ một lát rồi thử lại."],

  // Quyền hạn
  [/^(Access denied|Permission denied)/i, "Bạn không có quyền thực hiện thao tác này."],
  [/^Only the course teacher or an admin/i, "Chỉ giáo viên của lớp hoặc quản trị viên mới xem được danh sách học viên."],
  [/^You cannot .* your own account/i, "Bạn không thể thực hiện thao tác này trên chính tài khoản của mình."],
  [/last active admin/i, "Không thực hiện được vì đây là quản trị viên đang hoạt động cuối cùng của hệ thống."],

  // Trùng dữ liệu
  [/^Category '(.+)' already exists/i, (m) => `Danh mục "${m[1]}" đã tồn tại.`],
  [/^Category is used by a course/i, "Không thể xoá danh mục vì đang có khoá học sử dụng."],
  [/^Entity already exists by/i, "Thông tin này đã tồn tại trong hệ thống."],
  [/^(\w+(?: \w+)*) '(.+)' already exists/i, (m) => `${FIELD_NAMES_IN_MESSAGE[m[1]] ?? m[1]} "${m[2]}" đã được sử dụng.`],
  [/already exists by (\w+)/i, (m) => `${FIELD_NAMES_IN_MESSAGE[m[1][0].toUpperCase() + m[1].slice(1)] ?? "Thông tin"} này đã được sử dụng.`],
  [/^User already has this/i, "Người dùng đã có vai trò này rồi."],

  // Lớp học / đăng ký
  [/^Course is closed for enrollment/i, "Lớp học đã đóng, không nhận thêm học viên."],
  [/^User is not a student/i, "Người này chưa phải là học viên."],
  [/^Student is already enrolled/i, "Học viên đã có trong lớp này rồi."],
  [/^Class is full/i, "Lớp đã đủ số học viên tối đa."],
  [/^Student is not enrolled/i, "Học viên này chưa đăng ký lớp học."],
  [/^Student has a schedule conflict with: (.+)/i, (m) => `Học viên bị trùng lịch học với lớp: ${m[1]}.`],
  [/^Teacher has a schedule conflict with: (.+)/i, (m) => `Giáo viên bị trùng lịch dạy với lớp: ${m[1]}.`],
  [/^Teacher is not specialised/i, "Giáo viên này chưa có chuyên môn phù hợp với loại khoá học."],
  [/^Max students cannot be lower than the (\d+)/i, (m) => `Sĩ số tối đa không được thấp hơn ${m[1]} học viên đã đăng ký.`],
  [/^End date must not be before start date/i, "Ngày kết thúc không được trước ngày bắt đầu."],
  [/^Start date must be in the present or future/i, "Ngày bắt đầu không được nằm trong quá khứ."],
  [/^Choose at least one weekday/i, "Vui lòng chọn ít nhất một ngày học trong tuần."],
  [/^Weekdays must be/i, "Ngày học trong tuần không hợp lệ."],
  [/^Start and end time are both required/i, "Vui lòng nhập cả giờ bắt đầu và giờ kết thúc."],
  [/^End time must be after start time/i, "Giờ kết thúc phải sau giờ bắt đầu."],
  [/^Sessions must fall between 07:00 and 22:00/i, "Giờ học phải nằm trong khoảng từ 07:00 đến 22:00."],
  [/^'to' must not be before 'from'|^Range is limited/i, "Khoảng thời gian chọn không hợp lệ (tối đa 62 ngày, ngày kết thúc phải sau ngày bắt đầu)."],

  // Thông báo chung
  [/inactive/i, "Không thực hiện được vì mục này đang bị vô hiệu hoá."],
  [/not found|was deleted|^Unknown or deleted/i, "Không tìm thấy dữ liệu. Có thể dữ liệu đã bị xoá, vui lòng tải lại trang."],
  [/^(Something went wrong|Database operation failed|Validation failed)/i, "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút."],
];

/** Dịch thông báo của backend sang tiếng Việt; trả về null nếu chưa có bản dịch. */
export const translateApiMessage = (message: string | undefined): string | null => {
  if (!message) return null;
  const text = message.trim();
  for (const [pattern, result] of RULES) {
    const m = text.match(pattern);
    if (m) return typeof result === "function" ? result(m) : result;
  }
  // Đã là tiếng Việt thì giữ nguyên.
  if (/[à-ỹ]/i.test(text)) return text;
  return null;
};

/** Dịch lỗi của một ô nhập (ví dụ "Name must not be blank") thành câu dễ hiểu. */
const translateFieldError = (field: string, message: string): string => {
  const label = fieldLabel(field);
  const text = message.trim();

  const between = text.match(/must be between (\d+) and (\d+) characters/i);
  if (between) return `${label} phải dài từ ${between[1]} đến ${between[2]} ký tự.`;
  const atMost = text.match(/must be at most (\d+) characters/i);
  if (atMost) return `${label} tối đa ${atMost[1]} ký tự.`;
  const atLeast = text.match(/must be at least (\d+)/i);
  if (atLeast) return `${label} phải từ ${atLeast[1]} trở lên.`;

  if (/must not be (blank|null)/i.test(text)) return `Vui lòng nhập ${label.toLowerCase()}.`;
  if (/letter and one number/i.test(text)) return "Mật khẩu phải có ít nhất một chữ cái và một chữ số.";
  if (/must be 6 digits/i.test(text)) return "Mã xác nhận gồm 6 chữ số.";
  if (/hex value/i.test(text)) return "Màu không hợp lệ, vui lòng chọn lại.";
  if (/present or future/i.test(text)) return `${label} không được nằm trong quá khứ.`;
  if (/must be valid|invalid/i.test(text)) return `${label} không hợp lệ.`;

  return translateApiMessage(text) ?? `${label} chưa hợp lệ.`;
};

const formatValidationErrors = (errors: Record<string, string> | undefined): string | null => {
  if (!errors || !Object.keys(errors).length) return null;
  return Object.entries(errors)
    .map(([field, msg]) => translateFieldError(field, msg))
    .join(" ");
};

/**
 * Chuyển mọi lỗi (API, mạng, lỗi lạ) thành một câu tiếng Việt mà người không rành kỹ thuật cũng hiểu.
 * Không bao giờ hiển thị mã lỗi, tên trường kỹ thuật hay chuỗi tiếng Anh thô của hệ thống.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      if (error.code === "ECONNABORTED") return "Máy chủ phản hồi quá chậm. Vui lòng thử lại sau ít phút.";
      return "Không kết nối được tới hệ thống. Vui lòng kiểm tra mạng internet rồi thử lại.";
    }

    const data = error.response.data;
    const fromFields = formatValidationErrors(data?.errors);
    if (fromFields) return fromFields;

    const translated = translateApiMessage(data?.message);
    if (translated) return translated;

    const status = error.response.status;
    // Lỗi 4xx thông thường: dùng câu của màn hình gọi (cụ thể hơn câu chung theo mã lỗi).
    if (status >= 400 && status < 500 && ![401, 403, 429].includes(status)) return fallback;
    return messageForStatus(status, fallback);
  }

  if (typeof error === "string" && error.trim()) return translateApiMessage(error) ?? fallback;

  // Lỗi lập trình (TypeError, ...) không có ý nghĩa với người dùng.
  return fallback;
};
