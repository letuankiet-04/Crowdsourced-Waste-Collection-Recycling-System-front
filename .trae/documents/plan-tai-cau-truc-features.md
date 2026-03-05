# Kế hoạch: Cấu trúc lại `src/features/` cho gọn & dễ tìm code

## Mục tiêu
- Chuẩn hoá cấu trúc trong `src/features/*` theo 1 convention thống nhất.
- Tách rõ “route-level pages” và “feature-internal components/layouts”.
- Giảm tình trạng file UI (navbar/sidebar/layout) nằm lẫn trong `pages/` hoặc ở cùng cấp với pages.
- Không đổi behavior (route paths, guard, API calls), chỉ đổi tổ chức thư mục + cập nhật import.

## Hiện trạng (tóm tắt)
- `src/features/` đang chia theo role: `admin`, `citizen`, `collector`, `enterprise`, `auth`, `home`.
- Một số feature để “component con” trong các thư mục `*_comp/` ngay dưới `pages/` (vd `dashboard_comp/`, `rewards_comp/`), hoặc để navbar/sidebar/layout cùng cấp với page.
- Routing dùng lazy import tập trung tại `src/app/routes/lazyPages.jsx` trỏ thẳng vào `features/<role>/pages/<Page>.jsx`.

## Convention đề xuất (mục tiêu sau khi refactor)
Mỗi feature có cấu trúc tối thiểu:
- `pages/`: chỉ chứa các page được mount vào router (route-level/screen-level).
- `components/`: UI component dùng nội bộ trong feature (có thể chia theo domain: `navigation/`, `dashboard/`, `reports/`…).
- `layouts/`: layout wrapper của feature/role (nếu có).
- (tuỳ chọn) `index.js`: barrel exports nội bộ (chỉ thêm nếu codebase đang dùng pattern này, nếu không thì bỏ).

Ví dụ:
```
src/features/citizen/
  pages/
    Citizen_Dashboard.jsx
    Citizen_Reports.jsx
    ...
  components/
    dashboard/
    rewards/
    reports/
    feedback/
    navigation/
  layouts/ (nếu có)
```

## Mapping thay đổi dự kiến theo feature
### 1) `citizen`
- Di chuyển các thư mục `pages/dashboard_comp/`, `pages/rewards_comp/`, `pages/create_report/` sang `components/` theo nhóm:
  - `pages/dashboard_comp/*` -> `components/dashboard/*`
  - `pages/rewards_comp/*` -> `components/rewards/*`
  - `pages/create_report/*` -> `components/reports/*` (hoặc `components/create-report/*`, chọn 1 convention và áp dụng nhất quán)
- Di chuyển các file navigation/layout đang nằm trong `pages/`:
  - `pages/CD_Navbar.jsx`, `pages/Sidebar.jsx`, `pages/CitizenNavItems.jsx` -> `components/navigation/*`
- Giữ nguyên các page route-level trong `pages/` (vd `Citizen_Dashboard.jsx`, `Citizen_Profile.jsx`, …).

### 2) `admin`
- `pages/dashboard_comp/*` -> `components/dashboard/*` hoặc tách:
  - `AdminNavbar.jsx` -> `components/navigation/AdminNavbar.jsx`
  - `Admin_Sidebar.jsx` -> `components/navigation/AdminSidebar.jsx`
  - Các card/section trong dashboard -> `components/dashboard/*`
- Các page route-level giữ trong `pages/` (vd `Admin_Dashboard.jsx`, `Admin_UserManagement.jsx`, …).

### 3) `collector`
- `pages/layout/CollectorLayout.jsx` -> `layouts/CollectorLayout.jsx`
- `pages/navbar/CollectorNavbar.jsx` -> `components/navigation/CollectorNavbar.jsx`
- Các page route-level giữ trong `pages/`.

### 4) `enterprise`
- `pages/layout/EnterpriseLayout.jsx` -> `layouts/EnterpriseLayout.jsx`
- `pages/navbar/EnterpriseNavbar.jsx` -> `components/navigation/EnterpriseNavbar.jsx`
- Các page route-level giữ trong `pages/`.

### 5) `auth`, `home`
- Hiện đã khá gọn: `pages/` + `components/` rõ ràng.
- Chỉ chỉnh nếu phát hiện import vòng/đặt sai loại (thường không cần).

## Các bước thực hiện (khi được duyệt)
1. Chốt convention tên thư mục và nhóm component (đặc biệt `create_report` sẽ map sang nhóm nào).
2. Lập danh sách “đường dẫn cũ -> đường dẫn mới” cho từng feature (file-level) để di chuyển an toàn.
3. Di chuyển thư mục/file theo mapping:
   - Tạo `components/*`, `layouts/*` cho từng feature khi cần.
   - Thực hiện di chuyển theo từng feature (xong feature nào cập nhật import feature đó).
4. Cập nhật import paths:
   - Trong nội bộ feature (page import component).
   - Trong routing lazy import tại `src/app/routes/lazyPages.jsx` (nếu page bị đổi đường dẫn).
   - Các import từ `src/app/routes/AppRoutes.jsx` nếu có import trực tiếp (thường là lazy pages).
5. Chạy kiểm tra build/lint/test theo setup hiện có của repo và mở UI để click qua các route chính:
   - Auth: login/signup
   - Citizen/Collector/Enterprise/Admin: dashboard + 1-2 page detail
   - Dev routes (nếu còn dùng)
6. Dọn dẹp:
   - Xoá folder rỗng/không còn dùng trong `features/**/pages/*_comp`, `pages/navbar`, `pages/layout`.
   - Grep tìm import cũ còn sót để đảm bảo không còn tham chiếu.

## Tiêu chí hoàn thành
- Không còn `*_comp` nằm trong `pages/` (đã chuyển sang `components/`).
- Layout/navbar/sidebar không còn nằm trong `pages/` (đã chuyển sang `layouts/` hoặc `components/navigation/`).
- `npm run dev` chạy được, điều hướng các route chính không lỗi màn hình trắng/console error.
- Không còn import path trỏ vào các đường dẫn cũ.

## Phạm vi & lưu ý
- Chỉ refactor cấu trúc thư mục + import; không đổi logic nghiệp vụ, API, UI behavior.
- Nếu có alias import (vd `@/features/...`) đang được dùng, sẽ giữ nguyên hoặc nâng cấp sau; đợt này ưu tiên “di chuyển an toàn”.
