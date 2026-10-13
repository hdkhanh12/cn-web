# Lưu quiz bằng Google Sheet và Google Drive

## 1. Tạo nơi lưu

1. Tạo một Google Sheet mới.
2. Tạo một thư mục Google Drive riêng, đặt quyền **Restricted**.
3. Lấy ID của Sheet và folder từ URL.

## 2. Tạo Web App

1. Trong Google Sheet, mở **Extensions → Apps Script**.
2. Dán nội dung `Code.gs`.
3. Điền `SHEET_ID` và `DRIVE_FOLDER_ID`.
4. Chạy hàm `setupSheet()` một lần và cấp quyền. Nếu Sheet đã có từ bản cũ,
   chạy lại hàm này để cập nhật hàng tiêu đề lên 16 câu; dữ liệu cũ không bị xóa.
5. Chọn **Deploy → New deployment → Web app**.
6. Chọn **Execute as: Me** và quyền truy cập **Anyone with the link**.
7. Sao chép URL Web App, dán vào `APPS_SCRIPT_URL` trong `survey.js`.

Hiện survey gửi 16 câu trả lời. Ảnh chỉ được lưu khi người làm quiz chụp và tick
đồng ý. Sheet chỉ lưu ID file, không lưu ảnh dạng base64.

Nếu số lượng hoặc thứ tự câu hỏi thay đổi, cập nhật `QUESTION_COUNT` và các cột trong
`Code.gs`, sau đó tạo **New version** cho deployment.

## 3. Reset lượt làm

Trong Apps Script, chạy hàm `resetQuiz()`. Hàm này chỉ mở lại token cho lượt mới,
không xoá câu trả lời cũ hay ảnh cũ.

Nếu muốn xóa các dòng câu trả lời cũ trong Sheet để test lại từ đầu, chạy
`clearResponses()`. Hàm này không xóa ảnh trong Drive.

## 4. Kiểm tra

- Mở route `/survey/` bằng HTTPS hoặc `localhost`.
- Dùng mã `121007`.
- Gửi thử một lượt.
- Kiểm tra một dòng mới trong sheet và file mới trong Drive.
