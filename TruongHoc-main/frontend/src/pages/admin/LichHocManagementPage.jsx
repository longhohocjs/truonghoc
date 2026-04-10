import React, { useEffect, useState } from "react";
import axiosClient from "@/api/axios";

const LichHocManagementPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get("/admin/lop-hoc-phan");
        // Phẳng hóa dữ liệu: Mỗi buổi học của mỗi lớp thành 1 dòng trong bảng tổng quát
        const allSchedules = [];
        const lops = res.data?.data || res.data || [];

        lops.forEach((lop) => {
          if (lop.lich_hoc_details && lop.lich_hoc_details.length > 0) {
            // Lọc unique theo Thứ để hiển thị cấu hình gốc
            const uniqueLich = Array.from(
              new Map( // Sử dụng String() để đảm bảo key của Map là duy nhất và không bị null/undefined
                lop.lich_hoc_details.map((l) => [
                  String(l.Thu || l.thu || l.NgayHoc),
                  l,
                ]),
              ).values(),
            );

            uniqueLich.forEach((lich) => {
              allSchedules.push({
                ...lich,
                MaLopHP: lop.MaLopHP,
                Thu: parseInt(lich.Thu || lich.thu || 0), // Đảm bảo Thu luôn là một số, mặc định là 0 nếu không hợp lệ
                TenMon: lop.mon_hoc?.TenMon,
                GiangVien: lop.giang_vien?.HoTen || "Chưa phân công",
                HocKy: lop.hoc_ky?.TenHocKy,
              });
            });
          }
        });
        setSchedules(allSchedules);
      } catch (error) {
        console.error("Lỗi tải lịch học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getThuLabel = (thu) => {
    const val = parseInt(thu, 10); // Luôn chỉ định radix 10
    if (isNaN(val) || val < 2 || val > 8) {
      return "Không xác định"; // Trả về giá trị mặc định nếu không phải số hoặc ngoài khoảng
    }
    return val === 8 ? "Chủ Nhật" : `Thứ ${val}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Tổng hợp Lịch giảng dạy
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Toàn bộ khung thời gian đào tạo của hệ thống
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <span className="text-xs font-bold text-blue-600">
            Tổng cộng: {schedules.length} buổi học/tuần
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Lớp học phần
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Giảng viên
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Phòng
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Học kỳ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Đang tổng hợp dữ liệu...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Chưa có lịch học nào được phân công
                  </td>
                </tr>
              ) : (
                schedules
                  .sort((a, b) => (a.Thu || a.thu) - (b.Thu || b.thu))
                  .map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">
                            {getThuLabel(item.Thu).charAt(0)}{" "}
                            {/* Hiển thị ký tự đầu tiên của Thứ */}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">
                              {getThuLabel(item.Thu || item.thu)}
                            </p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase">
                              Tiết {item.TietBatDau} -{" "}
                              {parseInt(item.TietBatDau) +
                                parseInt(item.SoTiet) -
                                1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-800">
                          {item.TenMon}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {item.MaLopHP}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-600">
                          {item.GiangVien}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 border border-gray-200 uppercase">
                          {item.PhongHoc || item.phong_hoc || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-400">
                          {item.HocKy}
                        </p>
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

export default LichHocManagementPage;
