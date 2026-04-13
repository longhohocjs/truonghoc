import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const NhapDiemModal = ({ isOpen, onClose, lop }) => {
  const [sinhViens, setSinhViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen && lop) {
      fetchSinhVien();
    }
  }, [isOpen, lop]);

  const fetchSinhVien = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/giang-vien/lop/sinh-vien", {
        lopHocPhanID: lop.lop_hoc_phan_id,
      });
      setSinhViens(res.success ? res.data : res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách SV:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiem = async (svId, field, value) => {
    try {
      const sv = sinhViens.find((s) => s.sinh_vien_id === svId);
      const payload = {
        lop_hoc_phan_id: lop.lop_hoc_phan_id,
        sinh_vien_id: svId,
        diem_chuyen_can: field === "diem_cc" ? value : sv.diem_cc,
        diem_giua_ky: field === "diem_gk" ? value : sv.diem_gk,
        diem_thi: field === "diem_thi" ? value : sv.diem_thi,
      };

      const res = await axiosClient.post("/giang-vien/nhap-diem", payload);
      toast.success(`Đã lưu điểm cho SV ${sv.ho_ten}`);

      // Cập nhật state local
      setSinhViens((prev) =>
        prev.map((s) =>
          s.sinh_vien_id === svId
            ? { ...s, [field]: value, diem_tk: res.diem_tk || s.diem_tk }
            : s,
        ),
      );
    } catch (error) {
      toast.error("Lỗi khi cập nhật điểm!");
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axiosClient.post(
        `/giang-vien/lop-hoc-phan/${lop.lop_hoc_phan_id}/import-diem`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      alert(res.message);
      fetchSinhVien();
    } catch (error) {
      alert("Lỗi import Excel!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Quản lý điểm lớp: {lop.ma_lop_hp}
            </h3>
            <p className="text-xs text-gray-500">{lop.ten_mon}</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-all">
              📥 Import Excel
              <input
                type="file"
                className="hidden"
                onChange={handleImportExcel}
                accept=".xlsx,.xls"
              />
            </label>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3 px-2">Mã SV</th>
                  <th className="pb-3 px-2">Họ tên</th>
                  <th className="pb-3 px-2 text-center w-24">Chuyên cần</th>
                  <th className="pb-3 px-2 text-center w-24">Giữa kỳ</th>
                  <th className="pb-3 px-2 text-center w-24">Điểm thi</th>
                  <th className="pb-3 px-2 text-center w-24">Tổng kết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sinhViens.map((sv) => (
                  <tr
                    key={sv.sinh_vien_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium text-blue-600 text-sm">
                      {sv.ma_sv}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-800 text-sm">
                      {sv.ho_ten}
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full p-2 border border-gray-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={sv.diem_cc ?? ""}
                        onBlur={(e) =>
                          handleUpdateDiem(
                            sv.sinh_vien_id,
                            "diem_cc",
                            e.target.value,
                          )
                        }
                        onChange={(e) =>
                          setSinhViens((prev) =>
                            prev.map((s) =>
                              s.sinh_vien_id === sv.sinh_vien_id
                                ? { ...s, diem_cc: e.target.value }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full p-2 border border-gray-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={sv.diem_gk ?? ""}
                        onBlur={(e) =>
                          handleUpdateDiem(
                            sv.sinh_vien_id,
                            "diem_gk",
                            e.target.value,
                          )
                        }
                        onChange={(e) =>
                          setSinhViens((prev) =>
                            prev.map((s) =>
                              s.sinh_vien_id === sv.sinh_vien_id
                                ? { ...s, diem_gk: e.target.value }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        className="w-full p-2 border border-gray-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={sv.diem_thi ?? ""}
                        onBlur={(e) =>
                          handleUpdateDiem(
                            sv.sinh_vien_id,
                            "diem_thi",
                            e.target.value,
                          )
                        }
                        onChange={(e) =>
                          setSinhViens((prev) =>
                            prev.map((s) =>
                              s.sinh_vien_id === sv.sinh_vien_id
                                ? { ...s, diem_thi: e.target.value }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`font-bold text-sm ${parseFloat(sv.diem_tk) >= 5 ? "text-green-600" : "text-red-500"}`}
                      >
                        {sv.diem_tk || "--"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-all"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};

export default NhapDiemModal;
