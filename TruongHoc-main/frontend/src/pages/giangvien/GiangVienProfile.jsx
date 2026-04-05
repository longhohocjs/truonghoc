import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const GiangVienProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Endpoint giả định dựa trên cấu trúc auth
        const response = await axiosClient.get("/giang-vien/profile");

        // Trích xuất dữ liệu linh hoạt (Hỗ trợ nhiều định dạng trả về từ Laravel)
        const isSuccess =
          response?.success === true || response?.status === "success";
        const payload = isSuccess ? response.data : response;

        if (payload && typeof payload === "object") {
          setProfile(payload);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return <div className="p-8 text-center">Đang tải hồ sơ giảng viên...</div>;
  if (!profile)
    return (
      <div className="p-8 text-center text-red-500">
        Không tìm thấy thông tin giảng viên.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-12 mb-6">
            <div className="p-1 bg-white rounded-full shadow-md">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white uppercase">
                {(profile.HoTen || profile.ho_ten || "?").charAt(0)}
              </div>
            </div>
            <div className="ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.HoTen || profile.ho_ten}
              </h2>
              <p className="text-gray-500 font-medium">
                Mã GV: {profile.MaGV || profile.ma_gv}
              </p>
            </div>
            <div className="ml-auto mb-2">
              <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase">
                {profile.HocVi || profile.hoc_vi || "Giảng viên"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Thông tin công tác
              </h4>
              <DetailItem
                label="Khoa"
                value={
                  profile.ten_khoa ||
                  profile.khoa?.TenKhoa ||
                  profile.Khoa?.TenKhoa
                }
              />
              <DetailItem
                label="Trình độ"
                value={profile.HocVi || profile.hoc_vi}
              />
              <DetailItem
                label="Chuyên môn"
                value={profile.ChuyenMon || profile.chuyen_mon}
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Liên hệ cá nhân
              </h4>
              <DetailItem
                label="Email"
                value={profile.Email || profile.email}
              />
              <DetailItem
                label="Số điện thoại"
                value={profile.SoDienThoai || profile.so_dien_thoai}
              />
              <DetailItem
                label="Văn phòng"
                value={profile.VanPhong || profile.van_phong}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-50 py-2">
    <span className="text-gray-500 text-sm">{label}:</span>
    <span className="text-gray-900 font-semibold text-sm">
      {value || "Chưa cập nhật"}
    </span>
  </div>
);

export default GiangVienProfile;
