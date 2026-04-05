import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axios";

const DangKyHocPhan = () => {
  const [lops, setLops] = useState([]);
  const [daDangKy, setDaDangKy] = useState([]);
  const [hocKy, setHocKy] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // ID lớp đang đợi xử lý queue
  const [message, setMessage] = useState({ type: "", content: "" });

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
      console.error("Lỗi tải dữ liệu:", error);
      showMsg("error", "Không thể tải danh sách học phần.");
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
    if (!window.confirm("Bạn có chắc chắn muốn hủy học phần này?")) return;
    try {
      const res = await axiosClient.post(`/sinh-vien/huy-mon/${dangKyID}`);
      showMsg("success", res.message);
      fetchData();
    } catch (error) {
      showMsg("error", "Không thể hủy môn học.");
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
                    {lop.MaLopHP}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {lop.mon_hoc?.TenMon}
                  </td>
                  <td className="px-6 py-4">{lop.mon_hoc?.SoTinChi}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {lop.giang_vien?.HoTen}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {lop.lich_hoc?.map((lh, i) => (
                      <div key={i}>
                        Thứ {lh.Thu}: T{lh.TietBatDau}-
                        {lh.TietBatDau + lh.SoTiet - 1}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">
                      {lop.SoLuongHienTai || 0}/{lop.SoLuongToiDa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={
                        processingId === lop.LopHocPhanID ||
                        daDangKy.some(
                          (d) => d.LopHocPhanID === lop.LopHocPhanID,
                        )
                      }
                      onClick={() => handleDangKy(lop.LopHocPhanID)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        daDangKy.some(
                          (d) => d.LopHocPhanID === lop.LopHocPhanID,
                        )
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : processingId === lop.LopHocPhanID
                            ? "bg-blue-200 text-white cursor-wait"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
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
          Kết quả đăng ký (Giỏ hàng)
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-green-50 text-green-700 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Mã Lớp</th>
                <th className="px-6 py-4">Tên Môn</th>
                <th className="px-6 py-4">Tín chỉ</th>
                <th className="px-6 py-4">Học phí (tạm tính)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daDangKy.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    Bạn chưa đăng ký môn học nào.
                  </td>
                </tr>
              ) : (
                daDangKy.map((item, index) => (
                  <tr key={item.DangKyID} className="text-sm">
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-bold">
                      {item.lop_hoc_phan?.MaLopHP}
                    </td>
                    <td className="px-6 py-4">
                      {item.lop_hoc_phan?.mon_hoc?.TenMon}
                    </td>
                    <td className="px-6 py-4">
                      {item.lop_hoc_phan?.mon_hoc?.SoTinChi}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {(
                        item.lop_hoc_phan?.mon_hoc?.SoTinChi * 500000
                      ).toLocaleString()}{" "}
                      VNĐ
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold uppercase">
                        Thành công
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleHuyMon(item.DangKyID)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        Hủy môn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 flex justify-end items-center space-x-6">
            <div className="text-gray-600 font-medium">
              Tổng tín chỉ:{" "}
              <span className="text-blue-600 font-bold">
                {daDangKy.reduce(
                  (sum, item) =>
                    sum + (item.lop_hoc_phan?.mon_hoc?.SoTinChi || 0),
                  0,
                )}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              Tổng học phí:{" "}
              <span className="text-red-600">
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
    </div>
  );
};

export default DangKyHocPhan;
