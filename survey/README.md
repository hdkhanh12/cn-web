# Mini Compatibility Quiz

## Mục tiêu

Một mini quiz vui để hai người làm quen, không phải form điều tra hay công cụ thu
thập dữ liệu bí mật. Người tham gia phải biết rõ đây là quiz do người gửi tạo và
đồng ý trước khi trả lời.

## Ranh giới riêng tư

- Không giả mạo Face ID, camera kiểm tra khuôn mặt, đăng nhập hoặc màn hình bảo mật.
- Không yêu cầu mật khẩu tài khoản thật, số điện thoại, địa chỉ, tài khoản mạng xã hội
  hay dữ liệu nhạy cảm.
- Bước camera (nếu bật) là tính năng tự nguyện. Khi người dùng chụp và tick đồng ý,
  ảnh mới được gửi vào thư mục Drive riêng.
  Không dùng ảnh để xác minh danh tính.
- Password chỉ nên là một mã mời riêng cho quiz. Mã này không được giống mật khẩu
  của bất kỳ tài khoản nào.
- "Một lượt truy cập" được khóa bằng `USED_TOKEN_KEY` trong Apps Script. `localStorage`
  chỉ dùng để giữ màn hình đã hoàn thành trên cùng trình duyệt.

## Luồng giao diện

1. Màn chào: giải thích đây là mini quiz vui để làm quen, thời gian khoảng 2–3 phút.
2. Mã mời `121007`.
3. Camera tùy chọn, có checkbox đồng ý riêng trước khi gửi ảnh.
4. Câu hỏi: mỗi màn một câu, tiến trình rõ ràng, có nút quay lại.
5. Gửi câu trả lời tới Google Sheet; ảnh (nếu đồng ý) tới Google Drive riêng.
6. Màn xác nhận và trạng thái đã hoàn thành.

## Bộ câu hỏi

Danh sách 16 câu hỏi đang nằm trong `survey.js`: tên gọi, mood, cuối tuần, kiểu nhắn
tin, điều cần có trong một cuộc hẹn, cách muốn được quan tâm khi mệt, ba câu về cách
nạp năng lượng/gặp đám đông/chia sẻ chuyện vui, một điều nhỏ dễ vui, chủ đề có thể
nói mãi, điều khiến em có thiện cảm, điều để ý ở nơi mới, món quà nhỏ, điều đang mong
chờ và email tùy chọn.

## Tài liệu thao tác

- [RESET-AND-EDIT.md](RESET-AND-EDIT.md): reset lượt test, đổi câu hỏi và deploy.
- [VIETNAMESE-COPY.md](VIETNAMESE-COPY.md): toàn bộ text đang hiển thị để chỉnh wording.

## Hướng thị giác

Dùng các nguyên tắc từ `evondevKit` cho form và choice controls, nhưng chuyển từ
TSX/Tailwind sang HTML/CSS/JS thuần để phù hợp với repo `CN-WEB`:

- flat, sáng, ít card trang trí;
- một câu hỏi chính mỗi màn;
- radio/checkbox dạng card lớn, dễ bấm trên điện thoại;
- kiểm tra ở bề rộng 375px, không cuộn ngang;
- màu nhấn có thể lấy cảm hứng từ ngày sinh 12/10 như một chi tiết chủ đề, không
  dùng ngày sinh để suy luận tính cách hay chấm điểm.
