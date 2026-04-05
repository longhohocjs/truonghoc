import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const LopSinhHoatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Dùng để chọn thêm
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper để trích xuất mảng dữ liệu linh hoạt
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchStudentsInLop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/admin/lop-sinh-hoat/list-students", {
        LopSinhHoatID: id,
      });
      setStudents(getArray(res));
    } catch (error) {
      toast.error("Không thể tải danh sách sinh viên trong lớp");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAllStudents = async () => {
    try {
      const res = await axiosClient.post("/admin/users/sinh-vien/index");
      const data = getArray(res);
      // Lọc ra những sinh viên chưa thuộc lớp này
      const filtered = data.filter(
        (s) =>
          !students.some(
            (inLop) =>
              (inLop.SinhVienID || inLop.sinh_vien?.SinhVienID) ===
              (s.SinhVienID || s.sinh_vien?.SinhVienID),
          ),
      );
      setAllStudents(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudentsInLop();
  }, [fetchStudentsInLop]);

  const handleRemove = async (sinhVienID) => {
    if (!window.confirm("Xác nhận xóa sinh viên này khỏi lớp?")) return;
    try {
      await axiosClient.post("/admin/lop-sinh-hoat/remove-student", {
        SinhVienID: sinhVienID,
      });
      toast.success("Đã xóa sinh viên khỏi lớp");
      fetchStudentsInLop();
    } catch (error) {
      toast.error("Lỗi khi xóa sinh viên");
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;
    try {
      await axiosClient.post("/admin/lop-sinh-hoat/add-students", {
        LopSinhHoatID: id,
        SinhVienID: selectedStudents,
      });
      toast.success("Thêm sinh viên thành công");
      setShowAddModal(false);
      setSelectedStudents([]);
      fetchStudentsInLop();
    } catch (error) {
      toast.error("Lỗi khi thêm sinh viên");
    }
  };

  const toggleSelectStudent = (svID) => {
    setSelectedStudents((prev) =>
      prev.includes(svID) ? prev.filter((i) => i !== svID) : [...prev, svID],
    );
  };

  const filteredStudentsToAdd = allStudents.filter(
    (s) =>
      s.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.MaSV?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/lop-sinh-hoat")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <span className="text-xl">⬅️</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết Lớp sinh hoạt
            </h2>
            <p className="text-gray-500 text-sm">
              Quản lý danh sách sinh viên của lớp
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchAllStudents();
            setShowAddModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow-md"
        >
          + Thêm sinh viên vào lớp
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Mã SV</th>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-400"
                >
                  Đang tải...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  Lớp chưa có sinh viên nào.
                </td>
              </tr>
            ) : (
              students.map((sv) => (
                <tr
                  key={sv.SinhVienID}
                  className="hover:bg-gray-50 transition-colors text-sm"
                >
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {sv.MaSV ||
                      sv.ma_sv ||
                      sv.sinh_vien?.MaSV ||
                      sv.sinh_vien?.ma_sv}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {sv.HoTen ||
                      sv.ho_ten ||
                      sv.sinh_vien?.HoTen ||
                      sv.sinh_vien?.ho_ten}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sv.email || sv.Email || sv.sinh_vien?.email}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {sv.SoDienThoai ||
                      sv.so_dien_thoai ||
                      sv.sodienthoai ||
                      sv.sinh_vien?.SoDienThoai ||
                      sv.sinh_vien?.sodienthoai}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        handleRemove(
                          sv.SinhVienID || sv.sinh_vien?.SinhVienID || sv.id,
                        )
                      }
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                    >
                      Xóa khỏi lớp
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm sinh viên */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Thêm sinh viên vào lớp
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Tìm sinh viên theo tên hoặc mã số..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-10">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedStudents(
                                filteredStudentsToAdd.map((s) => s.SinhVienID),
                              );
                            else setSelectedStudents([]);
                          }}
                        />
                      </th>
                      <th className="px-4 py-2">Mã SV</th>
                      <th className="px-4 py-2">Họ tên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudentsToAdd.map((s) => (
                      <tr
                        key={s.SinhVienID || s.sinh_vien?.SinhVienID || s.id}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() =>
                          toggleSelectStudent(
                            s.SinhVienID || s.sinh_vien?.SinhVienID,
                          )
                        }
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(
                              s.SinhVienID || s.sinh_vien?.SinhVienID,
                            )}
                            onChange={() => {}} // Đã xử lý ở tr click
                          />
                        </td>
                        <td className="px-4 py-2 font-bold">
                          {s.MaSV || s.ma_sv || s.sinh_vien?.MaSV}
                        </td>
                        <td className="px-4 py-2">
                          {s.HoTen || s.ho_ten || s.sinh_vien?.HoTen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-500 font-bold">
                  Đã chọn: {selectedStudents.length} sinh viên
                </span>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={selectedStudents.length === 0}
                    onClick={handleAddStudents}
                    className={`px-6 py-2 rounded-lg font-bold text-sm text-white ${
                      selectedStudents.length === 0
                        ? "bg-gray-300"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Thêm vào lớp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LopSinhHoatDetail;
