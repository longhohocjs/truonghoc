import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import LopHocPhanModal from "./LopHocPhanModal";
import LichHocModal from "./LichHocModal";
import LichThiModal from "./LichThiModal";
import ConfirmModal from "@/components/ConfirmModal";
import {
  School,
  Plus,
  Search,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    id: null,
  });
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
      const res = await axiosClient.post("/admin/lich-hoc/create", {
        LopHocPhanID: selectedLopForLich.LopHocPhanID, // Backend yêu cầu ID lớp để gắn lịch
        lich_hoc: lichHoc,
      });
      toast.success(res.message || "Cập nhật lịch học thành công");
      setIsLichModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lịch học:", error.response?.data);
      alert(error.response?.data?.error || "Lỗi khi lưu lịch học.");
    }
  };

  const handleSaveThi = async (lichThi) => {
    try {
      const res = await axiosClient.post("/admin/lich-thi/create", {
        LopHocPhanID: selectedLopForThi.LopHocPhanID, // Backend yêu cầu ID lớp để gắn lịch thi
        lich_thi: lichThi,
      });
      toast.success(res.message || "Cập nhật lịch thi thành công");
      setIsThiModalOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Lỗi khi lưu lịch thi. Có thể do trùng lịch phòng hoặc giảng viên.";
      alert(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axiosClient.delete(`/admin/lop-hoc-phan/${id}`);
      toast.success(res.message || "Xóa lớp học phần thành công");
      fetchData();
    } catch (error) {
      console.error("Lỗi khi xóa lớp:", error);
    }
  };

  const filteredLops = lops.filter(
    (l) =>
      l.MaLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.mon_hoc?.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
      {/* Unified Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/40 rounded-full -mr-20 -mt-20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-100">
              <School size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Quản lý Lớp học phần
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Điều phối kế hoạch giảng dạy, phân công nhân sự và quản lý sĩ số
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingLop(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            <Plus size={18} /> Mở Lớp học phần
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm mã lớp, tên môn..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {filteredLops.length} Lớp đang mở
            </span>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Định danh Lớp</th>
                <th className="px-6 py-5">Học phần / Giảng viên</th>
                <th className="px-6 py-5">Học kỳ</th>
                <th className="px-6 py-5 text-center">Tình trạng Sĩ số</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredLops.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-20 text-center text-gray-400 italic"
                  >
                    Không tìm thấy lớp học phần nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredLops.map((item) => (
                  <tr
                    key={item.LopHocPhanID}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit">
                          {item.MaLopHP}
                        </span>
                        <div className="flex gap-2">
                          {item.lich_hoc?.length > 0 ? (
                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                              <CheckCircle2 size={10} /> Đã có lịch
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                              <Clock size={10} /> Trống lịch
                            </span>
                          )}
                          {item.lich_thi_details?.length > 0 ? (
                            <span className="flex items-center gap-1 text-[9px] font-black text-purple-500 uppercase tracking-tighter">
                              <CheckCircle2 size={10} /> Đã có thi
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                              <Calendar size={10} /> Trống thi
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900 leading-none">
                          {item.mon_hoc?.TenMon}
                        </p>
                        <p className="text-xs font-bold text-gray-500">
                          {item.giang_vien?.HoTen ||
                            "Chưa phân công giảng viên"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-gray-600">
                        {item.hoc_ky?.TenHocKy}
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                          {item.hoc_ky?.nam_hoc?.TenNamHoc}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-xs font-black text-gray-700">
                          {item.SoLuongHienTai || 0} / {item.SoLuongToiDa} SV
                        </span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                          <div
                            className={`h-full transition-all duration-500 ${item.SoLuongHienTai / item.SoLuongToiDa > 0.9 ? "bg-rose-500" : "bg-indigo-500"}`}
                            style={{
                              width: `${Math.min(((item.SoLuongHienTai || 0) / item.SoLuongToiDa) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <ActionButton
                          icon={<Calendar size={14} />}
                          onClick={() => {
                            setSelectedLopForThi(item);
                            setIsThiModalOpen(true);
                          }}
                          tooltip="Xếp lịch thi"
                          variant="warning"
                        />
                        <ActionButton
                          icon={<Clock size={14} />}
                          onClick={() => {
                            setSelectedLopForLich(item);
                            setIsLichModalOpen(true);
                          }}
                          tooltip="Xếp lịch học"
                          variant="warning"
                        />
                        <ActionButton
                          icon={<Pencil size={14} />}
                          onClick={() => {
                            setEditingLop(item);
                            setIsModalOpen(true);
                          }}
                          tooltip="Chỉnh sửa"
                        />
                        <ActionButton
                          icon={<Trash2 size={14} />}
                          onClick={() =>
                            setConfirmConfig({
                              isOpen: true,
                              id: item.LopHocPhanID,
                            })
                          }
                          tooltip="Xóa lớp"
                          variant="danger"
                        />
                      </div>
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(confirmConfig.id)}
        title="Xóa lớp học phần"
        message="Bạn có chắc chắn muốn xóa lớp học phần này? Hệ thống sẽ ngăn chặn việc xóa nếu đã có sinh viên đăng ký học."
      />
    </div>
  );
};

const ActionButton = ({ icon, onClick, variant = "default", tooltip }) => {
  const variants = {
    default:
      "bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border-gray-100",
    danger:
      "bg-white text-gray-400 hover:text-rose-600 hover:bg-rose-50 border-gray-100",
    warning:
      "bg-white text-gray-400 hover:text-amber-600 hover:bg-amber-50 border-gray-100",
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2.5 rounded-xl border transition-all shadow-sm active:scale-90 ${variants[variant]}`}
    >
      {icon}
    </button>
  );
};

export default QuanLyLopHocPhan;
