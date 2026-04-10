import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const DotDangKyManager = () => {
  const [dots, setDots] = useState([]);
  const [hocKys, setHocKys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ HocKyID: "" }); // Filter cho danh sách đợt đăng ký

  const [showModal, setShowModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    TenDot: "",
    HocKyID: "",
    NgayBatDau: "",
    NgayKetThuc: "",
    TrangThai: 1,
  });

  // States cho phần xem danh sách lớp học phần theo đợt
  const [selectedDot, setSelectedDot] = useState(null); // Đợt đăng ký đang được chọn để xem học phần
  const [lopHocPhans, setLopHocPhans] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [nganhs, setNganhs] = useState([]);
  const [selectedKhoaId, setSelectedKhoaId] = useState("");
  const [selectedNganhId, setSelectedNganhId] = useState("");
  const [loadingLopHocPhans, setLoadingLopHocPhans] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [resHk, resKhoa, resNganh] = await Promise.all([
          axiosClient.get("/admin/hoc-ky"),
          axiosClient.post("/admin/khoa/list"), // Lấy tất cả khoa
          axiosClient.get("/admin/nganh/list"), // Lấy tất cả ngành
        ]);
        setHocKys(resHk.data || []);
        setKhoas(resKhoa.data || []);
        setNganhs(resNganh.data || []);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu ban đầu.");
        console.error(error);
      }
    };
    init();
  }, []);

  const fetchDots = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/admin/dot-dang-ky/filter", filter);
      setDots(res.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đợt đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDots();
  }, [filter.HocKyID]);

  // Hàm lấy danh sách lớp học phần của đợt đã chọn
  const fetchLopHocPhans = async () => {
    if (!selectedDot) return;
    setLoadingLopHocPhans(true);
    try {
      const res = await axiosClient.post(
        "/admin/dot-dang-ky/lop-hoc-phan-list",
        {
          DotDangKyID: selectedDot.DotDangKyID,
          KhoaID: selectedKhoaId || null,
          NganhID: selectedNganhId || null,
        },
      );
      setLopHocPhans(res.data || []);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lớp học phần.");
    } finally {
      setLoadingLopHocPhans(false);
    }
  };

  useEffect(() => {
    if (selectedDot) {
      fetchLopHocPhans();
    } else {
      setLopHocPhans([]); // Xóa danh sách khi không có đợt nào được chọn
    }
  }, [selectedDot, selectedKhoaId, selectedNganhId]);

  const handleToggleStatus = async (dot) => {
    try {
      await axiosClient.put("/admin/dot-dang-ky/doi-trang-thai", {
        DotDangKyID: dot.DotDangKyID,
        TrangThai: dot.TrangThai === 1 ? 0 : 1,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchDots();
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/dot-dang-ky/${id}`);
      toast.success("Xóa đợt đăng ký thành công");
      fetchDots();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa đợt đăng ký");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.DotDangKyID) {
        await axiosClient.put("/admin/dot-dang-ky/cap-nhat", formData);
        toast.success("Cập nhật thành công");
      } else {
        await axiosClient.post("/admin/dot-dang-ky", formData);
        toast.success("Tạo đợt đăng ký mới thành công");
      }
      setShowModal(false);
      fetchDots();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xử lý dữ liệu");
    }
  };

  if (selectedDot) {
    // Hiển thị giao diện xem lớp học phần
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-800">
            Lớp học phần của đợt:{" "}
            <span className="text-blue-600">{selectedDot.TenDot}</span>
          </h2>
          <button
            onClick={() => setSelectedDot(null)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold"
          >
            ← Quay lại
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select
              className="border p-2 rounded-lg text-sm"
              value={selectedKhoaId}
              onChange={(e) => setSelectedKhoaId(e.target.value)}
            >
              <option value="">Tất cả Khoa</option>
              {khoas.map((khoa) => (
                <option key={khoa.KhoaID} value={khoa.KhoaID}>
                  {khoa.TenKhoa}
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded-lg text-sm"
              value={selectedNganhId}
              onChange={(e) => setSelectedNganhId(e.target.value)}
            >
              <option value="">Tất cả Ngành</option>
              {nganhs
                .filter(
                  (nganh) => !selectedKhoaId || nganh.KhoaID == selectedKhoaId,
                )
                .map((nganh) => (
                  <option key={nganh.NganhID} value={nganh.NganhID}>
                    {nganh.TenNganh}
                  </option>
                ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Mã Lớp HP</th>
                  <th className="px-6 py-3">Môn học</th>
                  <th className="px-6 py-3">Tín chỉ</th>
                  <th className="px-6 py-3">Giảng viên</th>
                  <th className="px-6 py-3">Sĩ số (Hiện tại/Tối đa)</th>
                  <th className="px-6 py-3">Ngày bắt đầu</th>
                  <th className="px-6 py-3">Ngày kết thúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingLopHocPhans ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      Đang tải lớp học phần...
                    </td>
                  </tr>
                ) : lopHocPhans.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500 italic"
                    >
                      Không tìm thấy lớp học phần nào.
                    </td>
                  </tr>
                ) : (
                  lopHocPhans.map((lop) => (
                    <tr key={lop.LopHocPhanID}>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {lop.MaLopHP}
                      </td>
                      <td className="px-6 py-4">
                        {lop.mon_hoc?.TenMon || "N/A"}
                      </td>
                      <td className="px-6 py-4">{lop.mon_hoc?.SoTinChi}</td>
                      <td className="px-6 py-4">
                        {lop.giang_vien?.HoTen || "Chưa phân công"}
                      </td>
                      <td className="px-6 py-4">
                        {lop.dang_ky_hoc_phan_count || 0}/{lop.SoLuongToiDa}
                      </td>
                      <td className="px-6 py-4">{lop.NgayBatDau}</td>
                      <td className="px-6 py-4">{lop.NgayKetThuc}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
          <select
            className="border p-2 rounded-lg text-sm"
            onChange={(e) => setFilter({ ...filter, HocKyID: e.target.value })}
          >
            <option value="">Chọn Học kỳ để xem...</option>
            {hocKys.map((hk) => (
              <option key={hk.HocKyID} value={hk.HocKyID}>
                {hk.nam_hoc?.TenNamHoc} - {hk.TenHocKy}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setFormData({
              TenDot: "",
              HocKyID: filter.HocKyID,
              NgayBatDau: "",
              NgayKetThuc: "",
              TrangThai: 1,
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
        >
          + Tạo Đợt đăng ký
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center text-gray-400 font-medium">
            Đang tải danh sách đợt đăng ký...
          </div>
        ) : dots.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-400 italic bg-white rounded-2xl border border-dashed">
            Không có đợt đăng ký nào được tìm thấy.
          </div>
        ) : (
          dots.map((dot) => (
            <div
              key={dot.DotDangKyID}
              className="bg-white p-6 rounded-2xl shadow-sm border space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-blue-700">
                  {dot.TenDot}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${dot.TrangThai === 1 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                  {dot.TrangThai === 1 ? "ĐANG MỞ" : "ĐÃ ĐÓNG"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                <p>
                  📅 {dot.NgayBatDau} - {dot.NgayKetThuc}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleStatus(dot)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-xs font-bold"
                >
                  {dot.TrangThai === 1 ? "Đóng đợt" : "Mở đợt"}
                </button>
                <button
                  onClick={() => setSelectedDot(dot)}
                  className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-100 transition-all"
                >
                  Xem học phần
                </button>
                <button
                  onClick={() => {
                    setFormData(dot);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() =>
                    setConfirmConfig({
                      isOpen: true,
                      id: dot.DotDangKyID,
                    })
                  }
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4"
          >
            <h3 className="text-xl font-black">
              {formData.DotDangKyID ? "Cập nhật đợt" : "Tạo đợt đăng ký mới"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên đợt (Ví dụ: Đợt 1 - Học kỳ 2)"
                className="w-full border p-2.5 rounded-xl"
                value={formData.TenDot}
                onChange={(e) =>
                  setFormData({ ...formData, TenDot: e.target.value })
                }
                required
              />
              <select
                className="w-full border p-2.5 rounded-xl"
                value={formData.HocKyID}
                onChange={(e) =>
                  setFormData({ ...formData, HocKyID: e.target.value })
                }
                required
              >
                <option value="">Chọn học kỳ...</option>
                {hocKys.map((hk) => (
                  <option key={hk.HocKyID} value={hk.HocKyID}>
                    {hk.nam_hoc?.TenNamHoc} - {hk.TenHocKy}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border p-2 rounded-lg"
                    value={formData.NgayBatDau.replace(" ", "T")}
                    onChange={(e) =>
                      setFormData({ ...formData, NgayBatDau: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    Ngày kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border p-2 rounded-lg"
                    value={formData.NgayKetThuc.replace(" ", "T")}
                    onChange={(e) =>
                      setFormData({ ...formData, NgayKetThuc: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-bold text-gray-400"
              >
                Hủy
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(confirmConfig.id)}
        title="Xóa đợt đăng ký"
        message="Bạn có chắc chắn muốn xóa đợt đăng ký này? Dữ liệu về các lớp đang mở trong đợt này có thể bị ảnh hưởng."
      />
    </div>
  );
};

export default DotDangKyManager;
