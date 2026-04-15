import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axios";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ClipboardList,
  ShoppingCart,
  BookOpen,
  Layers,
  Info,
  Trash2,
  Clock,
} from "lucide-react";

const DangKyHocPhan = () => {
  const [lops, setLops] = useState([]);
  const [daDangKy, setDaDangKy] = useState([]);
  const [hocKy, setHocKy] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // ID lớp đang đợi xử lý queue
  const [message, setMessage] = useState({ type: "", content: "" });
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    id: null,
  });

  // Hàm tiện ích lấy Thứ từ ngày học
  const getThuLabel = (lich) => {
    if (lich.Thu) return `Thứ ${lich.Thu}`;
    if (lich.NgayHoc) {
      const date = new Date(lich.NgayHoc);
      const day = date.getDay(); // 0: CN, 1: T2...
      if (day === 0) return "Chủ Nhật";
      return `Thứ ${day + 1}`;
    }
    return "N/A";
  };

  // Lấy danh sách lớp mở và lớp đã đăng ký
  const fetchData = useCallback(async () => {
    try {
      const [resLopMo, resDaDangKy] = await Promise.all([
        axiosClient.get("/sinh-vien/lop-mo"),
        axiosClient.get("/sinh-vien/da-dang-ky"),
      ]);

      // Giả định resLopMo là array trực tiếp hoặc { data: [] } tùy controller
      setLops(Array.isArray(resLopMo) ? resLopMo : resLopMo.data || []);

      // Trích xuất dữ liệu đã đăng ký từ wrapper { success, data: { data: [], hoc_ky: '' } }
      const payload = resDaDangKy?.data || resDaDangKy;
      const enrolledData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setDaDangKy(enrolledData);
      setHocKy(payload?.hoc_ky || "Học kỳ hiện tại");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Không thể tải danh sách học phần.";
      console.error("Lỗi tải dữ liệu:", errorMsg);
      showMsg("error", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMsg = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: "", content: "" }), 5000);
  };

  // Hàm kiểm tra trạng thái từ Redis (Polling)
  const checkRegistrationStatus = async (lhpID) => {
    try {
      const res = await axiosClient.get(`/sinh-vien/check-status/${lhpID}`);
      if (res.status === "success") {
        showMsg("success", res.message);
        setProcessingId(null);
        fetchData(); // Reload danh sách
      } else if (res.status === "failed") {
        showMsg("error", res.message);
        setProcessingId(null);
      } else {
        // Tiếp tục polling sau 2 giây nếu vẫn đang processing
        setTimeout(() => checkRegistrationStatus(lhpID), 2000);
      }
    } catch (error) {
      setProcessingId(null);
    }
  };

  const handleDangKy = async (lhpID) => {
    setProcessingId(lhpID);
    try {
      const res = await axiosClient.post("/sinh-vien/dang-ky", {
        LopHocPhanID: lhpID,
      });
      if (res.status === "processing") {
        showMsg("info", res.message);
        checkRegistrationStatus(lhpID);
      } else {
        showMsg("error", res.message || "Đăng ký thất bại");
        setProcessingId(null);
      }
    } catch (error) {
      showMsg("error", error.response?.data?.message || "Lỗi hệ thống");
      setProcessingId(null);
    }
  };

  const handleHuyMon = async (dangKyID) => {
    try {
      const res = await axiosClient.post(`/sinh-vien/huy-mon/${dangKyID}`);
      const msg = res.message || res.data?.message || "Hủy môn thành công";
      showMsg("success", msg);
      fetchData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Không thể hủy môn học lúc này.";
      showMsg("error", errorMsg);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu đăng ký...</div>;

  return (
    <div className="space-y-8">
      {/* Thông báo */}
      {message.content && (
        <div
          className={`fixed top-20 right-8 z-50 p-4 rounded-lg shadow-lg border-l-4 transition-all ${
            message.type === "success"
              ? "bg-green-50 border-green-500 text-green-700"
              : message.type === "info"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      <section>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Đăng ký học phần mở
            </h2>
            <p className="text-gray-500 text-sm">
              Chọn các lớp học phần có sẵn trong học kỳ hiện tại
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-500">
              Đợt đăng ký:
            </span>
            <div className="text-blue-600 font-bold">{hocKy || "Đang mở"}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Mã Lớp HP</th>
                <th className="px-6 py-4">Tên Môn Học</th>
                <th className="px-6 py-4">Tín chỉ</th>
                <th className="px-6 py-4">Tiên quyết</th>
                <th className="px-6 py-4">Song hành</th>
                <th className="px-6 py-4">Giảng viên</th>
                <th className="px-6 py-4">Lịch học</th>
                <th className="px-6 py-4">Sĩ số</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lops.map((lop) => (
                <tr key={lop.LopHocPhanID} className="hover:bg-gray-50 text-sm">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {lop.MaLopHP || lop.ma_lop_hp}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {lop.mon_hoc?.TenMon || lop.mon_hoc?.ten_mon}
                  </td>
                  <td className="px-6 py-4">
                    {lop.mon_hoc?.SoTinChi || lop.mon_hoc?.so_tin_chi}
                  </td>
                  <td
                    className="px-6 py-4 text-[10px] text-red-600 italic font-medium max-w-[120px] truncate"
                    title={lop.MonTienQuyet}
                  >
                    {lop.MonTienQuyet || "Không có"}
                  </td>
                  <td
                    className="px-6 py-4 text-[10px] text-purple-600 italic font-medium max-w-[120px] truncate"
                    title={lop.MonSongHanh}
                  >
                    {lop.MonSongHanh || "Không có"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {lop.giang_vien?.HoTen ||
                      lop.giang_vien?.ho_ten ||
                      "Chưa phân công"}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {/* Lấy duy nhất lịch học theo thứ để tránh lặp lại các tuần */}
                    {[
                      ...new Map(
                        lop.lich_hoc?.map((item) => [getThuLabel(item), item]),
                      ).values(),
                    ].map((lh, i) => (
                      <div key={i}>
                        {getThuLabel(lh)}: T{lh.TietBatDau || lh.tiet_bat_dau}-
                        {(lh.TietBatDau || lh.tiet_bat_dau) +
                          (lh.SoTiet || lh.so_tiet) -
                          1}
                        {lh.PhongHoc || lh.phong_hoc
                          ? ` - P.${lh.PhongHoc || lh.phong_hoc}`
                          : ""}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-24">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                        <span>
                          {lop.SoLuongHienTai || 0}/{lop.SoLuongToiDa}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${(lop.SoLuongHienTai || 0) / lop.SoLuongToiDa > 0.9 ? "bg-rose-500" : "bg-blue-500"}`}
                          style={{
                            width: `${((lop.SoLuongHienTai || 0) / lop.SoLuongToiDa) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      disabled={
                        processingId === lop.LopHocPhanID ||
                        daDangKy.some(
                          (d) => d.LopHocPhanID === lop.LopHocPhanID,
                        )
                      }
                      onClick={() => handleDangKy(lop.LopHocPhanID)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                        daDangKy.some(
                          (d) => d.LopHocPhanID === lop.LopHocPhanID,
                        )
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed"
                          : processingId === lop.LopHocPhanID
                            ? "bg-blue-100 text-blue-400 cursor-wait animate-pulse"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95"
                      }`}
                    >
                      {processingId === lop.LopHocPhanID
                        ? "Đang xử lý..."
                        : daDangKy.some(
                              (d) => d.LopHocPhanID === lop.LopHocPhanID,
                            )
                          ? "Đã chọn"
                          : "Đăng ký"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="bg-green-500 w-2 h-6 rounded mr-3"></span>
          Kết quả đăng ký
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-green-50 text-green-700 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Mã Môn</th>
                <th className="px-6 py-4">Tên Môn</th>
                <th className="px-6 py-4 text-center">Tín chỉ</th>
                <th className="px-6 py-4 text-center">Học phí</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daDangKy.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Bạn chưa đăng ký môn học nào.
                  </td>
                </tr>
              ) : (
                daDangKy.map((item, index) => (
                  <tr
                    key={item.DangKyID}
                    className="group hover:bg-emerald-50/20 transition-all"
                  >
                    <td className="px-6 py-5 text-gray-500 text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-5 font-bold text-emerald-600 text-sm">
                      {item.lop_hoc_phan?.mon_hoc?.MaMon}
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-800 text-sm">
                      {item.lop_hoc_phan?.mon_hoc?.TenMon}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-gray-600 text-sm">
                      {item.lop_hoc_phan?.mon_hoc?.SoTinChi}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-gray-500 text-xs">
                      {(
                        item.lop_hoc_phan?.mon_hoc?.SoTinChi * 500000
                      ).toLocaleString()}{" "}
                      VNĐ
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() =>
                          setConfirmConfig({
                            isOpen: true,
                            id: item.DangKyID,
                          })
                        }
                        className="text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase flex items-center gap-1 ml-auto group-hover:scale-105 transition-all"
                      >
                        <Trash2 size={12} /> Hủy môn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50/50 border-t border-emerald-100 flex flex-col md:flex-row justify-end items-center gap-6">
            <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              Tổng tín chỉ chọn:{" "}
              <span className="text-indigo-600 text-lg font-black ml-2">
                {daDangKy.reduce(
                  (sum, item) =>
                    sum + (item.lop_hoc_phan?.mon_hoc?.SoTinChi || 0),
                  0,
                )}
              </span>
            </div>
            <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              Tổng học phí:{" "}
              <span className="text-rose-600 text-lg font-black ml-2">
                {(
                  daDangKy.reduce(
                    (sum, item) =>
                      sum + (item.lop_hoc_phan?.mon_hoc?.SoTinChi || 0),
                    0,
                  ) * 500000
                ).toLocaleString()}{" "}
                VNĐ
              </span>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={() => handleHuyMon(confirmConfig.id)}
        title="Hủy học phần"
        message="Bạn có chắc chắn muốn hủy đăng ký học phần này? Chỗ trống sẽ ngay lập tức được dành cho sinh viên khác."
      />
    </div>
  );
};

export default DangKyHocPhan;
