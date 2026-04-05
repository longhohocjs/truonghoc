import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";

const NamHocHocKy = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYear, setNewYear] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/admin/hoc-ky");

      // Trích xuất mảng dữ liệu (hỗ trợ cả khi response là {data: []} hoặc trực tiếp [])
      const rawData =
        response?.data || (Array.isArray(response) ? response : []);

      // Chuyển đổi dữ liệu phẳng (Học kỳ) thành cấu trúc nhóm theo Năm học
      const groupedYears = rawData.reduce((acc, hk) => {
        const year = hk.nam_hoc; // Object năm học đi kèm học kỳ
        if (!year) return acc;

        if (!acc[year.NamHocID]) {
          acc[year.NamHocID] = {
            ...year,
            HocKy: [],
          };
        }
        acc[year.NamHocID].HocKy.push(hk);
        return acc;
      }, {});

      setAcademicYears(Object.values(groupedYears));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu năm học:", error);
      // Dữ liệu mẫu để minh họa giao diện
      setAcademicYears([
        {
          id: 1,
          nam_hoc: "2023-2024",
          hoc_ky: [
            { id: 1, ten_hoc_ky: "Học kỳ 1", trang_thai: "Đã kết thúc" },
            { id: 2, ten_hoc_ky: "Học kỳ 2", trang_thai: "Đang diễn ra" },
            { id: 3, ten_hoc_ky: "Học kỳ hè", trang_thai: "Sắp mở" },
          ],
        },
        {
          id: 2,
          nam_hoc: "2024-2025",
          hoc_ky: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddYear = async () => {
    if (!newYear) return;
    try {
      await axiosClient.post("/admin/nam-hoc", { TenNamHoc: newYear });
      setIsAddingYear(false);
      setNewYear("");
      fetchData();
    } catch (error) {
      console.error("Lỗi thêm năm học:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quản lý Năm học & Học kỳ
          </h2>
          <p className="text-gray-500 text-sm">
            Thiết lập cấu trúc thời gian đào tạo cho hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsAddingYear(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          + Thêm Năm học mới
        </button>
      </div>

      {isAddingYear && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 animate-fadeIn">
          <input
            type="text"
            placeholder="VD: 2025-2026"
            className="px-4 py-2 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
          />
          <button
            onClick={handleAddYear}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm"
          >
            Lưu
          </button>
          <button
            onClick={() => setIsAddingYear(false)}
            className="text-gray-500 font-bold text-sm"
          >
            Hủy
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {academicYears.map((year) => (
            <div
              key={year.NamHocID || year.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-700 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Năm học: {year.TenNamHoc || year.nam_hoc}
                </h3>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-xs font-bold uppercase transition-all">
                    Thêm Học kỳ
                  </button>
                  <button className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-xs font-bold uppercase transition-all">
                    Xóa Năm học
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Hiển thị danh sách học kỳ đã được nhóm */}
                {year.HocKy && year.HocKy.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {year.HocKy.map((hk) => (
                      <div
                        key={hk.HocKyID || hk.id}
                        className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-200 transition-all group relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-bold text-gray-800">
                            {hk.TenHocKy || hk.ten_hoc_ky}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              (hk.trang_thai || hk.TrangThai) ===
                                "Đang diễn ra" || hk.TrangThai === 1
                                ? "bg-green-100 text-green-600"
                                : (hk.trang_thai || hk.TrangThai) ===
                                      "Đã kết thúc" || hk.TrangThai === 0
                                  ? "bg-gray-200 text-gray-600"
                                  : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {hk.trang_thai ||
                              (hk.TrangThai === 1
                                ? "Đang diễn ra"
                                : "Đã kết thúc")}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[10px] font-bold text-blue-600 uppercase">
                            Sửa
                          </button>
                          <button className="text-[10px] font-bold text-red-500 uppercase">
                            Xóa
                          </button>
                          <button className="text-[10px] font-bold text-indigo-600 uppercase ml-auto">
                            Kích hoạt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 italic text-sm">
                    Chưa có học kỳ nào được thiết lập cho năm học này.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
        <h4 className="text-indigo-800 font-bold mb-2 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Lưu ý cho Quản trị viên
        </h4>
        <ul className="text-sm text-indigo-600 space-y-1 list-disc list-inside">
          <li>
            Chỉ nên có duy nhất <strong>một</strong> học kỳ ở trạng thái "Đang
            diễn ra" trên toàn hệ thống.
          </li>
          <li>
            Khi kích hoạt học kỳ mới, các học kỳ cũ sẽ tự động được chuyển sang
            trạng thái lưu trữ.
          </li>
          <li>
            Việc xóa năm học sẽ ảnh hưởng đến các lớp học phần và lịch thi liên
            quan.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NamHocHocKy;
