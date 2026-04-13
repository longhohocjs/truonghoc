import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import { Users, Save } from "lucide-react";
import toast from "react-hot-toast";

const AdvisorClass = () => {
  const [lops, setLops] = useState([]);
  const [selectedLop, setSelectedLop] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const resLops = await axiosClient.get(
          "/giang-vien/lop-sinh-hoat/phan-cong",
        );
        // Trích xuất mảng từ resLops.data
        const lopsData = resLops?.data || resLops || [];
        setLops(Array.isArray(lopsData) ? lopsData : []);

        // Lấy ID của lớp đầu tiên một cách an toàn
        const firstLopId =
          lopsData[0]?.LopSinhHoatID || lopsData[0]?.lop_sinh_hoat_id;
        if (firstLopId) setSelectedLop(firstLopId);
      } catch (error) {
        toast.error("Không thể tải thông tin lớp cố vấn");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedLop) return;
      try {
        const res = await axiosClient.post(
          "/giang-vien/lop-sinh-hoat/sinh-vien",
          {
            lopSinhHoatID: selectedLop,
          },
        );
        // axiosClient đã trả về response.data, nên ta lấy .data của nó (nếu có wrapper success)
        setStudents(res?.data || (Array.isArray(res) ? res : []));
      } catch (error) {
        toast.error("Lỗi tải danh sách sinh viên");
      }
    };
    fetchStudents();
  }, [selectedLop]);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Lớp sinh hoạt (Cố vấn)
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý sinh viên lớp chủ nhiệm
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="border p-2 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedLop}
            onChange={(e) => setSelectedLop(e.target.value)}
          >
            <option value="">-- Chọn lớp --</option>
            {lops.map((l, index) => (
              <option
                key={l.LopSinhHoatID || l.lop_sinh_hoat_id || index}
                value={l.LopSinhHoatID || l.lop_sinh_hoat_id}
              >
                {l.TenLop || l.ten_lop}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">STT</th>
              <th className="px-6 py-4">MSSV</th>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Số điện thoại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              students.map((sv, index) => (
                <tr
                  key={sv.sinh_vien_id || sv.SinhVienID || index}
                  className="hover:bg-indigo-50/10 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600 text-sm">
                    {sv.ma_sv}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">
                    {sv.ho_ten}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {sv.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {sv.so_dien_thoai || "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvisorClass;
