import React, { useEffect, useState } from "react";
import axiosClient from "@/api/axios";

const LichThiManagementPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get("/admin/lop-hoc-phan");
        const allSchedules = [];
        const lops = res.data?.data || res.data || [];

        lops.forEach((lop) => {
          // Tổng hợp lịch thi từ các lớp học phần (sử dụng lich_thi hoặc lich_thi_details)
          const exams = lop.lich_thi || lop.lich_thi_details || [];
          exams.forEach((exam) => {
            allSchedules.push({
              ...exam,
              MaLopHP: lop.MaLopHP,
              TenMon: lop.mon_hoc?.TenMon,
              GiangVien: lop.giang_vien?.HoTen || "Chưa phân công",
              HocKy: lop.hoc_ky?.TenHocKy,
            });
          });
        });
        setSchedules(allSchedules);
      } catch (error) {
        console.error("Lỗi tải lịch thi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Tổng hợp Lịch thi
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Toàn bộ khung thời gian tổ chức thi của hệ thống
          </p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
          <span className="text-xs font-bold text-orange-600">
            Tổng cộng: {schedules.length} buổi thi
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Ngày thi & Giờ
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Lớp học phần
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Giảng viên
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Phòng thi
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Hình thức
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
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Đang tổng hợp dữ liệu...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    Chưa có lịch thi nào được phân công
                  </td>
                </tr>
              ) : (
                schedules
                  .sort(
                    (a, b) =>
                      new Date(a.NgayThi || a.ngay_thi) -
                      new Date(b.NgayThi || b.ngay_thi),
                  )
                  .map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-100">
                            {
                              formatDate(item.NgayThi || item.ngay_thi).split(
                                "/",
                              )[0]
                            }
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">
                              {formatDate(item.NgayThi || item.ngay_thi)}
                            </p>
                            <p className="text-[10px] font-bold text-orange-500 uppercase">
                              {item.GioBatDau || item.gio_bat_dau} -{" "}
                              {item.GioKetThuc || item.gio_ket_thuc}
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
                          {item.PhongThi || item.phong_thi || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                            item.HinhThucThi === "Tự luận"
                              ? "bg-blue-100 text-blue-600"
                              : item.HinhThucThi === "Trắc nghiệm"
                                ? "bg-purple-100 text-purple-600"
                                : item.HinhThucThi === "Báo cáo"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.HinhThucThi || "Tập trung"}
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

export default LichThiManagementPage;
