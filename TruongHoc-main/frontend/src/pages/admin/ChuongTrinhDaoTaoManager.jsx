import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const ChuongTrinhDaoTaoManager = () => {
  const [programs, setPrograms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [allMajors, setAllMajors] = useState([]); // New state for all majors
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Chương trình đào tạo
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              NganhID: "",
              MonHocID: "",
              KhoaID: "", // Reset KhoaID for new item
              HocKyGoiY: 1,
              BatBuoc: true,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          + Thêm môn vào CTĐT
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.KhoaID}
          onChange={(e) =>
            setFilters({
              ...filters,
              KhoaID: e.target.value,
              NganhID: "",
              page: 1,
            })
          }
        >
          <option value="">Tất cả Khoa</option>
          {faculties.map((f) => (
            <option key={f.KhoaID} value={f.KhoaID}>
              {f.TenKhoa}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.NganhID}
          onChange={(e) =>
            setFilters({ ...filters, NganhID: e.target.value, page: 1 })
          }
        >
          <option value="">Tất cả Ngành</option>
          {majors.map(
            (
              m, // Use filtered majors for the filter dropdown
            ) => (
              <option key={m.NganhID} value={m.NganhID}>
                {m.TenNganh}
              </option>
            ),
          )}
        </select>

        <input
          type="number"
          placeholder="Học kỳ gợi ý..."
          className="border rounded-lg p-2 outline-none"
          value={filters.HocKyGoiY}
          onChange={(e) =>
            setFilters({ ...filters, HocKyGoiY: e.target.value, page: 1 })
          }
        />

        <input
          type="text"
          placeholder="Tìm tên môn, mã môn..."
          className="border rounded-lg p-2 outline-none md:col-span-2"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Ngành đào tạo</th>
              <th className="px-6 py-4">Môn học</th>
              <th className="px-6 py-4 text-center">Tín chỉ</th>
              <th className="px-6 py-4 text-center">HK Gợi ý</th>
              <th className="px-6 py-4 text-center">Bắt buộc</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-400">
                  Không tìm thấy môn học nào trong CTĐT
                </td>
              </tr>
            ) : (
              programs.map((item) => (
                <tr
                  key={item.ID}
                  className="hover:bg-gray-50 transition-colors text-sm"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">
                      {item.nganh_dao_tao?.TenNganh}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.nganh_dao_tao?.khoa?.TenKhoa}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-blue-600">
                      {item.mon_hoc?.TenMon}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.mon_hoc?.MaMon}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.mon_hoc?.SoTinChi}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">
                    {item.HocKyGoiY}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.BatBuoc ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">
                        Tự chọn
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase transition-all"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.ID)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase transition-all"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Phân trang UI */}
        {!loading && pagination.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Hiển thị trang{" "}
              <span className="font-bold text-gray-700">
                {pagination.current_page}
              </span>{" "}
              trên tổng số{" "}
              <span className="font-bold text-gray-700">
                {pagination.last_page}
              </span>{" "}
              trang
              <span className="ml-1 text-gray-400">
                ({pagination.total} môn học)
              </span>
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              {/* Nút Về trang đầu */}
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setFilters({ ...filters, page: 1 })}
                className="p-2 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang đầu"
              >
                <span className="text-xs font-bold">«</span>
              </button>

              <button
                disabled={pagination.current_page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.current_page - 1 })
                }
                className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Trước
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`dots-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => setFilters({ ...filters, page: page })}
                    className={`px-3 py-1 rounded border text-sm font-bold transition-all ${
                      pagination.current_page === page
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
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
                className="px-3 py-1 rounded border bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Sau
              </button>

              {/* Nút Tới trang cuối */}
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.last_page })
                }
                className="p-2 rounded border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Trang cuối"
              >
                <span className="text-xs font-bold">»</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal thêm mới */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Chỉnh sửa CTĐT" : "Thêm môn vào CTĐT"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Môn học
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Học kỳ gợi ý
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tính chất
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
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Khoa
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
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ngành đào tạo
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

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  Lưu thiết lập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChuongTrinhDaoTaoManager;
