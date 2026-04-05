import React, { useState, useEffect } from "react";

const LopHocPhanModal = ({
  isOpen,
  onClose,
  onSave,
  editingLop,
  dropdownData,
}) => {
  const [formData, setFormData] = useState({
    MaLopHP: "",
    MonHocID: "",
    GiangVienID: "",
    HocKyID: "",
    SoLuongToiDa: 50,
    NgayBatDau: "",
    NgayKetThuc: "",
  });

  useEffect(() => {
    if (editingLop) {
      setFormData({
        LopHocPhanID: editingLop.LopHocPhanID,
        MaLopHP: editingLop.MaLopHP || "",
        MonHocID: editingLop.MonHocID || "",
        GiangVienID: editingLop.GiangVienID || "",
        HocKyID: editingLop.HocKyID || "",
        SoLuongToiDa: editingLop.SoLuongToiDa || 50,
        NgayBatDau: editingLop.NgayBatDau
          ? editingLop.NgayBatDau.split(" ")[0]
          : "",
        NgayKetThuc: editingLop.NgayKetThuc
          ? editingLop.NgayKetThuc.split(" ")[0]
          : "",
      });
    } else {
      setFormData({
        MaLopHP: "",
        MonHocID: "",
        GiangVienID: "",
        HocKyID: dropdownData.hocKys[0]?.HocKyID || "",
        SoLuongToiDa: 50,
        NgayBatDau: "",
        NgayKetThuc: "",
      });
    }
  }, [editingLop, isOpen, dropdownData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.NgayBatDau ||
      !formData.NgayKetThuc ||
      !formData.MonHocID ||
      !formData.HocKyID
    ) {
      alert(
        "Vui lòng nhập đầy đủ các thông tin bắt buộc (Môn học, Học kỳ, Ngày bắt đầu/kết thúc).",
      );
      return;
    }

    // Ép kiểu dữ liệu sang Number cho các trường ID và số lượng để tránh lỗi 422
    const submitData = {
      ...formData,
      MonHocID: Number(formData.MonHocID) || null,
      GiangVienID: formData.GiangVienID ? Number(formData.GiangVienID) : null,
      HocKyID: Number(formData.HocKyID),
      SoLuongToiDa: Number(formData.SoLuongToiDa),
    };
    console.log("Dữ liệu mở lớp gửi lên:", submitData);
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {editingLop ? "Chỉnh sửa Lớp học phần" : "Mở Lớp học phần mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Mã Lớp học phần
            </label>
            <input
              type="text"
              required
              placeholder="VD: LHP001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.MaLopHP}
              onChange={(e) =>
                setFormData({ ...formData, MaLopHP: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Môn học học
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.MonHocID}
              onChange={(e) =>
                setFormData({ ...formData, MonHocID: e.target.value })
              }
            >
              <option value="">-- Chọn môn học --</option>
              {(dropdownData.monHocs || []).map((m) => (
                <option key={m.MonHocID} value={m.MonHocID}>
                  {m.TenMon} ({m.MaMon})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Giảng viên phụ trách
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.GiangVienID}
              onChange={(e) =>
                setFormData({ ...formData, GiangVienID: e.target.value })
              }
            >
              <option value="">-- Chọn giảng viên --</option>
              {(dropdownData.giangViens || []).map((g) => (
                <option key={g.GiangVienID} value={g.GiangVienID}>
                  {g.HoTen}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Học kỳ
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.HocKyID}
                onChange={(e) =>
                  setFormData({ ...formData, HocKyID: e.target.value })
                }
              >
                <option value="">-- Chọn học kỳ --</option>
                {(dropdownData.hocKys || []).map((hk) => (
                  <option key={hk.HocKyID} value={hk.HocKyID}>
                    {hk.TenHocKy} - {hk.nam_hoc?.TenNamHoc || "Năm học ẩn"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Sĩ số tối đa
              </label>
              <input
                type="number"
                min="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.SoLuongToiDa}
                onChange={(e) =>
                  setFormData({ ...formData, SoLuongToiDa: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.NgayBatDau}
                onChange={(e) =>
                  setFormData({ ...formData, NgayBatDau: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.NgayKetThuc}
                onChange={(e) =>
                  setFormData({ ...formData, NgayKetThuc: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {editingLop ? "Lưu thay đổi" : "Mở lớp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LopHocPhanModal;
