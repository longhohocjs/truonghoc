import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Định nghĩa Menu dựa trên vai trò (Role)
  const menuItems = {
    admin: [
      { title: "Quản lý Người dùng", path: "/admin/users" },
      { title: "Năm học & Học kỳ", path: "/admin/nam-hoc" },
      { title: "Môn học", path: "/admin/mon-hoc" },
      { title: "Quản lý Lớp học phần", path: "/admin/lop-hoc-phan" },
      { title: "Thống kê", path: "/admin/thong-ke" },
    ],
    giangvien: [
      { title: "Hồ sơ cá nhân", path: "/giang-vien/profile" },
      { title: "Lớp phân công", path: "/giang-vien/lop-phan-cong" },
      { title: "Lịch giảng dạy", path: "/giang-vien/lich-giang-day" },
      { title: "Lịch coi thi", path: "/giang-vien/lich-coi-thi" },
    ],
    sinhvien: [
      { title: "Hồ sơ sinh viên", path: "/sinh-vien/profile" },
      { title: "Chương trình đào tạo", path: "/sinh-vien/chuong-trinh" },
      { title: "Môn đã hoàn thành", path: "/sinh-vien/mon-da-dat" },
      { title: "Đăng ký học phần", path: "/sinh-vien/dang-ky" },
      { title: "Kết quả học tập", path: "/sinh-vien/ket-qua" },
      { title: "Lịch học", path: "/sinh-vien/lich-hoc" },
      { title: "Lịch thi", path: "/sinh-vien/lich-thi" },
    ],
  };

  const currentMenu = menuItems[user?.role] || [];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-gray-800 text-blue-400">
        EDU-PORTAL
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-6 mb-4 text-xs text-gray-500 uppercase font-semibold">
          VAI TRÒ: {user?.role?.toUpperCase()}
        </div>
        <ul>
          {currentMenu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-6 py-3 hover:bg-gray-800 transition-all ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white border-l-4 border-blue-300"
                    : "text-gray-400"
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="px-2 mb-3 text-sm font-medium text-gray-300">
          {user?.ho_ten}
        </div>
        <button
          onClick={logout}
          className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 py-2 rounded transition-all text-sm font-bold"
        >
          ĐĂNG XUẤT
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
