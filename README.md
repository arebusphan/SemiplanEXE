# SemiPlan - Smart Study Planner

SemiPlan là ứng dụng giúp sinh viên tự động lên lịch học. Thay vì phải tự chia thời gian cho từng môn, bạn chỉ cần ném file đề cương (syllabus) vào, hệ thống sẽ dùng AI để đọc, chia nhỏ bài học và tự động xếp lịch dựa trên thời gian rảnh của bạn.

## Tính năng chính

- **Đọc hiểu đề cương**: Upload file PDF/DOCX/TXT, AI sẽ tự động bóc tách các chương học và ước tính thời gian cần để học.
- **Tự động xếp lịch**: Dựa vào khung giờ rảnh và độ khó của môn học để sắp xếp lịch phù hợp, ưu tiên các môn sắp thi.
- **Điều chỉnh linh hoạt**: Lỡ quên hoặc bận không học được một bữa? App sẽ tự động dời lịch và tính toán lại lộ trình để không bị dồn bài.
- **Tóm tắt bài học (AI)**: Tự động sinh ra các note tóm tắt, keyword quan trọng để ôn tập nhanh sau mỗi buổi.
- **Tài khoản Premium**: Tích hợp cổng thanh toán PayOS để người dùng nâng cấp gói tính năng.
- **Dashboard thống kê**: Theo dõi thời gian học, mức độ hoàn thành môn và chuỗi ngày học liên tục (streak).

## Công nghệ sử dụng

**Frontend**:
- ReactJS, TypeScript (Vite)
- TailwindCSS, shadcn/ui

**Backend** (Mô hình N-Tier):
- C# .NET Web API
- PostgreSQL & Entity Framework Core
- Background Services (chạy ngầm để nhắc lịch học)
- Tích hợp OpenAI API và PayOS

## Cấu trúc source code

- `/SemiplanReact`: Code giao diện web (Frontend).
- `/SemiplanAPI`: Chứa API controllers và file cấu hình (appsettings).
- `/SemiplanService`: Nơi chứa toàn bộ logic xử lý (đăng nhập, tự động xếp lịch, gọi OpenAI, xử lý thanh toán...).
- `/SemiplanRepository`: Xử lý giao tiếp với database.
- `/SemiplanData`: Chứa models (entities), DbContext và các file migrations.

## Cách chạy project ở máy cá nhân

### 1. Khởi động Backend (.NET)
- Đảm bảo máy đã cài .NET SDK và PostgreSQL.
- Mở file `SemiplanAPI/appsettings.json`, điền chuỗi kết nối Database, OpenAI API Key và Key PayOS của bạn vào.
- Chạy API:
  ```bash
  cd SemiplanAPI
  dotnet run
  ```

### 2. Khởi động Frontend (React)
- Mở một terminal mới:
  ```bash
  cd SemiplanReact
  npm install
  npm run dev
  ```
- Xong! Vào web qua link mà terminal hiện ra (thường là `http://localhost:5173`).
