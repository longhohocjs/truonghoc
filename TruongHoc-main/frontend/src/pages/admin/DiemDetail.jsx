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
      // Sử dụng đúng API bảng điểm lớp học phần
      const res = await axiosClient.post("/admin/diem-so/danh-sach-lop-hp", {
        LopHocPhanID: id,
      });
      const data = getArray(res);
      setStudents(data);

      // Lấy thông tin lớp từ bản ghi đầu tiên
      if (data.length > 0) setInfo(data[0].lop_hoc_phan);
    } catch (error) {
      toast.error("Không thể tải bảng điểm");
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
            DiemChuyenCan: student.DiemChuyenCan || student.diem_cc,
            DiemGiuaKy: student.DiemGiuaKy || student.diem_gk,
            DiemThi: student.DiemThi || student.diem_thi,
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
      await axiosClient.post(endpoint, { LopHocPhanID: id });
      toast.success(isLock ? "Đã khóa bảng điểm" : "Đã mở khóa bảng điểm");
      fetchData();
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const calculateTotal = (cc, gk, thi) => {
    const total =
      Number(cc || 0) * 0.1 + Number(gk || 0) * 0.3 + Number(thi || 0) * 0.6;
    return total.toFixed(1);
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
              {info?.MaLopHP} - {info?.mon_hoc?.TenMon}
            </p>
          </div>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => toggleLock(false)}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-bold hover:bg-green-50"
          >
            MỞ KHÓA
          </button>
          <button
            onClick={() => toggleLock(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
          >
            KHÓA ĐIỂM
          </button>
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
              <th className="px-4 py-4 text-center w-24">Tổng kết</th>
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
            ) : (
              students.map((sv) => (
                <tr key={sv.SinhVienID} className="hover:bg-gray-50 text-sm">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">
                      {sv.HoTen || sv.sinh_vien?.HoTen}
                    </div>
                    <div className="text-xs text-gray-400">
                      {sv.MaSV || sv.sinh_vien?.MaSV}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                      value={sv.diem_cc || ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "diem_cc",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                      value={sv.diem_gk || ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "diem_gk",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full p-1.5 border border-gray-200 rounded text-center outline-none focus:ring-1 focus:ring-blue-500"
                      value={sv.diem_thi || ""}
                      onChange={(e) =>
                        handleGradeChange(
                          sv.SinhVienID,
                          "diem_thi",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-center font-black text-blue-600">
                    {calculateTotal(sv.diem_cc, sv.diem_gk, sv.diem_thi)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => saveGrade(sv)}
                      disabled={saving}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                    >
                      LƯU
                    </button>
                  </td>
                </tr>
              ))
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
