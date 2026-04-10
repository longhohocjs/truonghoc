import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const ChuongTrinhDaoTao = () => {
  const [data, setData] = useState({ nganh: "", chuong_trinh: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCTDT = async () => {
      try {
        const res = await axiosClient.get("/sinh-vien/chuong-trinh");
        // axiosClient interceptor đã trả về thẳng response.data (là { success: ..., data: ... })
        // Ta cần lấy phần 'data' bên trong response.data của Laravel
        // (tức là res.data.data)
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải CTĐT:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCTDT();
  }, []);

  // Nhóm môn học theo học kỳ gợi ý
  const grouped = (data.chuong_trinh || []).reduce((acc, item) => {
    const hk = item.HocKyGoiY || "Khác";
    if (!acc[hk]) acc[hk] = [];
    acc[hk].push(item);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="p-10 text-center">Đang tải chương trình đào tạo...</div>
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Chương trình đào tạo
          </h2>
          <p className="text-blue-600 font-medium">Ngành: {data.nganh}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          Tổng số môn: {data.chuong_trinh.length}
        </div>
      </div>

      {Object.entries(grouped).map(([hk, dsMon]) => (
        <div
          key={hk}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 font-bold text-gray-700">
            Học kỳ {hk}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Mã môn</th>
                <th className="px-6 py-3">Tên môn học</th>
                <th className="px-6 py-3 text-center">Tín chỉ</th>
                <th className="px-6 py-3 text-center">Loại môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dsMon.map((item) => (
                <tr
                  key={item.ChuongTrinhID}
                  className="hover:bg-blue-50/20 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {item.mon_hoc?.MaMon}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {item.mon_hoc?.TenMon}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.mon_hoc?.SoTinChi}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.LoaiMon === 1
                          ? "bg-orange-50 text-orange-600 border border-orange-100"
                          : "bg-gray-50 text-gray-500 border border-gray-100"
                      }`}
                    >
                      {item.LoaiMon === 1 ? "BẮT BUỘC" : "TỰ CHỌN"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ChuongTrinhDaoTao;
