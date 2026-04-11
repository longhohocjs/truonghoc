import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const DiemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper để trích xuất mảng dữ liệu linh hoạt
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!id) throw new Error("ID không hợp lệ");

      console.log("Gửi yêu cầu lấy điểm cho ID:", id);

      // Sử dụng đúng API bảng điểm lớp học phần
      const res = await axiosClient.post("/admin/diem-so/danh-sach-lop-hp", {
        LopHocPhanID: id,
      });
      const data = getArray(res);

      // Log để kiểm tra xem Backend có trả về IsLocked không
      if (data.length > 0) {
        console.log("Dữ liệu bản ghi đầu tiên từ Backend:", data[0]);
      }

      // CẬP NHẬT: Thêm dòng này để đưa dữ liệu vào state students
      setStudents(data);

      // Lấy thông tin lớp từ bản ghi đầu tiên
      if (data.length > 0) {
        // Map đầy đủ các trường từ View (PascalCase)
        setInfo({
          MaLopHP: data[0].MaLopHP,
          TenMon: data[0].TenMon,
          HoTenGV: data[0].HoTenGV || "Chưa phân công",
          TenHocKy: data[0].TenHocKy,
          IsLocked: Number(data[0].IsLocked ?? data[0].is_locked ?? 0),
          MonTienQuyet: data[0].MonTienQuyet,
          MonSongHanh: data[0].MonSongHanh,
        });
      }
    } catch (error) {
      console.error("Lỗi fetchData:", error);
      toast.error(error.message || "Không thể tải bảng điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGradeChange = (studentId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.SinhVienID === studentId) {
          return { ...s, [field]: value };
        }
        return s;
      }),
    );
  };

  const saveGrade = async (student) => {
    setSaving(true);
    try {
      // Đồng bộ cấu trúc gửi lên với DiemSoService.php
      await axiosClient.post("/admin/diem-so/nhap-diem", {
        LopHocPhanID: id,
        DanhSachDiem: [
          {
            DangKyID: student.DangKyID,
            DiemChuyenCan: student.DiemChuyenCan,
            DiemGiuaKy: student.DiemGiuaKy,
            DiemThi: student.DiemThi,
          },
        ],
      });
      toast.success(`Đã cập nhật điểm cho ${student.HoTen}`);
    } catch (error) {
      toast.error("Lỗi khi lưu điểm");
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (isLock) => {
    const endpoint = isLock
      ? "/admin/diem-so/khoa-diem"
      : "/admin/diem-so/mo-khoa-diem";
    try {
      const res = await axiosClient.post(endpoint, { LopHocPhanID: id });
      toast.success(isLock ? "Đã khóa bảng điểm" : "Đã mở khóa bảng điểm");

      // Cập nhật state local ngay lập tức
      setInfo((prev) => (prev ? { ...prev, IsLocked: isLock ? 1 : 0 } : null));

      // Tùy chọn: Đợi 500ms trước khi fetch để DB kịp cập nhật nếu là View
      setTimeout(() => fetchData(), 500);
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const calculateTotal = (cc, gk, thi) => {
    const nCC = parseFloat(cc) || 0;
    const nGK = parseFloat(gk) || 0;
    const nThi = parseFloat(thi) || 0;

    if (cc === null && gk === null && thi === null) return "0.0";
    const totalScore = nCC * 0.1 + nGK * 0.3 + nThi * 0.6;
    return totalScore.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/diem-so")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ⬅️
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Bảng điểm chi tiết
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-blue-600">{info?.MaLopHP}</span> -{" "}
              {info?.TenMon}
              {info?.HoTenGV && (
                <span className="ml-2 italic text-gray-400">
                  | GV: {info.HoTenGV}
                </span>
              )}
            </p>
            {(info?.MonTienQuyet || info?.MonSongHanh) && (
              <div className="text-[10px] mt-1 flex space-x-4 text-gray-400">
                {info.MonTienQuyet && info.MonTienQuyet !== "Không có" && (
                  <span>
                    <strong>Môn tiên quyết:</strong> {info.MonTienQuyet}
                  </span>
                )}
                {info.MonSongHanh && info.MonSongHanh !== "Không có" && (
                  <span>
                    <strong>Môn song hành:</strong> {info.MonSongHanh}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="space-x-3">
          {info?.IsLocked == 1 ? (
            <button
              onClick={() => toggleLock(false)}
              className="px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-200 transition-all"
            >
              🔓 MỞ KHÓA NHẬP ĐIỂM
            </button>
          ) : (
            <button
              onClick={() => toggleLock(true)}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-all"
            >
              🔒 KHÓA BẢNG ĐIỂM
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Sinh viên</th>
              <th className="px-4 py-4 text-center w-24">Chuyên cần (10%)</th>
              <th className="px-4 py-4 text-center w-24">Giữa kỳ (30%)</th>
              <th className="px-4 py-4 text-center w-24">Cuối kỳ (60%)</th>
              <th className="px-4 py-4 text-center w-24 font-bold text-blue-600">
                Tổng kết
              </th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-10 text-center">
                  Đang tải bảng điểm...
                </td>
              </tr>
            ) : students.length > 0 ? (
              students.map((sv) => (
                <tr
                  key={sv.DangKyID || sv.SinhVienID}
                  className="hover:bg-gray-50 text-sm"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">
                      {sv.HoTen || sv.ho_ten}
                    </div>
                    <div className="text-xs text-gray-400">
                      {sv.MaSV || sv.ma_sv}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      disabled={info?.IsLocked == 1}
                      step="0.1"
                      min="0"
                      max="10"
                      className={`w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500 ${info?.IsLocked == 1 ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                      value={sv.DiemChuyenCan ?? ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "DiemChuyenCan",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      disabled={info?.IsLocked == 1}
                      step="0.1"
                      min="0"
                      max="10"
                      className={`w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500 ${info?.IsLocked == 1 ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                      value={sv.DiemGiuaKy ?? ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "DiemGiuaKy",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      disabled={info?.IsLocked == 1}
                      step="0.1"
                      min="0"
                      max="10"
                      className={`w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500 ${info?.IsLocked == 1 ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                      value={sv.DiemThi ?? ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "DiemThi",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-center font-black text-blue-600">
                    {calculateTotal(
                      sv.DiemChuyenCan,
                      sv.DiemGiuaKy,
                      sv.DiemThi,
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {info?.IsLocked != 1 && (
                      <button
                        onClick={() => saveGrade(sv)}
                        disabled={saving}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                      >
                        LƯU
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-10 text-center text-gray-400 italic"
                >
                  Chưa có sinh viên nào đăng ký lớp học phần này hoặc không tìm
                  thấy dữ liệu điểm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Lưu ý:</strong> Admin có quyền thay đổi điểm ngay cả khi giảng
          viên đã nhập. Sau khi khóa điểm, giảng viên và sinh viên sẽ không thể
          thay đổi thông tin nhưng sinh viên có thể xem kết quả.
        </p>
      </div>
    </div>
  );
};

export default DiemDetail;
