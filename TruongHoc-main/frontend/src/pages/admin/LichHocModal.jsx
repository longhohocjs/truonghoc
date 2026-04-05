import React, { useState, useEffect } from "react";

const LichHocModal = ({ isOpen, onClose, lopHocPhan, onSave }) => {
  const [lichHoc, setLichHoc] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lopHocPhan && isOpen) {
      // Đảm bảo dữ liệu lịch học là mảng từ dữ liệu lớp được chọn
      // Chuẩn hóa dữ liệu từ Backend để đảm bảo có key NgayHoc
      const normalizedLich = (lopHocPhan.lich_hoc || []).map((item) => ({
        NgayHoc: item.NgayHoc || item.ngay_hoc || item.Thu || 2,
        TietBatDau: item.TietBatDau || item.tiet_bat_dau || 1,
        SoTiet: item.SoTiet || item.so_tiet || 3,
        PhongHoc: item.PhongHoc || item.phong_hoc || "",
      }));
      setLichHoc(normalizedLich);
    }
    setError("");
  }, [lopHocPhan, isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setLichHoc([
      ...lichHoc,
      { NgayHoc: 2, TietBatDau: 1, SoTiet: 3, PhongHoc: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    setLichHoc(lichHoc.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...lichHoc];
    // Chuyển đổi sang số cho các trường định lượng
    if (field === "PhongHoc") updated[index][field] = value;
    else if (field === "NgayHoc") updated[index][field] = parseInt(value);
    else updated[index][field] = parseInt(value) || 0;

    setLichHoc(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của tiết học
    const isInvalid = lichHoc.some(
      (item) => item.TietBatDau + item.SoTiet - 1 > 12,
    );
    if (isInvalid) {
      setError(
        "Lỗi: Tổng tiết bắt đầu và số tiết không được vượt quá tiết 12.",
      );
      return;
    }

    if (lichHoc.some((item) => !item.PhongHoc)) {
      setError("Vui lòng nhập đầy đủ phòng học cho các buổi.");
      return;
    }

    const formattedLichHoc = lichHoc.map((item) => ({
      NgayHoc: Number(item.NgayHoc),
      TietBatDau: Number(item.TietBatDau),
      SoTiet: Number(item.SoTiet),
      PhongHoc: item.PhongHoc,
      BuoiHoc: Number(item.TietBatDau) <= 6 ? "Sáng" : "Chiều",
    }));

    console.log("Payload Lịch học:", formattedLichHoc);
    onSave(formattedLichHoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Cấu hình Lịch học
            </h3>
            <p className="text-sm text-gray-500">
              {lopHocPhan?.MaLopHP} - {lopHocPhan?.mon_hoc?.TenMon}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {lichHoc.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              Chưa có lịch học nào được gán. Nhấn "Thêm buổi học" để bắt đầu.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 px-2 w-32">Thứ</th>
                  <th className="pb-3 px-2 w-24">Tiết BĐ</th>
                  <th className="pb-3 px-2 w-24">Số tiết</th>
                  <th className="pb-3 px-2">Phòng học</th>
                  <th className="pb-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lichHoc.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-2">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.NgayHoc}
                        onChange={(e) =>
                          handleChange(index, "NgayHoc", e.target.value)
                        }
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map((d) => (
                          <option key={d} value={d}>
                            {d === 8 ? "Chủ Nhật" : `Thứ ${d}`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.TietBatDau}
                        onChange={(e) =>
                          handleChange(index, "TietBatDau", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.SoTiet}
                        onChange={(e) =>
                          handleChange(index, "SoTiet", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        placeholder="VD: A1-102"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.PhongHoc || ""}
                        onChange={(e) =>
                          handleChange(index, "PhongHoc", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            onClick={handleAddRow}
            className="mt-4 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            + Thêm buổi học
          </button>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Cập nhật lịch học
          </button>
        </div>
      </div>
    </div>
  );
};

export default LichHocModal;
