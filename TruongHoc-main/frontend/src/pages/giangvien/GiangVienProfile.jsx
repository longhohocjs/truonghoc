import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const GiangVienProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ email: "", sodienthoai: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

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
          setEditData({
            email: payload.email || payload.Email || "",
            sodienthoai: payload.sodienthoai || payload.SoDienThoai || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Gọi API cập nhật đã chuẩn hóa key ở Backend
      const res = await axiosClient.put("/giang-vien/profile/update", editData);
      toast.success("Cập nhật thông tin liên lạc thành công");
      setIsEditing(false);

      // Cập nhật lại state hiển thị từ dữ liệu mới nhất
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.post(
        "/giang-vien/profile/change-password",
        passwordData,
      );
      toast.success("Đổi mật khẩu thành công");
      setIsChangingPassword(false);
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

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

            <div className="space-y-6">
              {/* Phần thông tin liên lạc có tích hợp chỉnh sửa */}
              <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Liên hệ cá nhân
                  </h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-indigo-600 text-xs font-bold hover:underline"
                  >
                    {isEditing ? "Hủy bỏ" : "Chỉnh sửa"}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateContact} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editData.sodienthoai}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sodienthoai: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
                    >
                      {saving ? "Đang lưu..." : "LƯU THÔNG TIN"}
                    </button>
                  </form>
                ) : (
                  <>
                    <DetailItem
                      label="Email"
                      value={profile.email || profile.Email}
                    />
                    <DetailItem
                      label="Số điện thoại"
                      value={
                        profile.sodienthoai ||
                        profile.so_dien_thoai ||
                        profile.SoDienThoai
                      }
                    />
                    <DetailItem
                      label="Văn phòng"
                      value={profile.VanPhong || profile.van_phong}
                    />
                  </>
                )}
              </div>

              {/* Phần Đổi mật khẩu */}
              <div className="space-y-4 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                    Bảo mật tài khoản
                  </h4>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-indigo-600 text-xs font-bold hover:underline"
                  >
                    {isChangingPassword ? "Hủy bỏ" : "Đổi mật khẩu"}
                  </button>
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">
                        Mật khẩu cũ
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 text-sm border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={passwordData.old_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            old_password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 text-sm border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 text-sm border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password_confirmation: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
                    >
                      {saving ? "Đang xử lý..." : "XÁC NHẬN ĐỔI MẬT KHẨU"}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center py-2">
                    <span className="text-xl mr-3">🔐</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Mật khẩu hệ thống
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Cập nhật mật khẩu để bảo vệ tài khoản
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
