import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const MonDaHoanThanh = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get("/sinh-vien/mon-da-hoan-thanh");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách môn học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-500">
        Đang tải dữ liệu môn học...
      </div>
    );

  const tongTinChi = data.reduce(
    (sum, item) =>
      sum + (item.SoTinChi || item.so_tin_chi || item.tin_chi || 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2 text-green-500">✅</span> Môn học đã hoàn
            thành
          </h2>
          <p className="text-gray-500 text-sm">
            Danh sách các học phần đã đạt điểm tích lũy (Điểm Hệ 10 ≥ 5.0)
          </p>
        </div>
        <div className="bg-green-50 px-5 py-3 rounded-2xl border border-green-100 text-center shadow-sm">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">
            Tổng tín chỉ tích lũy
          </p>
          <p className="text-2xl font-black text-green-700 leading-none">
            {tongTinChi}
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
                <th className="px-6 py-4 text-center">Điểm đạt</th>
                <th className="px-6 py-4 text-center">Số lần học</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-16 text-center text-gray-400 italic"
                  >
                    Bạn chưa hoàn thành môn học nào.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-green-50/20 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {item.MaMon || item.ma_mon}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 group-hover:text-blue-700">
                      {item.TenMon || item.ten_mon}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {item.SoTinChi || item.so_tin_chi || item.tin_chi}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                        {item.Diem ||
                          item.DiemTongKet ||
                          item.DiemTK ||
                          item.diem_tong_ket ||
                          item.diem_tk ||
                          item.diem || // Thêm item.diem vào đây
                          "0.0"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${(item.SoLanHoc || item.so_lan_hoc) > 1 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {item.SoLanHoc || item.so_lan_hoc || 1} lần
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

export default MonDaHoanThanh;
