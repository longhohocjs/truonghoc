import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context & Auth
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/auth/Login";

// Layout & Common
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";

// Admin Pages
import UserManagement from "@/pages/admin/UserManagement";
import NamHocHocKy from "@/pages/admin/NamHocHocKy";
import KhoaNganhManagement from "@/pages/admin/KhoaNganhManagement";
import MonHocManagement from "@/pages/admin/MonHocManagement";
import QuanLyLopHocPhan from "@/pages/admin/QuanLyLopHocPhan";
import DotDangKyManager from "@/pages/admin/DotDangKyManager";
import ThongBaoManager from "@/pages/admin/ThongBaoManager";
import ChuongTrinhDaoTaoManager from "@/pages/admin/ChuongTrinhDaoTaoManager";
import LopSinhHoatManagement from "@/pages/admin/LopSinhHoatManagement";
import LopSinhHoatDetail from "@/pages/admin/LopSinhHoatDetail";
import DiemManagement from "@/pages/admin/DiemManagement";
import DiemDetail from "@/pages/admin/DiemDetail";
import ThongKeBaoCao from "@/pages/admin/ThongKeBaoCao";

// Giang Vien Pages
import GiangVienProfile from "@/pages/giangvien/GiangVienProfile";
import LopPhanCong from "@/pages/giangvien/LopPhanCong";
import LichGiangDay from "@/pages/giangvien/LichGiangDay";
import LichCoiThi from "@/pages/giangvien/LichCoiThi";

// Sinh Vien Pages
import Profile from "@/pages/sinhvien/Profile";
import DangKyHocPhan from "@/pages/sinhvien/DangKyHocPhan";
import KetQuaHocTap from "@/pages/sinhvien/KetQuaHocTap";
import LichHoc from "@/pages/sinhvien/LichHoc";
import LichThi from "@/pages/sinhvien/LichThi";

const Unauthorized = () => (
  <div className="p-10 text-center text-red-500 font-bold text-2xl">
    403 - Bạn không có quyền truy cập trang này!
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#333", color: "#fff" },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Tuyến đường công khai */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Tuyến đường yêu cầu Đăng nhập (Dùng chung cho tất cả role) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Nhóm chức năng cho ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/nam-hoc" element={<NamHocHocKy />} />
                <Route
                  path="/admin/khoa-nganh"
                  element={<KhoaNganhManagement />}
                />
                <Route
                  path="/admin/dot-dang-ky"
                  element={<DotDangKyManager />}
                />
                <Route path="/admin/thong-bao" element={<ThongBaoManager />} />
                <Route path="/admin/mon-hoc" element={<MonHocManagement />} />
                <Route
                  path="/admin/chuong-trinh-dao-tao"
                  element={<ChuongTrinhDaoTaoManager />}
                />
                <Route
                  path="/admin/lop-sinh-hoat"
                  element={<LopSinhHoatManagement />}
                />
                <Route
                  path="/admin/lop-sinh-hoat/:id"
                  element={<LopSinhHoatDetail />}
                />
                <Route path="/admin/diem-so" element={<DiemManagement />} />
                <Route path="/admin/diem-so/:id" element={<DiemDetail />} />
                <Route
                  path="/admin/lop-hoc-phan"
                  element={<QuanLyLopHocPhan />}
                />
                <Route path="/admin/thong-ke" element={<ThongKeBaoCao />} />
              </Route>

              {/* Nhóm chức năng cho GIẢNG VIÊN */}
              <Route element={<ProtectedRoute allowedRoles={["giangvien"]} />}>
                <Route
                  path="/giang-vien/profile"
                  element={<GiangVienProfile />}
                />
                <Route
                  path="/giang-vien/lop-phan-cong"
                  element={<LopPhanCong />}
                />
                <Route
                  path="/giang-vien/lich-giang-day"
                  element={<LichGiangDay />}
                />
                <Route
                  path="/giang-vien/lich-coi-thi"
                  element={<LichCoiThi />}
                />
              </Route>

              {/* Nhóm chức năng cho SINH VIÊN */}
              <Route element={<ProtectedRoute allowedRoles={["sinhvien"]} />}>
                <Route path="/sinh-vien/profile" element={<Profile />} />
                <Route path="/sinh-vien/dang-ky" element={<DangKyHocPhan />} />
                <Route path="/sinh-vien/ket-qua" element={<KetQuaHocTap />} />
                <Route path="/sinh-vien/lich-hoc" element={<LichHoc />} />
                <Route path="/sinh-vien/lich-thi" element={<LichThi />} />
              </Route>
            </Route>
          </Route>

          {/* Điều hướng mặc định nếu không khớp route nào */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
