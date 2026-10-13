# Reset lượt test và cập nhật câu hỏi

Toàn bộ code của survey nằm trong một folder riêng:

```text
CN-WEB/survey/
├── index.html
├── survey.css
├── survey.js
├── README.md
├── VIETNAMESE-COPY.md
├── RESET-AND-EDIT.md
└── apps-script/
    ├── Code.gs
    └── SETUP.md
```

Website nằm trong repo `CN-WEB`. Google Apps Script nằm trong folder để sao chép
và quản lý, nhưng bản chạy thật vẫn là deployment trong tài khoản Google của bạn.

## Reset lượt test

### Bước 1: reset token ở Google Apps Script

1. Mở project Apps Script gắn với Google Sheet.
2. Chọn hàm `resetQuiz`.
3. Bấm `Run`.
4. Cấp quyền nếu Google hỏi.

Hàm này chỉ mở lại lượt làm. Các dòng trong Sheet và ảnh trong Drive vẫn giữ nguyên.

Nếu muốn xóa toàn bộ câu trả lời trong Sheet để test từ đầu, chạy hàm
`clearResponses()`. Hàm này không xóa ảnh trong Drive.

### Bước 2: xóa trạng thái trên trình duyệt

Mở trang survey, mở DevTools → Console và chạy:

```js
localStorage.removeItem("little-vibe-check-completed");
location.reload();
```

Hoặc mở bằng cửa sổ ẩn danh / trình duyệt khác.

### Bước 3: nếu website chưa đổi

- Deploy lại website/Vercel sau khi sửa `index.html`, `survey.css` hoặc `survey.js`.
- Dùng `Ctrl + F5` để tải lại không dùng cache.

### Quy trình nhanh sau mỗi lần deploy

1. Mở Apps Script, chọn hàm `resetQuiz` và bấm `Run`.
2. Trên trình duyệt test, chạy:

```js
localStorage.removeItem("little-vibe-check-completed");
location.reload();
```

Không chạy `clearResponses()` nếu chỉ muốn mở lại lượt làm. Các câu trả lời test
trong Sheet và ảnh trong Drive sẽ được giữ nguyên.

## Khi đổi câu hỏi

### Chỉ đổi câu chữ hoặc lựa chọn

Sửa trong `survey.js`, giữ nguyên:

- tổng số câu;
- thứ tự câu;
- kiểu dữ liệu (`single`, `multi`, `text`, `email`);
- số lượng câu trả lời gửi lên.

Sau đó chỉ cần deploy lại website. Không cần redeploy Apps Script.

### Thêm, bớt hoặc đổi thứ tự câu

Cần làm đủ các bước:

1. Sửa danh sách `questions` trong `survey.js`.
2. Cập nhật `QUESTION_COUNT` trong `apps-script/Code.gs` (bản hiện tại là `16`).
3. Cập nhật hàng tiêu đề trong `setupSheet()`.
4. Chạy lại `setupSheet()` để cập nhật hàng tiêu đề. Nếu muốn bỏ dữ liệu cũ, chạy
   `clearResponses()` trước; ảnh cũ trong Drive vẫn giữ nguyên.
5. Vào **Deploy → Manage deployments → Edit → New version → Deploy** trong Apps Script.
6. Deploy lại website.

Web App URL giữ nguyên, không cần tạo URL mới.

## Cấu hình lưu dữ liệu

URL Web App hiện được đặt trong dòng `APPS_SCRIPT_URL` của `survey.js`.

Nếu endpoint trả về `{"ok":true,"service":"little-vibe-check"}` khi mở bằng trình
duyệt, phần Web App đang hoạt động. Ảnh chỉ được lưu khi người làm quiz chụp và
tick đồng ý.

## Nếu có người khác mở cùng lúc

Nhiều người vẫn có thể mở form trong lúc chưa ai gửi. Khi một lượt gửi thành công,
Apps Script giữ mã submission đầu tiên; các lượt gửi sau bị từ chối và giao diện báo
đã hết hạn. Cách này không khóa nhầm một người chỉ vì họ mở link rồi bỏ dở.

Sau khi sửa `Code.gs` để dùng mã submission/status, phải deploy **New version**.

## Ghi chú an toàn

- `121007` là mã mời, không nên dùng làm mật khẩu tài khoản Google.
- Thư mục Drive nên để quyền **Restricted**.
- Không đưa `service role key` hoặc thông tin đăng nhập Google vào repo.
