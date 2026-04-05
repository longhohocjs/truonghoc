import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const DotDangKyManager = () => {
  const [dots, setDots] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDot, setEditingDot] = useState(null);
  const [formData, setFormData] = useState({
    TenDot: "",
    HocKyID: "",
    NgayBatDau: "",
    NgayKetThuc: "",
    TrangThai: 1,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách học kỳ để đổ vào dropdown
      const hkRes = await axiosClient.get("/admin/hoc-ky");
      setHocKys(hkRes.data || hkRes);

      // Lấy danh sách các đợt đăng ký (sử dụng API filter)
      const dotsRes = await axiosClient.post("/admin/dot-dang-ky/filter", {});
      setDots(dotsRes.data || dotsRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDot) {
        await axiosClient.put("/admin/dot-dang-ky/cap-nhat", {
          ...formData,
          DotDangKyID: editingDot.DotDangKyID,
        });
        toast.success("Cập nhật đợt đăng ký thành công");
      } else {
        await axiosClient.post("/admin/dot-dang-ky", formData);
        toast.success("Tạo mới đợt đăng ký thành công");
      }
      setShowModal(false);
      setEditingDot(null);
      setFormData({
        TenDot: "",
        HocKyID: "",
        NgayBatDau: "",
        NgayKetThuc: "",
        TrangThai: 1,
      });
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    }
  };

  const toggleStatus = async (dot) => {
    try {
      const newStatus = dot.TrangThai === 1 ? 0 : 1;
      await axiosClient.put("/admin/dot-dang-ky/doi-trang-thai", {
        DotDangKyID: dot.DotDangKyID,
        TrangThai: newStatus,
      });
      toast.success(
        `${newStatus === 1 ? "Mở" : "Đóng"} đợt đăng ký thành công`,
      );
      fetchInitialData();
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  const openEditModal = (dot) => {
    setEditingDot(dot);
    setFormData({
      TenDot: dot.TenDot,
      HocKyID: dot.HocKyID,
      NgayBatDau: dot.NgayBatDau.split(" ")[0],
      NgayKetThuc: dot.NgayKetThuc.split(" ")[0],
      TrangThai: dot.TrangThai,
    });
    setShowModal(true);
  };

  if (loading)
    return <div className="p-8 text-center">Đang tải dữ liệu cấu hình...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Quản lý Đợt đăng ký học phần
        </h2>
        <button
          onClick={() => {
            setEditingDot(null);
            setFormData({
              TenDot: "",
              HocKyID: "",
              NgayBatDau: "",
              NgayKetThuc: "",
              TrangThai: 1,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center shadow-lg shadow-blue-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo đợt đăng ký mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Tên đợt đăng ký</th>
              <th className="px-6 py-4">Học kỳ</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dots.map((dot) => (
              <tr
                key={dot.DotDangKyID}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {dot.TenDot}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {dot.hoc_ky?.TenHocKy} ({dot.hoc_ky?.nam_hoc?.TenNamHoc})
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-green-600 font-medium">
                      Bắt đầu:{" "}
                      {new Date(dot.NgayBatDau).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="text-red-600 font-medium">
                      Kết thúc:{" "}
                      {new Date(dot.NgayKetThuc).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      dot.TrangThai === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dot.TrangThai === 1 ? "Đang mở" : "Đã đóng"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => toggleStatus(dot)}
                    className={`p-2 rounded-lg transition-colors ${
                      dot.TrangThai === 1
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={dot.TrangThai === 1 ? "Đóng đợt" : "Mở đợt"}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => openEditModal(dot)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingDot ? "Cập nhật đợt đăng ký" : "Tạo đợt đăng ký mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tên đợt đăng ký
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.TenDot}
                  onChange={(e) =>
                    setFormData({ ...formData, TenDot: e.target.value })
                  }
                  placeholder="Ví dụ: Đợt đăng ký chính thức HK1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Học kỳ áp dụng
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.HocKyID}
                  onChange={(e) =>
                    setFormData({ ...formData, HocKyID: e.target.value })
                  }
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {hocKys.map((hk) => (
                    <option key={hk.HocKyID} value={hk.HocKyID}>
                      {hk.TenHocKy} ({hk.nam_hoc?.TenNamHoc})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.NgayBatDau}
                    onChange={(e) =>
                      setFormData({ ...formData, NgayBatDau: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.NgayKetThuc}
                    onChange={(e) =>
                      setFormData({ ...formData, NgayKetThuc: e.target.value })
                    }
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  {editingDot ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DotDangKyManager;
