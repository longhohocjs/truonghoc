import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const LopSinhHoatManagement = () => {
  const navigate = useNavigate();
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [khoas, setKhoas] = useState([]);
  const [giangViens, setGiangViens] = useState([]);

  const [formData, setFormData] = useState({
    MaLop: "",
    TenLop: "",
    KhoaID: "",
    NamNhapHoc: new Date().getFullYear(),
    GiangVienID: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Helper để trích xuất mảng dữ liệu an toàn từ response đã qua axios interceptor
      const getArray = (res) => {
        const payload = res?.data || res;
        if (Array.isArray(payload)) return payload;
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        return [];
      };

      const [resLops, resKhoas, resGVs] = await Promise.all([
        axiosClient.post("/admin/lop-sinh-hoat/danh-sach"),
        axiosClient.post("/admin/khoa/list"),
        axiosClient.post("/admin/users/giang-vien/index"),
      ]);

      setLops(getArray(resLops));
      setKhoas(getArray(resKhoas));
      setGiangViens(getArray(resGVs));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải danh sách lớp sinh hoạt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/admin/lop-sinh-hoat/create", formData);
      toast.success("Tạo lớp sinh hoạt thành công");
      setShowModal(false);
      setFormData({
        MaLop: "",
        TenLop: "",
        KhoaID: "",
        NamNhapHoc: new Date().getFullYear(),
        GiangVienID: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo lớp");
    }
  };

  const handleAssignAdvisor = async (lopID, gvID) => {
    try {
      await axiosClient.post("/admin/lop-sinh-hoat/assign-advisor", {
        LopSinhHoatID: lopID,
        GiangVienID: gvID,
      });
      toast.success("Cập nhật cố vấn học tập thành công");
      fetchData();
    } catch (error) {
      toast.error("Không thể gán cố vấn học tập");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Lớp sinh hoạt
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý lớp hành chính và phân công cố vấn học tập
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          + Tạo lớp mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã lớp</th>
                <th className="px-6 py-4">Tên lớp</th>
                <th className="px-6 py-4">Khoa</th>
                <th className="px-6 py-4 text-center">Khóa</th>
                <th className="px-6 py-4">Cố vấn học tập</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : lops.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Chưa có lớp sinh hoạt nào.
                  </td>
                </tr>
              ) : (
                lops.map((lop) => (
                  <tr
                    key={lop.LopSinhHoatID}
                    className="hover:bg-blue-50/30 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600 uppercase">
                      {lop.MaLop}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {lop.TenLop}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {lop.khoa?.TenKhoa || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {lop.NamNhapHoc}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="text-xs border-none bg-transparent focus:ring-0 font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                        value={lop.GiangVienID || ""}
                        onChange={(e) =>
                          handleAssignAdvisor(lop.LopSinhHoatID, e.target.value)
                        }
                      >
                        <option value="">-- Chưa gán --</option>
                        {giangViens.map((gv) => (
                          <option key={gv.GiangVienID} value={gv.GiangVienID}>
                            {gv.HoTen}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          navigate(`/admin/lop-sinh-hoat/${lop.LopSinhHoatID}`)
                        }
                        className="text-blue-600 hover:underline font-bold text-xs uppercase"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Lớp */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Mở Lớp sinh hoạt mới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Mã lớp
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.MaLop}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      MaLop: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tên lớp
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.TenLop}
                  onChange={(e) =>
                    setFormData({ ...formData, TenLop: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Khoa
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.KhoaID}
                    onChange={(e) =>
                      setFormData({ ...formData, KhoaID: e.target.value })
                    }
                  >
                    <option value="">-- Chọn Khoa --</option>
                    {khoas.map((k) => (
                      <option key={k.KhoaID} value={k.KhoaID}>
                        {k.TenKhoa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Năm nhập học
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.NamNhapHoc}
                    onChange={(e) =>
                      setFormData({ ...formData, NamNhapHoc: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Cố vấn học tập (Tùy chọn)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.GiangVienID}
                  onChange={(e) =>
                    setFormData({ ...formData, GiangVienID: e.target.value })
                  }
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {giangViens.map((gv) => (
                    <option key={gv.GiangVienID} value={gv.GiangVienID}>
                      {gv.HoTen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LopSinhHoatManagement;
