import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const LichThi = () => {
  const [lichThi, setLichThi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLichThi = async () => {
      try {
        const response = await axiosClient.get("/sinh-vien/lich-thi");

        // Cấu trúc response từ axiosClient: { success: true, data: { data: [], hoc_ky: ... } }
        // Trích xuất payload (có thể là response.data hoặc chính response tùy interceptor)
        const payload = response?.data || response;

        // Tìm mảng dữ liệu thực sự (ưu tiên payload.data nếu là mảng, ngược lại dùng chính payload)
        const dataArray = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        setLichThi(dataArray);
      } catch (error) {
        console.error("Lỗi khi tải lịch thi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLichThi();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-600">
        Đang tải lịch thi...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Lịch thi cá nhân</h2>
        <p className="text-gray-500 text-sm">
          Thông tin chi tiết các môn thi trong học kỳ hiện tại
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Mã môn</th>
                <th className="px-6 py-4">Tên môn học</th>
                <th className="px-6 py-4">Ngày thi</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">
                  Giờ thi
                </th>
                <th className="px-6 py-4">Phòng thi</th>
                <th className="px-6 py-4 text-center">Số báo danh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lichThi.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Hiện chưa có lịch thi nào được sắp xếp.
                  </td>
                </tr>
              ) : (
                lichThi.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {item.ma_mon || item.lop_hoc_phan?.mon_hoc?.MaMon}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.ten_mon || item.lop_hoc_phan?.mon_hoc?.TenMon}
                    </td>
                    <td className="px-6 py-4 font-medium ">
                      {item.ngay_thi || item.NgayThi}
                    </td>
                    <td className="px-6 py-4 text-center text-orange-600 font-bold whitespace-nowrap min-w-[120px]">
                      {item.gio_thi ||
                        `${item.gio_bat_dau} - ${item.gio_ket_thuc}`}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.phong_thi || item.PhongHoc || "Đang cập nhật"}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-indigo-600">
                      {item.sbd || item.SBD || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LichThi;
