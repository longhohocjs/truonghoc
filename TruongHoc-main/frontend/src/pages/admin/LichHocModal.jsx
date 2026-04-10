import React, { useState, useEffect } from "react";

const LichHocModal = ({ isOpen, onClose, lopHocPhan, onSave }) => {
  const [lichHoc, setLichHoc] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lopHocPhan && isOpen) {
      // Đảm bảo dữ liệu lịch học là mảng từ dữ liệu lớp được chọn
      // Lấy duy nhất theo Thứ (Thu) để tránh hiển thị lặp lại các tuần trong Modal
      const rawLichHoc = Array.isArray(lopHocPhan.lich_hoc_details)
        ? lopHocPhan.lich_hoc_details
        : [];
      const uniqueLich = Array.from(
        new Map(
          rawLichHoc
            .filter((item) => item !== null)
            .map((item) => [
              item.Thu ||
                item.thu ||
                (item.NgayHoc ? new Date(item.NgayHoc).getDay() + 1 : 2),
              item,
            ]),
        ).values(),
      );

      const normalizedLich = uniqueLich.map((item) => ({
        NgayHoc: parseInt(item.Thu || item.thu || 2) || 2,
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Phân lịch giảng dạy
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

        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Khung trạng thái đơn giản */}
          <div
            className={`mb-8 p-5 rounded-2xl border-2 border-dashed ${lichHoc.length > 0 ? "bg-green-50/50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Trạng thái hiện tại
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full animate-pulse ${lichHoc.length > 0 ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <h4
                    className={`text-sm font-black uppercase ${lichHoc.length > 0 ? "text-green-700" : "text-gray-500"}`}
                  >
                    {lichHoc.length > 0
                      ? "Đã được gán lịch học"
                      : "Đang trống lịch"}
                  </h4>
                </div>
              </div>
              {lichHoc.length > 0 && (
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-green-100">
                  <span className="text-lg font-black text-green-600">
                    {lichHoc.length}
                  </span>
                  <span className="ml-1 text-[10px] font-bold text-gray-400 uppercase">
                    buổi / tuần
                  </span>
                </div>
              )}
            </div>
          </div>

          {lichHoc.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm font-medium">
                Lớp này chưa có cấu hình lịch giảng dạy.
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
                    <th className="pb-2 px-2">Thứ</th>
                    <th className="pb-2 px-2">Tiết BD</th>
                    <th className="pb-2 px-2">Số tiết</th>
                    <th className="pb-3 px-2">Phòng học</th>
                    <th className="pb-3 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lichHoc.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-2 px-1">
                        <select
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
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
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-center outline-none"
                          value={item.TietBatDau}
                          onChange={(e) =>
                            handleChange(index, "TietBatDau", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="1"
                          max="5"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-center outline-none"
                          value={item.SoTiet}
                          onChange={(e) =>
                            handleChange(index, "SoTiet", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          placeholder="VD: A1-102"
                          className="w-full p-2 bg-gray-50 border-none rounded-xl text-xs font-bold placeholder:text-gray-300 outline-none"
                          value={item.PhongHoc || ""}
                          onChange={(e) =>
                            handleChange(index, "PhongHoc", e.target.value)
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
            + Thêm buổi học mới
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

export default LichHocModal;
