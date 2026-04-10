import React, { useState, useEffect } from "react";

const LichThiModal = ({ isOpen, onClose, lopHocPhan, onSave }) => {
  const [lichThi, setLichThi] = useState([]);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    // Sử dụng lich_thi_details từ Backend
    if (lopHocPhan && isOpen) {
      // Lấy dữ liệu lịch thi hiện có hoặc khởi tạo mảng rỗng
      // Chuẩn hóa key từ backend (nếu là snake_case) sang PascalCase để frontend xử lý và backend nhận lại đúng
      const normalizedLich = (lopHocPhan.lich_thi || []).map((item) => ({
        NgayThi: item.NgayThi || item.ngay_thi || "",
        GioBatDau: item.GioBatDau || item.gio_bat_dau || "07:30",
        GioKetThuc: item.GioKetThuc || item.gio_ket_thuc || "09:00",
        PhongThi: item.PhongThi || item.phong_thi || "",
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Phân lịch thi
            </h3>
            <p className="text-xs font-bold text-blue-600">
              LỚP: {lopHocPhan?.MaLopHP} | MÔN: {lopHocPhan?.mon_hoc?.TenMon}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all"
          >
            &times;
          </button>
        </div>

        {errors && ( // Hiển thị lỗi cục bộ
          <div className="mx-8 mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
            {errors}
          </div>
        )}

        <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Khung trạng thái đơn giản */}
          <div
            className={`mb-8 p-5 rounded-2xl border-2 border-dashed ${lichThi.length > 0 ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Trạng thái hiện tại
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full animate-pulse ${lichThi.length > 0 ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <h4
                    className={`text-sm font-black uppercase ${lichThi.length > 0 ? "text-green-700" : "text-gray-500"}`}
                  >
                    {lichThi.length > 0
                      ? "Đã được gán lịch thi"
                      : "Đang trống lịch thi"}
                  </h4>
                </div>
              </div>
              {lichThi.length > 0 && (
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-green-100">
                  <span className="text-lg font-black text-green-600">
                    {lichThi.length}
                  </span>
                  <span className="ml-1 text-[10px] font-bold text-gray-400 uppercase">
                    buổi thi
                  </span>
                </div>
              )}
            </div>
          </div>

          {lichThi.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-medium">
                Lớp này chưa có cấu hình lịch thi.
              </p>
              <p className="text-[10px] uppercase mt-1">
                Nhấn nút phía dưới để bắt đầu
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="pb-2 px-2">Ngày thi</th>
                    <th className="pb-2 px-2">Giờ bắt đầu</th>
                    <th className="pb-2 px-2">Giờ kết thúc</th>
                    <th className="pb-2 px-2">Phòng thi</th>
                    <th className="pb-2 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lichThi.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-2 px-1">
                        <input
                          type="date"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.NgayThi || ""}
                          onChange={(e) =>
                            handleChange(index, "NgayThi", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="time"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-center outline-none"
                          value={item.GioBatDau || ""}
                          onChange={(e) =>
                            handleChange(index, "GioBatDau", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="time"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-center outline-none"
                          value={item.GioKetThuc || ""}
                          onChange={(e) =>
                            handleChange(index, "GioKetThuc", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          placeholder="VD: P.Phòng 402"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold placeholder:text-gray-300 outline-none"
                          value={item.PhongThi || ""}
                          onChange={(e) =>
                            handleChange(index, "PhongThi", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1 text-right">
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleAddRow}
            className="mt-6 w-full py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
          >
            + Thêm buổi thi mới
          </button>
        </div>

        <div className="px-8 py-6 border-t border-gray-50 bg-white flex justify-end space-x-4">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default LichThiModal;
