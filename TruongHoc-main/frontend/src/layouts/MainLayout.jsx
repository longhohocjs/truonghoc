import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Định nghĩa danh sách menu theo vai trò
  const menuItems = {
    admin: [
      { path: "/dashboard", label: "Tổng quan", icon: "📊" },
      { path: "/admin/users", label: "Quản lý Người dùng", icon: "👥" },
      { path: "/admin/thong-bao", label: "Thông báo", icon: "📢" },
      { path: "/admin/nam-hoc", label: "Năm học & Học kỳ", icon: "📅" },
      { path: "/admin/khoa-nganh", label: "Khoa & Ngành", icon: "🏛️" },
      { path: "/admin/dot-dang-ky", label: "Quản lý Đợt đăng ký", icon: "🕒" },
      { path: "/admin/mon-hoc", label: "Môn học", icon: "📚" },
      {
        path: "/admin/chuong-trinh-dao-tao",
        label: "Chương trình đào tạo",
        icon: "📜",
      },
      { path: "/admin/lop-hoc-phan", label: "Lớp học phần", icon: "🏫" },
      { path: "/admin/lich-hoc", label: "Phân lịch học", icon: "🗓️" }, // Thêm mục phân lịch học
      { path: "/admin/lop-sinh-hoat", label: "Lớp sinh hoạt", icon: "👥" },
      { path: "/admin/diem-so", label: "Quản lý Điểm", icon: "📝" },
      { path: "/admin/thong-ke", label: "Thống kê báo cáo", icon: "📈" },
    ],
    giangvien: [
      { path: "/dashboard", label: "Tổng quan", icon: "📊" },
      { path: "/giang-vien/profile", label: "Hồ sơ cá nhân", icon: "👤" },
      { path: "/giang-vien/lop-phan-cong", label: "Lớp giảng dạy", icon: "📝" },
      {
        path: "/giang-vien/lich-giang-day",
        label: "Lịch giảng dạy",
        icon: "🗓️",
      },
      { path: "/giang-vien/lich-coi-thi", label: "Lịch coi thi", icon: "✍️" },
    ],
    sinhvien: [
      { path: "/dashboard", label: "Tổng quan", icon: "📊" },
      { path: "/sinh-vien/profile", label: "Thông tin cá nhân", icon: "👤" },
      {
        path: "/sinh-vien/chuong-trinh",
        label: "Chương trình đào tạo",
        icon: "📚",
      },
      {
        path: "/sinh-vien/mon-da-dat",
        label: "Môn đã hoàn thành",
        icon: "✅",
      },
      {
        path: "/sinh-vien/mon-con-thieu",
        label: "Môn còn thiếu",
        icon: "🚩",
      },
      { path: "/sinh-vien/dang-ky", label: "Đăng ký học phần", icon: "📝" },
      { path: "/sinh-vien/ket-qua", label: "Kết quả học tập", icon: "🎓" },
      { path: "/sinh-vien/lich-hoc", label: "Lịch học", icon: "🗓️" },
      { path: "/sinh-vien/lich-thi", label: "Lịch thi", icon: "✍️" },
    ],
  };

  // Lấy danh sách menu dựa trên role của user (lowercase để tránh sai lệch)
  const currentRole = user?.role?.toLowerCase() || "";
  const currentMenu = menuItems[currentRole] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-xl transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          {isSidebarOpen && (
            <span className="text-xl font-black text-blue-600 tracking-tighter">
              EDU-PORTAL
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {isSidebarOpen && (
                <span className="font-bold text-sm uppercase tracking-wide">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {user?.name || "Người dùng"}
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-black">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <span className="mr-2">🚪</span>
            {isSidebarOpen && (
              <span className="text-xs font-bold uppercase">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="text-gray-800 font-medium">
              {currentMenu.find(
                (m) =>
                  location.pathname === m.path ||
                  location.pathname.startsWith(m.path + "/"),
              )?.label || "Bảng điều khiển"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              🔔
            </button>
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 italic">
                Học kỳ: Học kỳ 2 - 2023-2024
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
