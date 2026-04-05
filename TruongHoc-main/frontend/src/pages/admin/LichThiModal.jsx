import React, { useState, useEffect } from "react";

const LichThiModal = ({ isOpen, onClose, lopHocPhan, onSave }) => {
  const [lichThi, setLichThi] = useState([]);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (lopHocPhan && isOpen) {
      // Lấy dữ liệu lịch thi hiện có hoặc khởi tạo mảng rỗng
      // Chuẩn hóa key từ backend (nếu là snake_case) sang PascalCase để frontend xử lý và backend nhận lại đúng
      const normalizedLich = (lopHocPhan.lich_thi || []).map((item) => ({
        NgayThi: item.NgayThi || item.ngay_thi || "",
        GioBatDau: item.GioBatDau || item.gio_bat_dau || "07:30",
        GioKetThuc: item.GioKetThuc || item.gio_ket_thuc || "09:00",
        PhongThi: item.PhongThi || item.phong_thi || item.PhongHoc || "",
      }));
      setLichThi(normalizedLich);
    }
    setErrors("");
  }, [lopHocPhan, isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setLichThi([
      ...lichThi,
      { NgayThi: "", GioBatDau: "07:30", GioKetThuc: "09:00", PhongThi: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    setLichThi(lichThi.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...lichThi];
    updated[index][field] = value;
    setLichThi(updated);
  };

  const validateLocal = () => {
    for (let i = 0; i < lichThi.length; i++) {
      for (let j = i + 1; j < lichThi.length; j++) {
        const row1 = lichThi[i];
        const row2 = lichThi[j];

        if (row1.NgayThi && row2.NgayThi && row1.NgayThi === row2.NgayThi) {
          const isOverlapping = !(
            row1.GioKetThuc <= row2.GioBatDau ||
            row2.GioKetThuc <= row1.GioBatDau
          );
          if (
            isOverlapping &&
            row1.PhongThi === row2.PhongThi &&
            row1.PhongThi !== ""
          ) {
            return `Xung đột: Buổi ${i + 1} và buổi ${j + 1} đang trùng phòng ${row1.PhongThi} vào cùng khoảng thời gian.`;
          }
        }
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lichThi.some((item) => !item.NgayThi || !item.PhongThi)) {
      setErrors(
        "Vui lòng nhập đầy đủ ngày thi và phòng thi cho tất cả các buổi.",
      );
      return;
    }

    const errorMsg = validateLocal();
    if (errorMsg) {
      setErrors(errorMsg);
      return;
    }

    // Đảm bảo định dạng giờ gửi lên có giây (:00) để tránh lỗi 422
    const formattedLichThi = lichThi.map((item) => ({
      NgayThi: item.NgayThi,
      PhongThi: item.PhongThi || item.PhongHoc, // Đảm bảo không bị null
      GioBatDau:
        item.GioBatDau?.length === 5 ? `${item.GioBatDau}:00` : item.GioBatDau,
      GioKetThuc:
        item.GioKetThuc?.length === 5
          ? `${item.GioKetThuc}:00`
          : item.GioKetThuc,
    }));

    console.log("Payload Lịch thi:", formattedLichThi);
    onSave(formattedLichThi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Cấu hình Lịch thi
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

        {errors && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {errors}
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {lichThi.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
              Chưa có lịch thi nào được gán. Nhấn "Thêm buổi thi" để bắt đầu.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 px-2">Ngày thi</th>
                  <th className="pb-3 px-2 w-32">Giờ bắt đầu</th>
                  <th className="pb-3 px-2 w-32">Giờ kết thúc</th>
                  <th className="pb-3 px-2">Phòng thi</th>
                  <th className="pb-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lichThi.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-2">
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.NgayThi || ""}
                        onChange={(e) =>
                          handleChange(index, "NgayThi", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.GioBatDau || ""}
                        onChange={(e) =>
                          handleChange(index, "GioBatDau", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.GioKetThuc || ""}
                        onChange={(e) =>
                          handleChange(index, "GioKetThuc", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        placeholder="VD: P.Phòng 402"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.PhongThi || ""}
                        onChange={(e) =>
                          handleChange(index, "PhongThi", e.target.value)
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
            className="mt-4 w-full py-3 border-2 border-dashed border-orange-200 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 hover:border-orange-300 transition-all"
          >
            + Thêm buổi thi
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
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            Cập nhật lịch thi
          </button>
        </div>
      </div>
    </div>
  );
};

export default LichThiModal;
