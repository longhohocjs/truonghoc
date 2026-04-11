import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";

const DiemManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hocphan"); // 'hocphan' hoặc 'renluyen'
  const [lops, setLops] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [lopsSH, setLopsSH] = useState([]);
  const [drlStudents, setDrlStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingDRL, setSavingDRL] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersDRL, setFiltersDRL] = useState({
    HocKyID: "",
    LopSinhHoatID: "",
  });

  // Helper để trích xuất mảng dữ liệu linh hoạt
  const getArray = (res) => {
    const payload = res?.data || res;
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchLopHocPhan = async () => {
    setLoading(true);
    try {
      // Sử dụng API lấy danh sách lớp học phần để quản lý điểm
      const res = await axiosClient.post("/admin/diem-so/danh-sach-lop-hp");
      setLops(getArray(res));
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDRLData = async () => {
    if (!filtersDRL.HocKyID) return;
    setLoading(true);
    try {
      const res = await axiosClient.post(
        "/admin/diem-so/danh-sach-ren-luyen",
        filtersDRL,
      );
      const data = getArray(res);
      // Debug: Xem cấu hình dữ liệu thực tế từ API
      console.log("Dữ liệu điểm rèn luyện nhận về:", data);
      setDrlStudents(data);
    } catch (error) {
      console.error("Lỗi khi tải điểm rèn luyện:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [resHK, resLop] = await Promise.all([
        axiosClient.get("/admin/hoc-ky"),
        axiosClient.post("/admin/lop-sinh-hoat/danh-sach"),
      ]);
      const listHK = getArray(resHK);
      setHocKys(listHK);
      setLopsSH(getArray(resLop));

      if (listHK.length > 0) {
        setFiltersDRL((prev) => ({ ...prev, HocKyID: listHK[0].HocKyID }));
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu dropdown:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "hocphan") {
      fetchLopHocPhan();
    } else {
      if (hocKys.length === 0) fetchDropdowns();
      else fetchDRLData();
    }
  }, [activeTab, filtersDRL]);

  const getXepLoai = (diem) => {
    const d = parseFloat(diem);
    if (isNaN(d)) return "";
    if (d >= 90) return "XuatSac";
    if (d >= 80) return "Gioi";
    if (d >= 65) return "Kha";
    if (d >= 50) return "TrungBinh";
    if (d >= 35) return "Yeu";
    return "Kem";
  };

  const getXepLoaiLabel = (code) => {
    const map = {
      XuatSac: "Xuất sắc",
      Gioi: "Giỏi",
      Kha: "Khá",
      TrungBinh: "Trung bình",
      Yeu: "Yếu",
      Kem: "Kém",
      // Fallback cho dữ liệu tiếng Việt từ database của bạn
      Tốt: "Tốt",
      Khá: "Khá",
      Tot: "Tốt",
    };
    return map[code] || code || "Chưa xếp loại";
  };

  const handleDRLChange = (studentID, value) => {
    setDrlStudents((prev) =>
      prev.map((s) => {
        if (s.SinhVienID === studentID) {
          const val = value === "" ? "" : Math.min(100, Math.max(0, value));
          return { ...s, TongDiem: val, XepLoai: getXepLoai(val) };
        }
        return s;
      }),
    );
  };

  const handleSaveDRL = async () => {
    if (!filtersDRL.HocKyID) return;
    setSavingDRL(true);
    try {
      await axiosClient.post("/admin/diem-so/nhap-diem-ren-luyen", {
        HocKyID: filtersDRL.HocKyID,
        DanhSachDRL: drlStudents.map((s) => ({
          SinhVienID: s.SinhVienID,
          TongDiem: s.TongDiem || 0,
          XepLoai: s.XepLoai || "Kem",
        })),
      });
      toast.success("Cập nhật điểm rèn luyện thành công");
      fetchDRLData();
    } catch (error) {
      toast.error("Lỗi khi lưu điểm rèn luyện");
    } finally {
      setSavingDRL(false);
    }
  };

  const filteredLops = lops.filter(
    (l) =>
      l.MaLopHP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.TenMon?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Lọc lấy danh sách lớp duy nhất để không bị lặp lại trên giao diện
  const uniqueLops = React.useMemo(() => {
    return Array.from(
      new Map(filteredLops.map((item) => [item.LopHocPhanID, item])).values(),
    );
  }, [filteredLops]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Điểm số</h2>
        <p className="text-gray-500 text-sm">
          Chọn lớp học phần để quản lý bảng điểm
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-8 py-3 font-bold text-sm transition-all ${activeTab === "hocphan" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("hocphan")}
        >
          ĐIỂM HỌC PHẦN
        </button>
        <button
          className={`px-8 py-3 font-bold text-sm transition-all ${activeTab === "renluyen" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("renluyen")}
        >
          ĐIỂM RÈN LUYỆN
        </button>
      </div>

      {activeTab === "hocphan" ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <input
              type="text"
              placeholder="Tìm theo mã lớp hoặc tên môn..."
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mã LHP</th>
                  <th className="px-6 py-4">Môn học</th>
                  <th className="px-6 py-4">Tiên quyết</th>
                  <th className="px-6 py-4">Song hành</th>
                  <th className="px-6 py-4">Giảng viên</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : uniqueLops.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">
                      Không tìm thấy lớp nào.
                    </td>
                  </tr>
                ) : (
                  uniqueLops.map((lop, index) => (
                    <tr
                      key={`${lop.LopHocPhanID}-${index}`}
                      className="hover:bg-gray-50 transition-colors text-sm"
                    >
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {lop.MaLopHP}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {lop.TenMon}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {lop.TenHocKy}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-[11px] text-gray-500 italic max-w-[150px] truncate"
                        title={lop.MonTienQuyet}
                      >
                        {lop.MonTienQuyet || "Không có"}
                      </td>
                      <td
                        className="px-6 py-4 text-[11px] text-gray-500 italic max-w-[150px] truncate"
                        title={lop.MonSongHanh}
                      >
                        {lop.MonSongHanh || "Không có"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {lop.HoTenGV || "Chưa phân công"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {Number(lop.IsLocked) === 1 ||
                        Number(lop.is_locked) === 1 ||
                        Number(lop.TrangThaiNhapDiem) === 1 ? (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold">
                            ĐÃ KHÓA
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold">
                            MỞ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/admin/diem-so/${lop.LopHocPhanID}`)
                          }
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                        >
                          VÀO ĐIỂM
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Filters for DRL */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Học kỳ xét điểm
              </label>
              <select
                className="w-full p-2 border rounded-lg text-sm"
                value={filtersDRL.HocKyID}
                onChange={(e) =>
                  setFiltersDRL({ ...filtersDRL, HocKyID: e.target.value })
                }
              >
                {hocKys.map((hk) => (
                  <option key={hk.HocKyID} value={hk.HocKyID}>
                    {hk.TenHocKy} - {hk.nam_hoc?.TenNamHoc}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Lớp sinh hoạt
              </label>
              <select
                className="w-full p-2 border rounded-lg text-sm"
                value={filtersDRL.LopSinhHoatID}
                onChange={(e) =>
                  setFiltersDRL({
                    ...filtersDRL,
                    LopSinhHoatID: e.target.value,
                  })
                }
              >
                <option value="">-- Tất cả sinh viên --</option>
                {lopsSH.map((l) => (
                  <option key={l.LopSinhHoatID} value={l.LopSinhHoatID}>
                    {l.MaLop} - {l.TenLop}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveDRL}
                disabled={savingDRL || drlStudents.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:bg-gray-300"
              >
                {savingDRL ? "Đang lưu..." : "LƯU TẤT CẢ"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sinh viên</th>
                  <th className="px-6 py-4 text-center w-40">
                    Tổng điểm (0-100)
                  </th>
                  <th className="px-6 py-4 text-center">Xếp loại</th>
                  <th className="px-6 py-4 text-center">Ngày cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-400">
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : drlStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-400">
                      Vui lòng chọn Học kỳ để xem danh sách.
                    </td>
                  </tr>
                ) : (
                  drlStudents.map((sv) => (
                    <tr
                      key={sv.SinhVienID}
                      className="hover:bg-gray-50 text-sm"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">
                          {sv.HoTen || sv.ho_ten}
                        </div>
                        <div className="text-xs text-gray-400">
                          {sv.MaSV || sv.ma_sv}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          className="w-full p-2 border border-gray-200 rounded text-center font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500"
                          value={sv.TongDiem ?? ""}
                          onChange={(e) =>
                            handleDRLChange(sv.SinhVienID, e.target.value)
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            sv.XepLoai === "XuatSac"
                              ? "bg-purple-100 text-purple-600"
                              : sv.XepLoai === "Gioi"
                                ? "bg-blue-100 text-blue-600"
                                : sv.XepLoai === "Kha"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {getXepLoaiLabel(sv.XepLoai)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400 text-xs">
                        {sv.NgayDanhGia
                          ? new Date(sv.NgayDanhGia).toLocaleDateString("vi-VN")
                          : "Chưa chấm"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiemManagement;
