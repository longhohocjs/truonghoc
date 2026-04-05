import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import MonHocModal from "./MonHocModal";

const MonHocManagement = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);

  const [filters, setFilters] = useState({
    KhoaID: "",
    search: "",
    per_page: 10,
    page: 1,
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const resKhoa = await axiosClient.post("/admin/khoa/list");
      setFaculties(resKhoa.data || resKhoa || []);
    } catch (error) {
      console.error("Lỗi tải danh sách khoa:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/admin/mon-hoc/list", filters);
      // response lúc này chính là object { status: 'success', data: ... }
      // do interceptor trong axios.js đã bóc tách response.data
      const result = response.data || response;

      if (result && result.data && Array.isArray(result.data)) {
        setMonHocs(result.data);
        setPagination({
          current_page: result.current_page || 1,
          last_page: result.last_page || 1,
          total: result.total || 0,
        });
      } else {
        const dataArray = Array.isArray(result) ? result : [];
        setMonHocs(dataArray);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: dataArray.length,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
      toast.error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedMonHoc(null);
    setIsModalOpen(true);
  };

  const handleEdit = (monHoc) => {
    setSelectedMonHoc(monHoc);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedMonHoc) {
        await axiosClient.patch("/admin/mon-hoc", {
          ...data,
          MonHocID: selectedMonHoc.MonHocID,
        });
        toast.success("Cập nhật môn học thành công");
      } else {
        await axiosClient.post("/admin/mon-hoc", data);
        toast.success("Thêm môn học thành công");
      }

      setIsModalOpen(false);
      // Reset bộ lọc về trang 1 và xóa tìm kiếm để thấy ngay môn vừa thêm (vì sắp xếp DESC)
      setFilters({
        ...filters,
        KhoaID: "",
        search: "",
        page: 1,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu môn học");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa môn học này?")) return;
    try {
      await axiosClient.delete(`/admin/mon-hoc/${id}`);
      toast.success("Xóa môn học thành công");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa môn học");
    }
  };

  const getPageNumbers = () => {
    const { current_page, last_page } = pagination;
    const pages = [];
    const delta = 2;

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
    return pages.filter((item, index) => pages.indexOf(item) === index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Môn học</h2>
          <p className="text-gray-500 text-sm">
            Thiết lập danh mục môn học, tín chỉ và điều kiện tiên quyết
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          + Thêm Môn học mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.KhoaID}
          onChange={(e) =>
            setFilters({ ...filters, KhoaID: e.target.value, page: 1 })
          }
        >
          <option value="">Tất cả Khoa quản lý</option>
          {faculties.map((f) => (
            <option key={f.KhoaID} value={f.KhoaID}>
              {f.TenKhoa}
            </option>
          ))}
        </select>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm theo mã môn hoặc tên môn..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
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
                <th className="px-6 py-4">Mã môn</th>
                <th className="px-6 py-4">Tên môn học</th>
                <th className="px-6 py-4 text-center">Tín chỉ</th>
                <th className="px-6 py-4">Khoa quản lý</th>
                <th className="px-6 py-4">Môn tiên quyết</th>
                <th className="px-6 py-4">Môn song hành</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : monHocs.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Không tìm thấy môn học nào phù hợp.
                  </td>
                </tr>
              ) : (
                monHocs.map((item) => (
                  <tr
                    key={item.MonHocID}
                    className="hover:bg-blue-50/30 transition-colors text-sm"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {item.MaMon}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.TenMon}
                    </td>
                    <td className="px-6 py-4 text-center">{item.SoTinChi}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.khoa?.TenKhoa || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.mon_tien_quyet?.length > 0 ? (
                          item.mon_tien_quyet.map((tq) => (
                            <span
                              key={tq.MaMon}
                              className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100"
                              title={tq.TenMon}
                            >
                              {tq.MaMon}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300 text-xs">
                            Không có
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.mon_song_hanh?.length > 0 ? (
                          item.mon_song_hanh.map((sh) => (
                            <span
                              key={sh.MaMon}
                              className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100"
                              title={sh.TenMon}
                            >
                              {sh.MaMon}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300 text-xs">
                            Không có
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.MonHocID)}
                        className="text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition-all"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination UI */}
      {!loading && pagination.last_page > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Hiển thị trang{" "}
            <span className="font-bold">{pagination.current_page}</span> /{" "}
            {pagination.last_page} ({pagination.total} môn học)
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.current_page === 1}
              onClick={() => setFilters({ ...filters, page: 1 })}
              className="p-2 rounded border bg-white disabled:opacity-50"
            >
              «
            </button>

            <button
              disabled={pagination.current_page === 1}
              onClick={() =>
                setFilters({ ...filters, page: pagination.current_page - 1 })
              }
              className="px-3 py-1 rounded border bg-white text-blue-600 disabled:opacity-50"
            >
              Trước
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => setFilters({ ...filters, page: page })}
                  className={`px-3 py-1 rounded border font-bold ${
                    pagination.current_page === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600"
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
              className="px-3 py-1 rounded border bg-white text-blue-600 disabled:opacity-50"
            >
              Sau
            </button>

            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() =>
                setFilters({ ...filters, page: pagination.last_page })
              }
              className="p-2 rounded border bg-white disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      )}

      <MonHocModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingMonHoc={selectedMonHoc}
        faculties={faculties}
        allMonHocs={monHocs} // Lưu ý: Ở trang 1 thì allMonHocs chỉ có 10 môn, nếu cần chọn môn tiên quyết từ tất cả, bạn nên fetch một list riêng không phân trang.
      />
    </div>
  );
};

export default MonHocManagement;
