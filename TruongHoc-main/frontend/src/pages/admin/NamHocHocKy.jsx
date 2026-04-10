import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const NamHocHocKy = () => {
  const [hocKys, setHocKys] = useState([]);
  const [namHocs, setNamHocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddYear, setShowAddYear] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    id: null,
    type: "", // 'year' hoặc 'semester'
  });

  const [newYear, setNewYear] = useState({
    TenNamHoc: "",
    NgayBatDau: "",
    NgayKetThuc: "",
  });
  const [newSemester, setNewSemester] = useState({
    TenHocKy: "",
    NamHocID: "",
    LoaiHocKy: "",
    NgayBatDau: "",
    NgayKetThuc: "",
  });

  const fetchHocKys = async () => {
    setLoading(true);
    try {
      const [resHk, resNh] = await Promise.all([
        axiosClient.get("/admin/hoc-ky"),
        axiosClient.get("/admin/nam-hoc"),
      ]);
      setHocKys(resHk.data || []);
      setNamHocs(resNh.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHocKys();
  }, []);

  const handleAddYear = async (e) => {
    e.preventDefault();
    try {
      console.log("Dữ liệu gửi đi (Năm học):", newYear);
      const apiCall = editingYear
        ? axiosClient.put(`/admin/nam-hoc/${editingYear.NamHocID}`, newYear)
        : axiosClient.post("/admin/nam-hoc", newYear);
      await apiCall;
      toast.success(
        editingYear ? "Cập nhật năm học thành công" : "Thêm năm học thành công",
      );
      setShowAddYear(false);
      // Reset editingYear và newYear sau khi thành công
      setEditingYear(null);
      setNewYear({ TenNamHoc: "", NgayBatDau: "", NgayKetThuc: "" });
      fetchHocKys();
    } catch (error) {
      // Bắt lỗi và hiển thị thông báo chi tiết từ backend
      toast.error(error.response?.data?.message || "Lỗi khi xử lý năm học");
    }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    try {
      console.log("Dữ liệu gửi đi (Học kỳ):", newSemester);
      const apiCall = editingSemester
        ? axiosClient.put(
            `/admin/hoc-ky/${editingSemester.HocKyID}`,
            newSemester,
          )
        : axiosClient.post("/admin/hoc-ky", newSemester);
      await apiCall;
      toast.success(
        editingSemester
          ? "Cập nhật học kỳ thành công"
          : "Thêm học kỳ thành công",
      );
      setShowAddSemester(false);
      setEditingSemester(null);
      setNewSemester({
        TenHocKy: "",
        NamHocID: "",
        LoaiHocKy: "",
        NgayBatDau: "",
        NgayKetThuc: "",
      });
      fetchHocKys();
    } catch (error) {
      // Bắt lỗi và hiển thị thông báo chi tiết từ backend
      toast.error(error.response?.data?.message || "Lỗi khi xử lý học kỳ");
    }
  };

  const handleDeleteYear = async (id) => {
    try {
      await axiosClient.delete(`/admin/nam-hoc/${id}`);
      toast.success("Xóa năm học thành công");
      fetchHocKys();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa năm học");
    }
  };

  const handleDeleteSemester = async (id) => {
    try {
      await axiosClient.delete(`/admin/hoc-ky/${id}`);
      toast.success("Xóa học kỳ thành công");
      fetchHocKys();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa học kỳ");
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    // Xử lý cả định dạng "YYYY-MM-DD HH:mm:ss" và "YYYY-MM-DDTHH:mm:ss..."
    return dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr.split(" ")[0];
  };

  const handleEditYear = (year) => {
    setEditingYear(year);
    setNewYear({
      TenNamHoc: year.TenNamHoc || year.ten_nam_hoc,
      NgayBatDau: formatDateForInput(year.NgayBatDau || year.ngay_bat_dau),
      NgayKetThuc: formatDateForInput(year.NgayKetThuc || year.ngay_ket_thuc),
    });
    setShowAddYear(true);
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setNewSemester({
      TenHocKy: semester.TenHocKy || semester.ten_hoc_ky,
      NamHocID: semester.NamHocID || semester.nam_hoc_id,
      LoaiHocKy: semester.LoaiHocKy || semester.loai_hoc_ky,
      NgayBatDau: formatDateForInput(
        semester.NgayBatDau || semester.ngay_bat_dau,
      ),
      NgayKetThuc: formatDateForInput(
        semester.NgayKetThuc || semester.ngay_ket_thuc,
      ),
    });
    setShowAddSemester(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Năm học & Học kỳ</h2>
        <div className="space-x-2">
          <button
            onClick={() => {
              setEditingYear(null);
              setShowAddYear(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Thêm Năm học
          </button>
          <button
            onClick={() => {
              setEditingSemester(null);
              setShowAddSemester(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Thêm Học kỳ
          </button>
        </div>
      </div>

      {/* Modal Thêm Năm Học */}
      {showAddYear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleAddYear}
            className="bg-white p-6 rounded-2xl w-96 space-y-4"
          >
            <h3 className="font-bold">
              {editingYear ? "Cập nhật Năm học" : "Thêm Năm học mới"}
            </h3>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Tên năm học
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 2023-2024"
                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={newYear.TenNamHoc}
                onChange={(e) =>
                  setNewYear({ ...newYear, TenNamHoc: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={newYear.NgayBatDau}
                  onChange={(e) =>
                    setNewYear({ ...newYear, NgayBatDau: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={newYear.NgayKetThuc}
                  onChange={(e) =>
                    setNewYear({ ...newYear, NgayKetThuc: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddYear(false)}>
                Hủy
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                {editingYear ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Thêm Học Kỳ */}
      {showAddSemester && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleAddSemester}
            className="bg-white p-6 rounded-2xl w-96 space-y-4"
          >
            <h3 className="font-bold">
              {editingSemester ? "Cập nhật Học kỳ" : "Thêm Học kỳ mới"}
            </h3>
            <select
              className="w-full border p-2 rounded-lg"
              value={newSemester.NamHocID}
              onChange={(e) =>
                setNewSemester({ ...newSemester, NamHocID: e.target.value })
              }
              required
            >
              <option value="">Chọn năm học...</option>
              {namHocs.map((y) => (
                <option key={y.NamHocID} value={y.NamHocID}>
                  {y.TenNamHoc}
                </option>
              ))}
            </select>
            <select
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={newSemester.LoaiHocKy}
              onChange={(e) =>
                setNewSemester({ ...newSemester, LoaiHocKy: e.target.value })
              }
              required
            >
              <option value="">-- Chọn loại học kỳ --</option>
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
              <option value="He">Học kỳ Hè</option>
            </select>
            <input
              type="text"
              placeholder="Tên học kỳ (Ví dụ: Học kỳ 1)"
              className="w-full border p-2 rounded-lg"
              value={newSemester.TenHocKy}
              onChange={(e) =>
                setNewSemester({ ...newSemester, TenHocKy: e.target.value })
              }
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="border p-2 rounded-lg"
                value={newSemester.NgayBatDau}
                onChange={(e) =>
                  setNewSemester({ ...newSemester, NgayBatDau: e.target.value })
                }
                required
              />
              <input
                type="date"
                className="border p-2 rounded-lg"
                value={newSemester.NgayKetThuc}
                onChange={(e) =>
                  setNewSemester({
                    ...newSemester,
                    NgayKetThuc: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddSemester(false)}>
                Hủy
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                {editingSemester ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hiển thị danh sách Năm học hiện có (Đáp ứng yêu cầu "có trên giao diện") */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <h3 className="text-xs font-bold text-blue-600 uppercase mb-3 tracking-widest">
          Năm học hệ thống
        </h3>
        <div className="flex flex-wrap gap-2">
          {namHocs.map((y) => (
            <div
              key={y.NamHocID}
              className="bg-white px-4 py-2 rounded-2xl text-sm font-bold text-blue-800 shadow-sm border border-blue-200 flex flex-col group relative min-w-[150px]"
            >
              <span className="text-lg font-black">📅 {y.TenNamHoc}</span>
              <span className="text-[10px] text-blue-400 font-medium uppercase">
                {formatDateForInput(y.NgayBatDau || y.ngay_bat_dau)} ➜{" "}
                {formatDateForInput(y.NgayKetThuc || y.ngay_ket_thuc)}
              </span>
              <div className="absolute right-0 top-0 -mr-2 -mt-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditYear(y)}
                  className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-blue-200"
                  title="Sửa năm học"
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    setConfirmConfig({
                      isOpen: true,
                      id: y.NamHocID,
                      type: "year",
                    })
                  }
                  className="bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-200"
                  title="Xóa năm học"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Năm học</th>
              <th className="px-6 py-4">Học kỳ</th>
              <th className="px-6 py-4">Bắt đầu</th>
              <th className="px-6 py-4">Kết thúc</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hocKys.map((hk) => (
              <tr key={hk.HocKyID}>
                <td className="px-6 py-4 font-bold">{hk.nam_hoc?.TenNamHoc}</td>
                <td className="px-6 py-4 text-blue-600 font-medium">
                  {hk.TenHocKy}
                </td>
                <td className="px-6 py-4">
                  {formatDateForInput(
                    hk.NgayBatDau ||
                      hk.ngay_bat_dau ||
                      hk.nam_hoc?.NgayBatDau ||
                      hk.nam_hoc?.ngay_bat_dau,
                  )}
                </td>
                <td className="px-6 py-4">
                  {formatDateForInput(
                    hk.NgayKetThuc ||
                      hk.ngay_ket_thuc ||
                      hk.nam_hoc?.NgayKetThuc ||
                      hk.nam_hoc?.ngay_ket_thuc,
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditSemester(hk)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() =>
                        setConfirmConfig({
                          isOpen: true,
                          id: hk.HocKyID,
                          type: "semester",
                        })
                      }
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null, type: "" })}
        onConfirm={() =>
          confirmConfig.type === "year"
            ? handleDeleteYear(confirmConfig.id)
            : handleDeleteSemester(confirmConfig.id)
        }
        title={confirmConfig.type === "year" ? "Xóa năm học" : "Xóa học kỳ"}
        message={
          confirmConfig.type === "year"
            ? "Bạn có chắc chắn muốn xóa năm học này? Tất cả học kỳ thuộc năm học này phải được xóa trước."
            : "Bạn có chắc chắn muốn xóa học kỳ này? Hệ thống sẽ kiểm tra các dữ liệu liên quan trước khi xóa."
        }
      />
    </div>
  );
};

export default NamHocHocKy;
