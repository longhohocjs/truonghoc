import React, { useState, useEffect } from "react";

const MonHocModal = ({
  isOpen,
  onClose,
  onSave,
  editingMonHoc,
  faculties, // Nhận danh sách khoa từ component cha
  allMonHocs,
}) => {
  const [formData, setFormData] = useState({
    MaMon: "",
    TenMon: "",
    SoTinChi: 3,
    HinhThucHoc: "Trực tiếp",
    TietLyThuyet: 0,
    TietThucHanh: 0,
    KhoaID: "",
    mon_tien_quyet: [],
    mon_song_hanh: [],
  });

  useEffect(() => {
    if (editingMonHoc) {
      setFormData({
        ...editingMonHoc,
        TietLyThuyet: editingMonHoc.TietLyThuyet || 0,
        TietThucHanh: editingMonHoc.TietThucHanh || 0,
        // Chuyển đổi mảng object sang mảng ID để dễ quản lý trong select
        mon_tien_quyet:
          editingMonHoc.mon_tien_quyet?.map((m) => m.MonHocID || m.id) || [],
        mon_song_hanh:
          editingMonHoc.mon_song_hanh?.map((m) => m.MonHocID || m.id) || [],
      });
    } else {
      setFormData({
        MaMon: "",
        TenMon: "",
        SoTinChi: 3,
        HinhThucHoc: "Trực tiếp",
        TietLyThuyet: 0,
        TietThucHanh: 0,
        KhoaID: "",
        mon_tien_quyet: [],
        mon_song_hanh: [],
      });
    }
  }, [editingMonHoc, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Đảm bảo dữ liệu gửi lên đúng kiểu số để tránh lỗi 422
    const submitData = {
      ...formData,
      SoTinChi: Number(formData.SoTinChi),
      TietLyThuyet: Number(formData.TietLyThuyet),
      TietThucHanh: Number(formData.TietThucHanh),
      KhoaID: Number(formData.KhoaID),
    };
    onSave(submitData);
  };

  // Lọc danh sách môn có thể chọn (không bao gồm chính môn đang sửa)
  const selectableMonHocs = allMonHocs.filter(
    (m) => m.MonHocID !== editingMonHoc?.MonHocID,
  );

  const handleMultiSelect = (field, id) => {
    const current = [...formData[field]];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setFormData({ ...formData, [field]: current });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {editingMonHoc ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Mã môn học
              </label>
              <input
                type="text"
                disabled={!editingMonHoc}
                placeholder={!editingMonHoc ? "Hệ thống tự động tạo" : ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 font-bold"
                value={formData.MaMon}
                onChange={(e) =>
                  setFormData({ ...formData, MaMon: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Số tín chỉ
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.SoTinChi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    SoTinChi: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Hình thức học
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.HinhThucHoc}
                onChange={(e) =>
                  setFormData({ ...formData, HinhThucHoc: e.target.value })
                }
              >
                <option value="Trực tiếp">Trực tiếp (Offline)</option>
                <option value="Trực tuyến">Trực tuyến (Online)</option>
                <option value="Hybrid">Hybrid (Kết hợp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Tiết lý thuyết
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.TietLyThuyet}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    TietLyThuyet: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Tiết thực hành
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.TietThucHanh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    TietThucHanh: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Tên môn học
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.TenMon}
              onChange={(e) =>
                setFormData({ ...formData, TenMon: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Khoa quản lý
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.KhoaID}
              onChange={(e) =>
                setFormData({ ...formData, KhoaID: e.target.value })
              }
            >
              <option value="">-- Chọn khoa --</option>
              {faculties.map((f) => (
                <option key={f.KhoaID} value={f.KhoaID}>
                  {f.TenKhoa}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn môn tiên quyết */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Môn tiên quyết (Chọn nhiều)
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50 space-y-2">
              {selectableMonHocs.map((m) => (
                <label
                  key={m.MonHocID}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.mon_tien_quyet.includes(m.MonHocID)}
                    onChange={() =>
                      handleMultiSelect("mon_tien_quyet", m.MonHocID)
                    }
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    ({m.MaMon}) {m.TenMon}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Chọn môn song hành */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Môn song hành (Chọn nhiều)
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto bg-gray-50 space-y-2">
              {selectableMonHocs.map((m) => (
                <label
                  key={m.MonHocID}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    checked={formData.mon_song_hanh.includes(m.MonHocID)}
                    onChange={() =>
                      handleMultiSelect("mon_song_hanh", m.MonHocID)
                    }
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    ({m.MaMon}) {m.TenMon}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {editingMonHoc ? "Cập nhật" : "Lưu môn học"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonHocModal;
