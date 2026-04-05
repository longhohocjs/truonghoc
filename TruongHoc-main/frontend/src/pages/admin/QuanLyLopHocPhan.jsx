import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import LopHocPhanModal from "./LopHocPhanModal";
import LichHocModal from "./LichHocModal";
import LichThiModal from "./LichThiModal";

const QuanLyLopHocPhan = () => {
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLichModalOpen, setIsLichModalOpen] = useState(false);
  const [isThiModalOpen, setIsThiModalOpen] = useState(false);
  const [editingLop, setEditingLop] = useState(null);
  const [selectedLopForLich, setSelectedLopForLich] = useState(null);
  const [selectedLopForThi, setSelectedLopForThi] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownData, setDropdownData] = useState({
    monHocs: [],
    giangViens: [],
    hocKys: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Helper để trích xuất mảng dữ liệu an toàn (Chống trang trắng)
      const getArray = (res) => {
        const payload = res?.data || res;
        if (Array.isArray(payload)) return payload;
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        return [];
      };

      const [resLops, resMons, resGVs, resHKs] = await Promise.all([
        axiosClient.get("/admin/lop-hoc-phan"),
        axiosClient.post("/admin/mon-hoc/list"),
        axiosClient.post("/admin/users/giang-vien/index"),
        axiosClient.get("/admin/hoc-ky"),
      ]);

      setLops(getArray(resLops));
      setDropdownData({
        monHocs: getArray(resMons),
        giangViens: getArray(resGVs),
        hocKys: getArray(resHKs),
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingLop) {
        await axiosClient.patch("/admin/lop-hoc-phan/update", data);
      } else {
        await axiosClient.post("/admin/lop-hoc-phan", data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Lỗi khi lưu lớp học phần";
      console.error("Chi tiết lỗi:", error.response?.data);
      alert(msg);
    }
  };

  const handleSaveLich = async (lichHoc) => {
    try {
      await axiosClient.post("/admin/lich-hoc/create", {
        LopHocPhanID: selectedLopForLich.LopHocPhanID, // Backend yêu cầu ID lớp để gắn lịch
        lich_hoc: lichHoc,
      });
      setIsLichModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lịch học:", error.response?.data);
      alert(error.response?.data?.error || "Lỗi khi lưu lịch học.");
    }
  };

  const handleSaveThi = async (lichThi) => {
    try {
      await axiosClient.post("/admin/lich-thi/create", {
        LopHocPhanID: selectedLopForThi.LopHocPhanID, // Backend yêu cầu ID lớp để gắn lịch thi
        lich_thi: lichThi,
      });
      setIsThiModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Lỗi khi lưu lịch thi. Có thể do trùng lịch phòng hoặc giảng viên.";
      alert(errorMsg);
    }
  };

  const filteredLops = lops.filter(
    (l) =>
      l.MaLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mon_hoc?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Lớp học phần
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý việc mở lớp, phân công giảng viên và sĩ số
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLop(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          + Mở Lớp học phần
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo mã lớp hoặc tên môn..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã LHP</th>
                <th className="px-6 py-4">Tên môn học</th>
                <th className="px-6 py-4">Giảng viên</th>
                <th className="px-6 py-4">Học kỳ</th>
                <th className="px-6 py-4 text-center">Sĩ số</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredLops.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Không tìm thấy lớp học phần nào.
                  </td>
                </tr>
              ) : (
                filteredLops.map((item) => (
                  <tr
                    key={item.LopHocPhanID}
                    className="hover:bg-blue-50/30 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {item.MaLopHP}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.mon_hoc?.TenMon}
                      <div className="text-[10px] text-gray-400 font-normal">
                        {item.mon_hoc?.MaMon}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.giang_vien?.HoTen || "Chưa phân công"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.hoc_ky?.TenHocKy}
                      <div className="text-[10px] text-gray-400">
                        {item.hoc_ky?.NamHoc}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-gray-800">
                        {item.SoLuongHienTai || 0}/{item.SoLuongToiDa}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{
                            width: `${Math.min(((item.SoLuongHienTai || 0) / item.SoLuongToiDa) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLopForThi(item);
                          setIsThiModalOpen(true);
                        }}
                        className="text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Lịch thi
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLopForLich(item);
                          setIsLichModalOpen(true);
                        }}
                        className="text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Lịch học
                      </button>
                      <button
                        onClick={() => {
                          setEditingLop(item);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LopHocPhanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingLop={editingLop}
        dropdownData={dropdownData}
      />

      <LichHocModal
        isOpen={isLichModalOpen}
        onClose={() => setIsLichModalOpen(false)}
        onSave={handleSaveLich}
        lopHocPhan={selectedLopForLich}
      />

      <LichThiModal
        isOpen={isThiModalOpen}
        onClose={() => setIsThiModalOpen(false)}
        onSave={handleSaveThi}
        lopHocPhan={selectedLopForThi}
      />
    </div>
  );
};

export default QuanLyLopHocPhan;
