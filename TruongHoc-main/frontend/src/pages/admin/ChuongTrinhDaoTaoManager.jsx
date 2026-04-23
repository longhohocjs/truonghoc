import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import ChuongTrinhImportModal from "./ChuongTrinhImportModal";
import ConfirmModal from "@/components/ConfirmModal";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Building2,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

const ChuongTrinhDaoTaoManager = () => {
  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [allMajors, setAllMajors] = useState([]); // New state for all majors
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState({
    isOpen: false,
    nganhId: null,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    KhoaID: "",
    NganhID: "",
    HocKyGoiY: "",
    search: "",
    per_page: 10, // Thiết lập 10 môn/trang để thấy nút chuyển trang khi có 15 môn
    page: 1,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [formData, setFormData] = useState({
    NganhID: "",
    MonHocID: "",
    KhoaID: "", // Add KhoaID to formData for modal
    HocKyGoiY: 1,
    BatBuoc: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [resKhoa, resMon, resAllNganh] = await Promise.all([
        // Fetch all majors
        axiosClient.post("/admin/khoa/list"),
        axiosClient.post("/admin/mon-hoc/list"),
        axiosClient.get("/admin/nganh/list"), // Assuming this endpoint exists
      ]);
      setFaculties(resKhoa.data || resKhoa || []);
      setSubjects(resMon.data || resMon || []);
      setAllMajors(resAllNganh.data?.data || resAllNganh.data || []); // Store all majors, assuming res.data.data
    } catch (error) {
      console.error("Lỗi tải dữ liệu ban đầu:", error);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/chuong-trinh-dao-tao", {
        params: filters,
      });

      // res.data là đối tượng Paginate từ Laravel (do Controller bọc trong key 'data')
      const result = res.data;

      if (result && result.data && Array.isArray(result.data)) {
        // Cấu trúc phân trang chuẩn của Laravel
        setPrograms(result.data);
        setPagination({
          current_page: result.current_page || 1,
          last_page: result.last_page || 1,
          total: result.total || 0,
        });
      } else {
        // Trường hợp fallback nếu API trả về mảng không phân trang
        const dataArray = Array.isArray(result) ? result : [];
        setPrograms(dataArray);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: dataArray.length,
        });
      }
    } catch (error) {
      toast.error("Không thể tải danh sách chương trình đào tạo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllByNganh = async () => {
    const nganhId = confirmDeleteAll.nganhId;
    if (!nganhId) return;

    try {
      await axiosClient.delete(`/admin/chuong-trinh-dao-tao/nganh/${nganhId}`);
      toast.success("Đã xóa toàn bộ chương trình đào tạo của ngành thành công");
      setConfirmDeleteAll({ isOpen: false, nganhId: null });
      fetchPrograms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa dữ liệu");
    }
  };

  const handleFacultyChange = async (khoaId) => {
    // This function is for the filter dropdown, so it should filter `majors` based on `KhoaID`
    setFilters({ ...filters, KhoaID: khoaId, NganhID: "" }); // Reset NganhID when KhoaID changes
    if (khoaId) {
      setMajors(allMajors.filter((major) => major.KhoaID == khoaId));
    } else {
      setMajors(allMajors); // Show all majors if no faculty filter is selected
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      NganhID: item.NganhID,
      MonHocID: item.MonHocID,
      HocKyGoiY: item.HocKyGoiY,
      KhoaID: item.nganh_dao_tao?.KhoaID || "", // Set KhoaID for editing
      BatBuoc: item.BatBuoc,
    });
    setShowModal(true);
  };

  // Hàm tạo dải số trang hiển thị (Logic rút gọn số trang)
  const getPageNumbers = () => {
    const { current_page, last_page } = pagination;
    const pages = [];
    const delta = 2; // Số lượng trang hiển thị xung quanh trang hiện tại

    for (let i = 1; i <= last_page; i++) {
      if (
        i === 1 ||
        i === last_page ||
        (i >= current_page - delta && i <= current_page + delta)
      ) {
        pages.push(i);
      } else if (
        (i === current_page - delta - 1 && i > 1) ||
        (i === current_page + delta + 1 && i < last_page)
      ) {
        pages.push("...");
      }
    }
    // Loại bỏ các dấu ... trùng lặp nếu có
    return pages.filter((item, index) => pages.indexOf(item) === index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Gọi API cập nhật (PATCH)
        await axiosClient.patch("/admin/chuong-trinh-dao-tao", {
          ...formData,
          ID: editingItem.ID,
        });
        toast.success("Cập nhật chương trình đào tạo thành công");
      } else {
        // Gọi API tạo mới (POST)
        await axiosClient.post("/admin/chuong-trinh-dao-tao", formData);
        toast.success("Thêm môn học vào chương trình thành công");
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({
        NganhID: "",
        MonHocID: "",
        KhoaID: "",
        HocKyGoiY: 1,
        BatBuoc: true,
      });

      // Reset toàn bộ bộ lọc để thấy môn vừa thêm ở đầu danh sách trang 1
      setFilters((prev) => ({
        ...prev, // Giữ lại per_page
        KhoaID: "",
        NganhID: "",
        HocKyGoiY: "",
        page: 1,
        search: "",
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa môn học này khỏi chương trình đào tạo?",
      )
    )
      return;
    try {
      await axiosClient.delete(`/admin/chuong-trinh-dao-tao/${id}`);
      toast.success("Xóa môn học khỏi chương trình thành công");
      fetchPrograms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa dữ liệu");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
      {/* Unified Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/40 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-50/30 rounded-full -mb-10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-100">
              <GraduationCap size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Chương trình đào tạo
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Quản lý khung chương trình, lộ trình học tập và định hướng ngành
                nghề
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
            >
              <FileSpreadsheet size={18} /> Import Excel
            </button>

            {filters.NganhID && (
              <button
                onClick={() =>
                  setConfirmDeleteAll({
                    isOpen: true,
                    nganhId: filters.NganhID,
                  })
                }
                className="flex items-center gap-2 bg-rose-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95"
              >
                <Trash2 size={18} /> Xóa sạch CTĐT
              </button>
            )}

            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  NganhID: "",
                  MonHocID: "",
                  KhoaID: "", // Add KhoaID to formData for modal
                  HocKyGoiY: 1,
                  BatBuoc: true,
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              <Plus size={18} /> Thêm môn vào CTĐT
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:flex-1">
          <div className="relative">
            <Building2
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-gray-600 appearance-none shadow-sm"
              value={filters.KhoaID}
              onChange={(e) => handleFacultyChange(e.target.value)}
            >
              <option value="">Tất cả Khoa</option>
              {faculties.map((f) => (
                <option key={f.KhoaID} value={f.KhoaID}>
                  {f.TenKhoa}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-gray-600 appearance-none shadow-sm"
              value={filters.NganhID}
              onChange={(e) =>
                setFilters({ ...filters, NganhID: e.target.value, page: 1 })
              }
            >
              <option value="">Tất cả Ngành</option>
              {majors.map((m) => (
                <option key={m.NganhID} value={m.NganhID}>
                  {m.TenNganh}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <BookOpenCheck
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-gray-600 appearance-none shadow-sm"
              value={filters.HocKyGoiY}
              onChange={(e) =>
                setFilters({ ...filters, HocKyGoiY: e.target.value, page: 1 })
              }
            >
              <option value="">Học kỳ gợi ý</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((hk) => (
                <option key={hk} value={hk}>
                  Học kỳ {hk}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm tên, mã môn học..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Ngành đào tạo</th>
                <th className="px-6 py-5">Môn học</th>
                <th className="px-6 py-5 text-center">Tín chỉ</th>
                <th className="px-6 py-5 text-center">HK Gợi ý</th>
                <th className="px-6 py-5 text-center">Tính chất</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-8 py-20 text-center text-gray-400 font-medium italic"
                  >
                    Không tìm thấy môn học nào trong CTĐT
                  </td>
                </tr>
              ) : (
                programs.map((item) => (
                  <tr
                    key={item.ID}
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-gray-900">
                        {item.nganh_dao_tao?.TenNganh}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {item.nganh_dao_tao?.khoa?.TenKhoa}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600">
                          {item.mon_hoc?.TenMon}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black">
                          {item.mon_hoc?.MaMon}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {item.mon_hoc?.SoTinChi} TC
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-gray-700 text-sm">
                      {item.HocKyGoiY}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge active={item.BatBuoc} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2.5 bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-gray-100"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.ID)}
                          className="p-2.5 bg-white text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-gray-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang UI */}
        {!loading && pagination.last_page > 1 && (
          <div className="px-8 py-6 bg-white border-t border-gray-100 flex flex-col sm:row justify-between items-center gap-4">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Trang{" "}
              <span className="text-indigo-600">{pagination.current_page}</span>{" "}
              / {pagination.last_page}
              <span className="ml-2 text-gray-300">
                ({pagination.total} môn học)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Nút Về trang đầu */}
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setFilters({ ...filters, page: 1 })}
                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                title="Trang đầu"
              >
                <span className="text-xs font-bold font-serif">«</span>
              </button>

              <button
                disabled={pagination.current_page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.current_page - 1 })
                }
                className="px-4 py-2 rounded-xl border border-gray-100 bg-white text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} className="inline mr-1" /> Trước
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="px-2 text-gray-300 font-bold"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => setFilters({ ...filters, page: page })}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      pagination.current_page === page
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                        : "bg-white text-gray-400 border-gray-100 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.current_page + 1 })
                }
                className="px-4 py-2 rounded-xl border border-gray-100 bg-white text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                Sau <ChevronRight size={16} className="inline ml-1" />
              </button>

              {/* Nút Tới trang cuối */}
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.last_page })
                }
                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
                title="Trang cuối"
              >
                <span className="text-xs font-bold font-serif">»</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm mới */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg space-y-8 shadow-2xl border border-gray-50"
          >
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {editingItem ? "Cập nhật CTĐT" : "Thêm môn học vào chương trình"}
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Lựa chọn Môn học
                </label>
                <select
                  required
                  disabled={!!editingItem} // Không cho đổi môn khi đang sửa
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.MonHocID}
                  onChange={(e) =>
                    setFormData({ ...formData, MonHocID: e.target.value })
                  }
                >
                  <option value="">-- Chọn môn học --</option>
                  {subjects.map((s) => (
                    <option key={s.MonHocID} value={s.MonHocID}>
                      {s.MaMon} - {s.TenMon}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Học kỳ đào tạo
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                    value={formData.HocKyGoiY}
                    onChange={(e) =>
                      setFormData({ ...formData, HocKyGoiY: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                    Tính chất học phần
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                    value={formData.BatBuoc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        BatBuoc: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Bắt buộc</option>
                    <option value="false">Tự chọn</option>
                  </select>
                </div>
              </div>

              {/* Lưu ý: NganhID cần lấy từ một danh sách ngành chuẩn */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Khoa quản lý
                </label>
                <select
                  required
                  disabled={!!editingItem}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.KhoaID}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      KhoaID: e.target.value,
                      NganhID: "",
                    }); // Reset NganhID when KhoaID changes
                  }}
                >
                  <option value="">-- Chọn Khoa --</option>
                  {faculties.map((f) => (
                    <option key={f.KhoaID} value={f.KhoaID}>
                      {f.TenKhoa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                  Ngành đào tạo áp dụng
                </label>
                <select
                  required
                  disabled={!!editingItem} // Không cho đổi ngành khi đang sửa
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.NganhID}
                  onChange={(e) =>
                    setFormData({ ...formData, NganhID: e.target.value })
                  }
                >
                  <option value="">-- Chọn ngành --</option>
                  {allMajors
                    .filter((m) => m.KhoaID == formData.KhoaID)
                    .map(
                      (
                        m, // Filter by selected Khoa in modal
                      ) => (
                        <option key={m.NganhID} value={m.NganhID}>
                          {m.TenNganh} ({m.MaNganh})
                        </option>
                      ),
                    )}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Lưu thiết lập
              </button>
            </div>
          </form>
        </div>
      )}

      <ChuongTrinhImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          fetchPrograms();
        }}
        nganhs={allMajors}
      />

      <ConfirmModal
        isOpen={confirmDeleteAll.isOpen}
        onClose={() => setConfirmDeleteAll({ isOpen: false, nganhId: null })}
        onConfirm={handleDeleteAllByNganh}
        title="Xóa toàn bộ chương trình đào tạo"
        message="Hành động này sẽ xóa sạch các môn học trong chương trình đào tạo của ngành này. Bạn có chắc chắn muốn tiếp tục?"
      />
    </div>
  );
};

const StatusBadge = ({ active }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
      active
        ? "bg-rose-50 text-rose-600 border-rose-100"
        : "bg-gray-50 text-gray-500 border-gray-100"
    }`}
  >
    <div
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-rose-500" : "bg-gray-400"}`}
    />
    <span className="text-[10px] font-black uppercase tracking-tight">
      {active ? "Bắt buộc" : "Tự chọn"}
    </span>
  </div>
);

export default ChuongTrinhDaoTaoManager;
