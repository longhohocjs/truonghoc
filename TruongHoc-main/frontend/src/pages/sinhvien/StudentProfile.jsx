import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ email: "", sodienthoai: "" });

  // Log để xác nhận component này có đang thực sự render không
  console.log("StudentProfile Rendered - isEditing:", isEditing);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/sinh-vien/profile");

      // Laravel Controller trả về wrapper { success: true, data: { ... } }
      // Ta cần lấy đúng phần tử 'data' chứa thông tin sinh viên
      const payload = res.data || res;
      const studentData = payload.data || payload;

      if (studentData) {
        setProfile(studentData);
        setEditData({
          email: studentData.email || "",
          sodienthoai:
            studentData.so_dien_thoai || studentData.sodienthoai || "",
        });
      }
    } catch (error) {
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleEditing = () => {
    console.log("Toggle Editing: ", !isEditing);
    setIsEditing(!isEditing);
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put("/sinh-vien/profile/contact", editData);
      toast.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Đang tải hồ sơ...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-12 mb-6">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-3xl font-black text-blue-600 border-4 border-white uppercase">
                {profile?.ho_ten?.charAt(0) || "S"}
              </div>
            </div>
            <div className="ml-6 mb-2 flex-1 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.ho_ten}
                </h2>
                <p className="text-gray-500 font-medium">
                  MSSV: {profile?.ma_sv}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thông tin học tập */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
                Học tập
              </h3>
              <InfoRow
                label="Lớp sinh hoạt"
                value={profile?.lop_sinh_hoat?.ten_lop}
              />
              <InfoRow label="Ngành" value={profile?.nganh?.ten_nganh} />
              <InfoRow label="Khoa" value={profile?.nganh?.khoa} />
              <InfoRow
                label="Tình trạng"
                value={
                  profile?.tinh_trang === "DangHoc"
                    ? "Đang học"
                    : profile?.tinh_trang
                }
              />
            </div>

            {/* Thông tin liên lạc */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2 relative z-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Liên lạc
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEditing();
                  }}
                  className="text-blue-600 text-xs font-bold hover:underline transition-all cursor-pointer p-1"
                >
                  {isEditing ? "Hủy bỏ" : "Chỉnh sửa"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateContact} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={editData.sodienthoai}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          sodienthoai: e.target.value,
                        })
                      }
                      placeholder="0123xxxxxx"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <InfoRow label="Ngày sinh" value={profile?.ngay_sinh} />
                  <InfoRow label="Giới tính" value={profile?.gioi_tinh} />
                  <InfoRow
                    label="Dân tộc/Tôn giáo"
                    value={`${profile?.dan_toc} / ${profile?.ton_giao}`}
                  />
                  <InfoRow label="Email" value={profile?.email} />
                  <InfoRow
                    label="Số điện thoại"
                    value={profile?.so_dien_thoai}
                  />
                  <InfoRow label="Quê quán" value={profile?.que_quan} />
                  <InfoRow label="Địa chỉ" value={profile?.dia_chi} />
                </>
              )}
            </div>

            {/* Cố vấn học tập */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2 flex items-center">
                <span className="mr-2">👨‍🏫</span> Cố vấn học tập
              </h3>
              {profile?.co_van_hoc_tap ? (
                <>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mb-2">
                    <p className="text-sm font-bold text-indigo-900">
                      {profile.co_van_hoc_tap.ho_ten}
                    </p>
                    <p className="text-[10px] text-indigo-500 font-medium uppercase">
                      {profile.co_van_hoc_tap.hoc_vi || "Giảng viên"}
                    </p>
                  </div>
                  <InfoRow label="Email" value={profile.co_van_hoc_tap.email} />
                  <InfoRow
                    label="Số điện thoại"
                    value={profile.co_van_hoc_tap.so_dien_thoai}
                  />
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Chưa phân công cố vấn
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-400 text-xs">{label}:</span>
    <span className="text-gray-800 font-semibold text-sm">
      {value || "N/A"}
    </span>
  </div>
);

export default StudentProfile;
