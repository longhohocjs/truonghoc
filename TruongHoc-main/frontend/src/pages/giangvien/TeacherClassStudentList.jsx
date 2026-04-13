import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import { ArrowLeft, Printer, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";

const TeacherClassStudentList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API lấy dữ liệu in (chứa cả meta thông tin lớp và danh sách SV)
        // API: /giang-vien/lop-hoc-phan/{id}/print (Đã có trong api.php)
        const res = await axiosClient.get(
          `/giang-vien/lop-hoc-phan/${id}/print`,
        );
        setStudents(res.data?.danh_sach || []);
        setClassInfo(res.data?.meta || null);
      } catch (error) {
        toast.error("Không thể tải danh sách sinh viên");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-gray-500">
        Đang tải danh sách sinh viên...
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/giang-vien/lop-phan-cong")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-indigo-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Danh sách lớp học
            </h2>
            <p className="text-gray-500 text-sm">
              Mã lớp:{" "}
              <span className="font-bold text-indigo-600">
                {classInfo?.ma_lop_hp}
              </span>{" "}
              | Môn: <span className="font-bold">{classInfo?.ten_mon}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm print:hidden"
        >
          <Printer size={18} /> IN DANH SÁCH
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4 w-16">STT</th>
                <th className="px-6 py-4">MSSV</th>
                <th className="px-6 py-4">Họ và tên</th>
                <th className="px-6 py-4 text-center">CC</th>
                <th className="px-6 py-4 text-center">GK</th>
                <th className="px-6 py-4 text-center">Thi</th>
                <th className="px-6 py-4 text-center">TK</th>
                <th className="px-6 py-4 text-right">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-400 italic"
                  >
                    Chưa có sinh viên nào đăng ký lớp học này.
                  </td>
                </tr>
              ) : (
                students.map((sv, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50/10 transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-400 text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600 text-sm">
                      {sv.ma_sv}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 text-sm">
                      {sv.ho_ten}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm lowercase">
                      <div className="flex items-center gap-2">
                        <Mail size={12} /> {sv.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-gray-300" />{" "}
                        {sv.so_dien_thoai || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-green-100">
                        Thành công
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

export default TeacherClassStudentList;
