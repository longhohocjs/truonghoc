import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const ThongBaoManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ TieuDe: "", NoiDung: "" });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/thong-bao");
      setAnnouncements(res.data || []);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/admin/thong-bao/${editingId}`, formData);
        toast.success("Cập nhật thông báo thành công");
      } else {
        await axiosClient.post("/admin/thong-bao", formData);
        toast.success("Đã gửi thông báo mới");
      }
      setShowModal(false);
      setFormData({ TieuDe: "", NoiDung: "" });
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    try {
      await axiosClient.delete(`/admin/thong-bao/${id}`);
      toast.success("Xóa thông báo thành công");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Không thể xóa thông báo");
    }
  };

  const openEditModal = (item) => {
    setEditingId(item.ThongBaoID);
    setFormData({ TieuDe: item.TieuDe, NoiDung: item.NoiDung });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Thông báo</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ TieuDe: "", NoiDung: "" });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center shadow-lg shadow-indigo-200"
        >
          <span className="mr-2">📢</span> Gửi thông báo mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Tiêu đề</th>
              <th className="px-6 py-4">Nội dung</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : announcements.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400">
                  Chưa có thông báo nào
                </td>
              </tr>
            ) : (
              announcements.map((item) => (
                <tr
                  key={item.ThongBaoID}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {item.TieuDe}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {item.NoiDung}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.ThongBaoID)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Cập nhật thông báo" : "Soạn thông báo mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.TieuDe}
                  onChange={(e) =>
                    setFormData({ ...formData, TieuDe: e.target.value })
                  }
                  placeholder="Tiêu đề thông báo..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={formData.NoiDung}
                  onChange={(e) =>
                    setFormData({ ...formData, NoiDung: e.target.value })
                  }
                  placeholder="Nhập nội dung thông báo chi tiết tại đây..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  {editingId ? "Lưu thay đổi" : "Gửi thông báo ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThongBaoManager;
