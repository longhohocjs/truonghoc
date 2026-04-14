import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import { Check, X, Trash2, Clock, Inbox, Filter } from "lucide-react";

const AdminManageClassRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Helper bóc tách mảng an toàn từ response API (Đồng bộ với style của project)
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/yeu-cau-mo-lop");
      setRequests(getArray(res));
    } catch (error) {
      toast.error("Không thể tải danh sách yêu cầu mở lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/admin/yeu-cau-mo-lop/${id}/status`, { status });
      toast.success(
        status === 1 ? "Đã phê duyệt yêu cầu" : "Đã từ chối yêu cầu",
      );
      fetchRequests();
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) return;
    try {
      await axiosClient.delete(`/admin/yeu-cau-mo-lop/${id}`);
      toast.success("Đã xóa yêu cầu");
      fetchRequests();
    } catch (error) {
      toast.error("Lỗi khi xóa yêu cầu");
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "all") return true;
    return req.TrangThai === parseInt(filterStatus);
  });

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải danh sách yêu cầu...
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý yêu cầu mở lớp
          </h2>
          <p className="text-gray-500 text-sm">
            Xem và xử lý nguyện vọng mở lớp học phần từ sinh viên
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select
            className="text-sm font-bold text-gray-700 outline-none bg-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="0">Đang chờ xử lý</option>
            <option value="1">Đã phê duyệt</option>
            <option value="2">Đã từ chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Sinh viên</th>
              <th className="px-6 py-4">Môn học</th>
              <th className="px-6 py-4">Lý do / Nguyện vọng</th>
              <th className="px-6 py-4">Ngày gửi</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center text-gray-300">
                    <Inbox size={48} className="mb-2 opacity-20" />
                    <p className="italic text-sm">
                      Không có yêu cầu nào phù hợp
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.YeuCauID}
                  className="hover:bg-indigo-50/10 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {req.sinh_vien?.HoTen?.charAt(0) || "S"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          {req.sinh_vien?.HoTen}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {req.sinh_vien?.MaSV}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-indigo-600">
                      {req.mon_hoc?.TenMon}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {req.mon_hoc?.MaMon}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p
                      className="text-xs text-gray-600 line-clamp-2"
                      title={req.LyDo}
                    >
                      {req.LyDo}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(req.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                        req.TrangThai === 1
                          ? "bg-green-100 text-green-600"
                          : req.TrangThai === 2
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {req.TrangThai === 1
                        ? "Đã duyệt"
                        : req.TrangThai === 2
                          ? "Từ chối"
                          : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {req.TrangThai === 0 && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.YeuCauID, 1)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            title="Phê duyệt"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.YeuCauID, 2)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            title="Từ chối"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(req.YeuCauID)}
                        className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        title="Xóa yêu cầu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageClassRequests;
