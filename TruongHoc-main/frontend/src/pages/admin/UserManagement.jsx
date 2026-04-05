import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import UserModal from "./UserModal";
import AssignAccountModal from "./AssignAccountModal";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("sinhvien");
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffForAccount, setStaffForAccount] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "sinhvien"
          ? "/admin/users/sinh-vien/index"
          : activeTab === "giangvien"
            ? "/admin/users/giang-vien/index"
            : "/admin/users/admin-list/index";

      const response = await axiosClient.post(endpoint);

      // Trích xuất dữ liệu cực kỳ linh hoạt
      let dataArray = [];

      // Trích xuất dữ liệu cực kỳ linh hoạt (Hỗ trợ Laravel Pagination & Resource)
      const isSuccess =
        response?.success === true || response?.status === "success";
      const payload = isSuccess ? response.data : response;

      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
      }

      setUsers(dataArray);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      // Mock dữ liệu để demo giao diện nếu API chưa sẵn sàng
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axiosClient.post("/admin/khoa/list");
      setFaculties(res.data || res || []);
    } catch (error) {
      console.error("Lỗi tải khoa:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFaculties();
  }, [activeTab]);

  // Lọc danh sách dựa trên từ khóa tìm kiếm
  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    if (!u) return false;
    const nameMatch = String(u.ho_ten || u.HoTen || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const codeMatch = String(u.ma_sv || u.ma_gv || u.MaSV || u.MaGV || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || codeMatch;
  });

  const handleAdd = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedUser(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (isEditing) {
        const endpoint =
          activeTab === "sinhvien"
            ? "/admin/users/sinh-vien"
            : "/admin/users/staff";
        const roleID =
          activeTab === "sinhvien" ? 3 : activeTab === "giangvien" ? 2 : 1;

        await axiosClient.patch(endpoint, {
          ...formData,
          SinhVienID: selectedUser?.SinhVienID || formData?.SinhVienID,
          StaffID:
            selectedUser?.GiangVienID ||
            selectedUser?.AdminID ||
            selectedUser?.StaffID ||
            formData?.GiangVienID,
          RoleID: roleID,
        });
        toast.success("Cập nhật thành công");
      } else {
        const endpoint =
          activeTab === "sinhvien"
            ? "/admin/users/sinh-vien"
            : "/admin/users/staff-profile";

        const roleID =
          activeTab === "sinhvien" ? 3 : activeTab === "giangvien" ? 2 : 1;

        await axiosClient.post(endpoint, { ...formData, RoleID: roleID });
        toast.success("Thêm mới thành công");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Xóa tài khoản ${item.HoTen || item.ho_ten}? Thao tác này sẽ xóa cả hồ sơ và tài khoản.`,
      )
    )
      return;

    try {
      const userId = item.UserID || item.user?.UserID;

      if (userId) {
        // Trường hợp 1: Đã có tài khoản -> Xóa đồng bộ cả 2 bảng
        await axiosClient.delete(`/admin/users/${userId}`);
      } else {
        // Trường hợp 2: Chưa có tài khoản -> Chỉ xóa hồ sơ
        const staffId = item.GiangVienID || item.AdminID;
        const roleId =
          activeTab === "sinhvien" ? 3 : activeTab === "giangvien" ? 2 : 1;

        if (!staffId) {
          toast.error("Không tìm thấy ID hồ sơ để xóa");
          return;
        }
        await axiosClient.delete(`/admin/users/profile/${staffId}/${roleId}`);
      }

      toast.success("Đã xóa dữ liệu thành công");
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi xóa người dùng");
    }
  };

  const handleAssignAccountClick = (item) => {
    setStaffForAccount(item);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async (username, password) => {
    try {
      await axiosClient.post("/admin/users/assign-account", {
        StaffID: staffForAccount.GiangVienID || staffForAccount.AdminID,
        RoleID: activeTab === "giangvien" ? 2 : 1,
        username: username,
        password: password,
      });

      toast.success("Cấp tài khoản thành công!");
      setIsAssignModalOpen(false);
      fetchData(); // Tải lại danh sách để cập nhật trạng thái UserID
    } catch (error) {
      // Lỗi 422 (trùng username) đã được axios interceptor hiển thị qua toast
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await axiosClient.post("/admin/users/toggle-status", {
        UserID: userId,
      });
      toast.success(
        res.is_active ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      );
      fetchData();
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái:", error);
    }
  };

  const handleResetPassword = async (userId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn đặt lại mật khẩu về '123456' cho tài khoản này?",
      )
    )
      return;
    try {
      await axiosClient.post("/admin/users/reset-password", { UserID: userId });
      toast.success("Mật khẩu đã được đặt lại về 123456");
    } catch (error) {
      console.error("Lỗi khi reset mật khẩu:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Người dùng
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý thông tin tài khoản Sinh viên và Giảng viên trong hệ thống
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          + Thêm{" "}
          {activeTab === "sinhvien"
            ? "Sinh viên"
            : activeTab === "giangvien"
              ? "Giảng viên"
              : "Admin"}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-8 py-3 font-bold text-sm transition-all ${activeTab === "sinhvien" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => {
            setActiveTab("sinhvien");
            setSearchTerm("");
          }}
        >
          DANH SÁCH SINH VIÊN
        </button>
        <button
          className={`px-8 py-3 font-bold text-sm transition-all ${activeTab === "giangvien" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => {
            setActiveTab("giangvien");
            setSearchTerm("");
          }}
        >
          DANH SÁCH GIẢNG VIÊN
        </button>
        <button
          className={`px-8 py-3 font-bold text-sm transition-all ${activeTab === "admin" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => {
            setActiveTab("admin");
            setSearchTerm("");
          }}
        >
          DANH SÁCH ADMIN
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={`Tìm kiếm theo tên hoặc mã ${activeTab === "sinhvien" ? "SV" : activeTab === "giangvien" ? "GV" : "Admin"}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="text-sm text-gray-500">
          Tổng cộng:{" "}
          <span className="font-bold text-gray-800">
            {filteredUsers.length}
          </span>{" "}
          nhân sự
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">
                  Mã{" "}
                  {activeTab === "sinhvien"
                    ? "SV"
                    : activeTab === "giangvien"
                      ? "GV"
                      : "Định danh"}
                </th>
                <th className="px-6 py-4">Họ tên</th>
                {activeTab === "sinhvien" ? (
                  <>
                    <th className="px-6 py-4">Lớp sinh hoạt</th>
                    <th className="px-6 py-4">Khóa học</th>
                  </>
                ) : activeTab === "admin" ? (
                  <>
                    <th className="px-6 py-4">Quyền hạn</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Khoa</th>
                    <th className="px-6 py-4">Trình độ</th>
                  </>
                )}
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Không tìm thấy dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item, index) => (
                  <tr
                    key={
                      item.SinhVienID ||
                      item.GiangVienID ||
                      item.UserID ||
                      `user-${index}`
                    }
                    className="hover:bg-blue-50/30 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {activeTab === "sinhvien"
                        ? item.MaSV || item.ma_sv
                        : item.MaGV ||
                          item.ma_gv ||
                          item.user?.Username ||
                          "ADMIN"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.HoTen || item.ho_ten}
                    </td>
                    {activeTab === "sinhvien" ? (
                      <>
                        <td className="px-6 py-4 text-indigo-600 font-medium">
                          {item.ten_lop_sinh_hoat || "Chưa xếp lớp"}
                        </td>
                        <td className="px-6 py-4">
                          {item.ten_nganh || item.khoahoc || item.KhoaHoc}
                        </td>
                      </>
                    ) : activeTab === "admin" ? (
                      <>
                        <td className="px-6 py-4 font-medium text-orange-600">
                          Administrator
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {item.khoa?.TenKhoa || item.ten_khoa || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                            {item.hoc_vi || "Giảng viên"}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-gray-500 lowercase">
                      {item.Email || item.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab !== "sinhvien" && !item.UserID && (
                        <button
                          onClick={() => handleAssignAccountClick(item)}
                          className="text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                          title="Cấp tài khoản đăng nhập"
                        >
                          Cấp TK
                        </button>
                      )}
                      {(item.UserID || item.user?.UserID) && (
                        <>
                          <button
                            onClick={() =>
                              handleResetPassword(
                                item.UserID || item.user?.UserID,
                              )
                            }
                            className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                            title="Reset mật khẩu về 123456"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                item.UserID || item.user?.UserID,
                              )
                            }
                            className={`${
                              (item.user?.is_active ?? item.is_active ?? true)
                                ? "text-orange-600 hover:bg-orange-100"
                                : "text-green-600 hover:bg-green-100"
                            } px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all`}
                          >
                            {(item.user?.is_active ?? item.is_active ?? true)
                              ? "Khóa"
                              : "Mở khóa"}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingUser={selectedUser}
        type={activeTab}
        faculties={faculties}
      />

      <AssignAccountModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleConfirmAssign}
        userData={staffForAccount}
      />
    </div>
  );
};

export default UserManagement;
