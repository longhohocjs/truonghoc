import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const LichCoiThi = () => {
  const [lichCoiThi, setLichCoiThi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLichCoiThi = async () => {
      try {
        const response = await axiosClient.get("/giang-vien/lich-coi-thi");

        console.log("Dữ liệu lịch coi thi nhận được:", response);

        const isSuccess =
          response?.success === true || response?.status === "success";
        const payload = isSuccess ? response.data : response;
        const dataArray = Array.isArray(payload)
          ? payload
          : payload?.data || [];
        if (dataArray.length > 0) {
          setLichCoiThi(dataArray);
        } else {
          // Dữ liệu mẫu minh họa nếu API chưa sẵn sàng hoặc trả về rỗng
          setLichCoiThi([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch coi thi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLichCoiThi();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-600">
        Đang tải lịch coi thi...
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Lịch coi thi</h2>
        <p className="text-gray-500 text-sm">
          Thông tin chi tiết các buổi coi thi được phân công
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Mã LHP</th>
                <th className="px-6 py-4">Tên môn học</th>
                <th className="px-6 py-4">Ngày thi</th>
                <th className="px-6 py-4 text-center">Giờ thi</th>
                <th className="px-6 py-4">Phòng thi</th>
                <th className="px-6 py-4">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lichCoiThi.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Hiện chưa có lịch coi thi nào được phân công.
                  </td>
                </tr>
              ) : (
                lichCoiThi.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {item.lop_hoc_phan?.MaLopHP ||
                        item.MaLopHP ||
                        item.ma_lop_hp}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.lop_hoc_phan?.mon_hoc?.TenMon ||
                        item.mon_hoc?.TenMon ||
                        item.TenMon ||
                        item.ten_mon}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {item.NgayThi || item.ngay_thi}
                    </td>
                    <td className="px-6 py-4 text-center text-orange-600 font-bold">
                      {item.GioBatDau || item.gio_bat_dau} -{" "}
                      {item.GioKetThuc || item.gio_ket_thuc}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.PhongHoc ||
                        item.phong_thi ||
                        item.phong_hoc ||
                        "Đang cập nhật"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-bold">
                        {item.VaiTro || item.vai_tro || "Cán bộ coi thi"}
                      </span>
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

export default LichCoiThi;
