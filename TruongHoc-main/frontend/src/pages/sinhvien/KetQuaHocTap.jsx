import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const KetQuaHocTap = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm quy đổi điểm số sang điểm chữ (Hệ 4 chuẩn Việt Nam)
  const quyDoiDiemChu = (diem) => {
    if (diem === null || diem === undefined || diem === "") return "-";
    const d = parseFloat(diem);
    if (isNaN(d)) return "-";

    if (d >= 8.5) return "A";
    if (d >= 7.0) return "B";
    if (d >= 5.5) return "C";
    if (d >= 4.0) return "D";
    return "F";
  };

  useEffect(() => {
    const fetchKetQua = async () => {
      try {
        const response = await axiosClient.post("/sinh-vien/ket-qua-hoc-tap");
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải kết quả học tập:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKetQua();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center font-medium">Đang tải bảng điểm...</div>
    );
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy dữ liệu kết quả học tập.
      </div>
    );

  const diem_chi_tiet = data.diem_chi_tiet || data.DiemChiTiet || [];
  const gpa_hoc_ky = data.gpa_hoc_ky || data.GPAHocKy || null;

  // Tính toán GPA dự phòng nếu gpa_hoc_ky bị null nhưng có diem_chi_tiet
  const gpa_hệ_10 =
    gpa_hoc_ky?.gpa ||
    gpa_hoc_ky?.GPA ||
    (diem_chi_tiet.length > 0
      ? (
          diem_chi_tiet.reduce(
            (sum, i) =>
              sum +
              parseFloat(i.diem_tk || i.DiemTongKet || 0) *
                parseInt(i.so_tin_chi || i.SoTinChi || 0),
            0,
          ) /
          diem_chi_tiet.reduce(
            (sum, i) => sum + parseInt(i.so_tin_chi || i.SoTinChi || 0),
            0,
          )
        ).toFixed(2)
      : "0.0");

  const tong_tin_chi =
    gpa_hoc_ky?.tong_tin_chi ||
    gpa_hoc_ky?.TongTinChi ||
    diem_chi_tiet.reduce(
      (sum, i) => sum + parseInt(i.so_tin_chi || i.SoTinChi || 0),
      0,
    );

  // Nhóm điểm theo học kỳ để hiển thị theo từng block
  const groupedBySemester = diem_chi_tiet.reduce((acc, item) => {
    const hocKy = item.ten_hoc_ky || item.TenHocKy || "Học kỳ khác";
    if (!acc[hocKy]) {
      acc[hocKy] = [];
    }
    acc[hocKy].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kết quả học tập</h2>
          <p className="text-gray-500 text-sm">
            Tra cứu điểm chi tiết và tiến độ học tập qua các học kỳ
          </p>
        </div>
      </div>

      {/* Tóm tắt GPA hiện tại */}
      {(gpa_hoc_ky || diem_chi_tiet.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="GPA Hệ 10"
            value={gpa_hệ_10}
            subValue="Học kỳ hiện tại"
            color="text-blue-600"
          />
          <SummaryCard
            title="GPA Hệ 4"
            value={
              gpa_hoc_ky?.gpa_he_4 || (parseFloat(gpa_hệ_10) * 0.4).toFixed(2)
            }
            subValue="Quy đổi"
            color="text-indigo-600"
          />
          <SummaryCard
            title="Số tín chỉ đạt"
            value={tong_tin_chi}
            subValue="Tích lũy học kỳ"
            color="text-green-600"
          />
          <SummaryCard
            title="Số môn học"
            value={
              gpa_hoc_ky?.so_mon || gpa_hoc_ky?.SoMon || diem_chi_tiet.length
            }
            subValue="Đã hoàn thành"
            color="text-orange-600"
          />
        </div>
      )}

      {/* Hiển thị bảng điểm theo từng học kỳ */}
      {Object.keys(groupedBySemester).length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center text-gray-400 border border-dashed border-gray-300">
          Chưa có dữ liệu điểm học phần.
        </div>
      ) : (
        Object.entries(groupedBySemester).map(([tenHocKy, dsDiem]) => (
          <div
            key={tenHocKy}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{tenHocKy}</h3>
              <span className="text-xs text-gray-500 font-medium italic">
                Bảng điểm chính thức
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Mã môn</th>
                    <th className="px-6 py-4">Tên môn học</th>
                    <th className="px-2 py-4 text-center">Tín chỉ</th>
                    <th className="px-2 py-4 text-center">CC</th>
                    <th className="px-2 py-4 text-center">GK</th>
                    <th className="px-2 py-4 text-center">Thi</th>
                    <th className="px-2 py-4 text-center">TK (10)</th>
                    <th className="px-2 py-4 text-center">Điểm Chữ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dsDiem.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {item.ma_mon || item.MaMon}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {item.ten_mon || item.TenMon}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.so_tin_chi || item.SoTinChi}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.diem_cc || item.DiemChuyenCan || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.diem_gk || item.DiemGiuaKy || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.diem_thi || item.DiemThi || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-700">
                          {item.diem_tk || item.DiemTongKet || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const diemChu =
                            item.diem_chu ||
                            item.DiemChu ||
                            quyDoiDiemChu(item.diem_tk || item.DiemTongKet);
                          return (
                            <span
                              className={`font-bold px-2 py-1 rounded ${diemChu === "F" ? "text-red-500" : "text-blue-600"}`}
                            >
                              {diemChu}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, subValue, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
      {title}
    </p>
    <div className={`text-3xl font-black mt-2 ${color}`}>{value}</div>
    <p className="text-xs text-gray-400 mt-1 italic">{subValue}</p>
  </div>
);

export default KetQuaHocTap;
