import React, { useEffect, useState } from "react";
import axiosClient from "@/api/axios";

import NhapDiemModal from "./NhapDiemModal";

const LopPhanCong = () => {
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLop, setSelectedLop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLops = async () => {
      try {
        const response = await axiosClient.get("/giang-vien/lop-phan-cong");
        if (response.success) {
          setLops(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLops();
  }, []);

  const handleExportTemplate = async (lopId, maLop) => {
    try {
      const response = await axiosClient.get(
        `/giang-vien/lop-hoc-phan/${lopId}/export-diem`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mau-nhap-diem-${maLop}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Lỗi tải file mẫu!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10 font-medium">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Lớp học phần đang giảng dạy
        </h2>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          Tổng số: {lops.length} lớp
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Mã Lớp HP</th>
              <th className="px-6 py-4">Tên Môn Học</th>
              <th className="px-6 py-4">Tín chỉ</th>
              <th className="px-6 py-4">Học kỳ</th>
              <th className="px-6 py-4 text-center">Sĩ số</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lops.map((lop) => (
              <tr
                key={lop.lop_hoc_phan_id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-blue-600">
                  {lop.ma_lop_hp}
                </td>
                <td className="px-6 py-4 font-medium">{lop.ten_mon}</td>
                <td className="px-6 py-4">{lop.so_tin_chi}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{lop.ten_hoc_ky}</div>
                  <div className="text-xs text-gray-400">{lop.nam_hoc}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lop.so_sinh_vien >= lop.so_luong_toi_da
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {lop.si_so}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedLop(lop);
                      setIsModalOpen(true);
                    }}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm mr-2"
                  >
                    Nhập điểm
                  </button>
                  <button
                    onClick={() =>
                      handleExportTemplate(lop.lop_hoc_phan_id, lop.ma_lop_hp)
                    }
                    className="text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200"
                  >
                    Mẫu Excel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NhapDiemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lop={selectedLop}
      />
    </div>
  );
};
export default LopPhanCong;
