import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import {
  BookOpen,
  Users,
  FileSpreadsheet,
  ClipboardPenLine,
  ListChecks,
} from "lucide-react";
import NhapDiemModal from "./NhapDiemModal";

const LopPhanCong = () => {
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLop, setSelectedLop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex justify-center p-10 font-medium text-gray-500">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Lớp học phần giảng dạy
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý điểm và danh sách sinh viên các lớp được phân công
          </p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <span className="text-xs text-indigo-500 font-bold uppercase block text-center">
            Tổng số lớp
          </span>
          <span className="text-xl font-black text-indigo-700 block text-center">
            {lops.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
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
                  className="hover:bg-indigo-50/20 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {lop.ma_lop_hp}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                    {lop.ten_mon}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {lop.so_tin_chi}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{lop.ten_hoc_ky}</div>
                    <div className="text-xs text-gray-400">{lop.nam_hoc}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-black ${
                        lop.so_sinh_vien >= lop.so_luong_toi_da
                          ? "bg-red-100 text-red-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {lop.si_so}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/giang-vien/lop/${lop.lop_hoc_phan_id}/sinh-vien`,
                          )
                        }
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Xem danh sách sinh viên"
                      >
                        <ListChecks size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLop(lop);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-100"
                      >
                        <ClipboardPenLine size={14} className="mr-1.5" /> NHẬP
                        ĐIỂM
                      </button>
                      <button
                        onClick={() =>
                          handleExportTemplate(
                            lop.lop_hoc_phan_id,
                            lop.ma_lop_hp,
                          )
                        }
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Tải mẫu Excel"
                      >
                        <FileSpreadsheet size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
