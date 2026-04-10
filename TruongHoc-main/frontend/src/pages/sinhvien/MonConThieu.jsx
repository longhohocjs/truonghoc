import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const MonConThieu = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get("/sinh-vien/mon-con-thieu");
        // Kiểm tra cấu trúc response chuẩn từ Controller success()
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách môn còn thiếu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Đang kiểm tra dữ liệu đào tạo...
      </div>
    );

  const tongTinChiThieu = data.reduce(
    (sum, item) =>
      sum + (item.SoTinChi || item.so_tin_chi || item.tin_chi || 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-red-500">🚩</span> Môn học còn thiếu
          </h2>
          <p className="text-gray-500 text-sm">
            Danh sách các học phần trong CTĐT bạn chưa hoàn thành hoặc chưa đạt
          </p>
        </div>
        <div className="bg-red-50 px-5 py-3 rounded-2xl border border-red-100 text-center shadow-sm">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">
            Tín chỉ cần tích lũy thêm
          </p>
          <p className="text-2xl font-black text-red-700 leading-none">
            {tongTinChiThieu}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Mã môn</th>
                <th className="px-6 py-4">Tên môn học</th>
                <th className="px-6 py-4 text-center">Tín chỉ</th>
                <th className="px-6 py-4 text-center">Học kỳ gợi ý</th>
                <th className="px-6 py-4 text-center">Loại môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-16 text-center text-green-500 font-bold italic"
                  >
                    Chúc mừng! Bạn đã hoàn thành tất cả các môn học trong chương
                    trình đào tạo.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-red-50/10 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-gray-500">
                      {item.MaMon || item.ma_mon}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                      {item.TenMon || item.ten_mon}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {item.SoTinChi || item.so_tin_chi || item.tin_chi}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-bold">
                        Kỳ {item.HocKyGoiY || item.hoc_ky_goi_y || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          item.LoaiMon === 1 ||
                          item.loai_mon === 1 ||
                          item.bat_buoc === true
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        {item.LoaiMon === 1 ||
                        item.loai_mon === 1 ||
                        item.bat_buoc === true
                          ? "BẮT BUỘC"
                          : "TỰ CHỌN"}
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

export default MonConThieu;
