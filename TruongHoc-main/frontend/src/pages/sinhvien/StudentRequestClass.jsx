import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import { Send, History, AlertCircle } from "lucide-react";

const StudentRequestClass = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ monHocID: "", lyDo: "" });
  const [loading, setLoading] = useState(false);

  // Helper bóc tách mảng an toàn
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      const [resMon, resReq] = await Promise.all([
        axiosClient.get("/sinh-vien/chuong-trinh"),
        axiosClient.get("/sinh-vien/yeu-cau-mo-lop"),
      ]);
      setMonHocs(resMon.data?.chuong_trinh || []);
      setRequests(getArray(resReq));
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monHocID || !formData.lyDo)
      return toast.error("Vui lòng nhập đầy đủ thông tin");

    setLoading(true);
    try {
      await axiosClient.post("/sinh-vien/yeu-cau-mo-lop", formData);
      toast.success("Gửi yêu cầu thành công!");
      setFormData({ monHocID: "", lyDo: "" });
      // Refresh list
      const res = await axiosClient.get("/sinh-vien/yeu-cau-mo-lop");
      setRequests(getArray(res));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Send className="text-indigo-600" size={20} /> Xin mở lớp học phần
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Môn học cần mở
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.monHocID}
              onChange={(e) =>
                setFormData({ ...formData, monHocID: e.target.value })
              }
            >
              <option value="">-- Chọn môn học --</option>
              {monHocs.map((m) => (
                <option key={m.MonHocID} value={m.MonHocID}>
                  {m.mon_hoc?.TenMon}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Lý do/Nguyện vọng
            </label>
            <textarea
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              placeholder="Ví dụ: Em muốn học cải thiện để kịp xét tốt nghiệp..."
              value={formData.lyDo}
              onChange={(e) =>
                setFormData({ ...formData, lyDo: e.target.value })
              }
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:bg-gray-300"
          >
            {loading ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-700">
          <History size={18} /> Lịch sử yêu cầu
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
            <tr>
              <th className="px-6 py-3">Môn học</th>
              <th className="px-6 py-3">Ngày gửi</th>
              <th className="px-6 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((req) => (
              <tr key={req.YeuCauID}>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">
                  {req.mon_hoc?.TenMon}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(req.created_at).toLocaleDateString()}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentRequestClass;
