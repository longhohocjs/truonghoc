import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";

const DiemManagement = () => {
  const navigate = useNavigate();
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper để trích xuất mảng dữ liệu linh hoạt
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchLopHocPhan = async () => {
    setLoading(true);
    try {
      // Sử dụng API lấy danh sách lớp học phần để quản lý điểm
      const res = await axiosClient.post("/admin/diem-so/danh-sach-lop-hp");
      setLops(getArray(res));
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLopHocPhan();
  }, []);

  const filteredLops = lops.filter(
    (l) =>
      l.MaLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mon_hoc?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Điểm số</h2>
        <p className="text-gray-500 text-sm">
          Chọn lớp học phần để quản lý bảng điểm
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Tìm theo mã lớp hoặc tên môn..."
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Mã LHP</th>
              <th className="px-6 py-4">Môn học</th>
              <th className="px-6 py-4">Giảng viên</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : filteredLops.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Không tìm thấy lớp nào.
                </td>
              </tr>
            ) : (
              filteredLops.map((lop) => (
                <tr
                  key={lop.LopHocPhanID}
                  className="hover:bg-gray-50 transition-colors text-sm"
                >
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {lop.MaLopHP}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {lop.mon_hoc?.TenMon}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {lop.hoc_ky?.TenHocKy}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {lop.giang_vien?.HoTen || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {lop.IsLocked ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold">
                        ĐÃ KHÓA
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold">
                        MỞ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        navigate(`/admin/diem-so/${lop.LopHocPhanID}`)
                      }
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                      VÀO ĐIỂM
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiemManagement;
