import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    notifications: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Giả sử bạn có endpoint lấy thống kê tổng quan
        // const response = await axiosClient.get("/admin/dashboard-stats");
        // if (response.success) setStats(response.data);

        // Dữ liệu mẫu để hiển thị giao diện
        setTimeout(() => {
          setStats({
            totalStudents: 1250,
            totalClasses: 45,
            notifications: 12,
            recentActivity: [
              {
                id: 1,
                text: "Sinh viên Nguyễn Văn A vừa đăng ký học phần LHP001",
                time: "5 phút trước",
              },
              {
                id: 2,
                text: "Giảng viên Trần Thị B đã cập nhật điểm lớp LHP002",
                time: "1 giờ trước",
              },
              {
                id: 3,
                text: "Hệ thống vừa mở đợt đăng ký học phần mới",
                time: "3 giờ trước",
              },
            ],
          });
          setLoading(false);

          // Nếu là sinh viên, lấy thêm lịch thi để hiển thị widget
          if (user?.role === "sinhvien") {
            axiosClient
              .get("/sinh-vien/lich-thi")
              .then((res) => {
                const data = res.success
                  ? res.data
                  : Array.isArray(res)
                    ? res
                    : res.data || [];
                // Chỉ lấy tối đa 2 lịch thi gần nhất để hiển thị nhanh trên Dashboard
                setUpcomingExams(data.slice(0, 2));
              })
              .catch((err) =>
                console.error("Lỗi lấy lịch thi dashboard:", err),
              );
          }
        }, 500);
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Tổng số Sinh viên",
      value: stats.totalStudents,
      icon: (
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "bg-blue-100",
    },
    {
      title: "Lớp học phần",
      value: stats.totalClasses,
      icon: (
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4"
          />
        </svg>
      ),
      color: "bg-green-100",
    },
    {
      title: "Thông báo mới",
      value: stats.notifications,
      icon: (
        <svg
          className="w-8 h-8 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      color: "bg-orange-100",
    },
  ];

  if (loading) return <div className="p-8">Đang tải dữ liệu tổng quan...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h2>
        <p className="text-gray-500">
          Chào mừng bạn trở lại hệ thống quản lý đào tạo.
        </p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-105"
          >
            <div className={`p-4 rounded-xl ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Khu vực thông báo mới nhất */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Hoạt động gần đây
            </h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget Lịch thi sắp tới - Chỉ hiển thị cho Sinh viên */}
        {user?.role === "sinhvien" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className="bg-orange-500 w-2 h-6 rounded mr-3"></span>
                Lịch thi sắp tới
              </h3>
              <Link
                to="/sinh-vien/lich-thi"
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map((exam, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-14 bg-white rounded-lg flex flex-col items-center justify-center border border-orange-200 shadow-sm leading-tight">
                      <span className="text-[10px] font-bold text-orange-400 uppercase">
                        Ngày
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {exam.ngay_thi?.split("-")[2] ||
                          exam.NgayThi?.split("/")[0]}
                      </span>
                    </div>
                    <div className="ml-4 flex-1 overflow-hidden">
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        {exam.ten_mon || exam.lop_hoc_phan?.mon_hoc?.TenMon}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 italic">
                        🕒 {exam.gio_bat_dau || exam.GioBatDau} | 📍{" "}
                        {exam.phong_thi || exam.PhongHoc}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic py-4">
                  Hiện tại bạn không có lịch thi nào sắp tới.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Thẻ thông tin nhanh */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Hỗ trợ hệ thống</h3>
            <p className="text-indigo-100 mb-6">
              Bạn gặp khó khăn trong quá trình sử dụng? Hãy liên hệ với phòng
              CNTT để được trợ giúp sớm nhất.
            </p>
            <button className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
          {/* Decor background */}
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-40px] left-[-20px] w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
