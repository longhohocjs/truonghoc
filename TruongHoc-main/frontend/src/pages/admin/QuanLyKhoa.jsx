import React, { useState, useEffect } from "react";
import axiosClient from "@/api/axios";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

const QuanLyKhoa = () => {
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKhoa, setEditingKhoa] = useState(null); // Lưu thông tin khoa đang sửa
  const [editingNganh, setEditingNganh] = useState(null); // Lưu thông tin ngành đang sửa
  const [isAddNganhModalOpen, setIsAddNganhModalOpen] = useState(false);
  const [selectedKhoaForNganh, setSelectedKhoaForNganh] = useState(null); // Khoa được chọn để thêm ngành
  const [newKhoa, setNewKhoa] = useState({ MaKhoa: "", TenKhoa: "" });
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    id: null,
    type: null, // 'khoa' hoặc 'nganh'
  });

  // Hàm lấy danh sách khoa và ngành
  const fetchData = async () => {
    console.log("Đang gọi API lấy danh sách khoa...");
    setLoading(true);
    try {
      // Gọi API POST /admin/khoa/list theo định nghĩa trong api.php
      const res = await axiosClient.post("/admin/khoa/list");
      // Đảm bảo lấy đúng mảng dữ liệu từ { status: 'success', data: [...] }
      setKhoas(res?.data || res || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khoa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mở modal sửa khoa
  const handleOpenEditKhoa = (khoa) => {
    setEditingKhoa(khoa);
    setNewKhoa({ MaKhoa: khoa.MaKhoa, TenKhoa: khoa.TenKhoa });
    setIsAddModalOpen(true);
  };

  // Logic Lưu Khoa (Thêm/Sửa)
  const handleSubmitKhoa = async (e) => {
    e.preventDefault();
    try {
      if (editingKhoa) {
        await axiosClient.patch(`/admin/khoa/${editingKhoa.KhoaID}`, newKhoa);
        toast.success("Cập nhật Khoa thành công");
      } else {
        await axiosClient.post("/admin/khoa", newKhoa);
        toast.success("Thêm Khoa mới thành công");
      }
      setIsAddModalOpen(false);
      setEditingKhoa(null);
      setNewKhoa({ MaKhoa: "", TenKhoa: "" });
      fetchData();
    } catch (error) {
      console.error("Lỗi khi thêm khoa:", error);
    }
  };

  // Mở modal sửa ngành
  const handleOpenEditNganh = (nganh) => {
    setEditingNganh(nganh);
    setSelectedKhoaForNganh({
      KhoaID: nganh.KhoaID,
      MaNganh: nganh.MaNganh,
      TenNganh: nganh.TenNganh,
    });
    setIsAddNganhModalOpen(true);
  };

  // Logic Lưu Ngành (Thêm/Sửa)
  const handleSubmitNganh = async (e) => {
    e.preventDefault();
    try {
      if (editingNganh) {
        await axiosClient.patch(
          `/admin/nganh/${editingNganh.NganhID}`,
          selectedKhoaForNganh,
        );
        toast.success("Cập nhật Ngành thành công");
      } else {
        await axiosClient.post("/admin/nganh", selectedKhoaForNganh);
        toast.success("Thêm Ngành mới thành công");
      }
      setIsAddNganhModalOpen(false);
      setEditingNganh(null);
      setSelectedKhoaForNganh(null); // Reset
      fetchData();
    } catch (error) {
      console.error("Lỗi khi thêm ngành:", error);
    }
  };

  // Hàm thực thi xóa Khoa sau khi đã xác nhận qua Modal
  const executeDeleteKhoa = async (khoaId) => {
    try {
      const response = await axiosClient.delete(`/admin/khoa/${khoaId}`);
      toast.success(response.message || "Xóa Khoa thành công");
      fetchData(); // Tải lại danh sách
    } catch (error) {
      // Lỗi 400 (còn ràng buộc) sẽ được axios interceptor hiển thị tự động
      console.error("Lỗi xóa khoa:", error);
    }
  };

  // Hàm thực thi xóa Ngành sau khi đã xác nhận qua Modal
  const executeDeleteNganh = async (nganhId) => {
    try {
      const response = await axiosClient.delete(`/admin/nganh/${nganhId}`);
      toast.success(response.message || "Xóa Ngành thành công");
      fetchData(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi xóa ngành:", error);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Thanh tiêu đề nổi bật để nhận diện file mới */}
      <div className="flex justify-between items-center bg-blue-600 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-2xl font-black uppercase">
            Quản lý Khoa & Ngành
          </h2>
          <p className="text-blue-100 text-sm font-medium">
            Cấu hình tổ chức các đơn vị đào tạo trong trường
          </p>
        </div>
        {/* Nút Thêm Khoa mới - Đặt lại vị trí cũ */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95"
        >
          + Thêm Khoa mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs tracking-widest">
          Đang tải dữ liệu đơn vị...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {khoas.map((khoa) => (
            <div
              key={khoa.KhoaID}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header của Khoa */}
              <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">
                    Khoa đào tạo
                  </span>
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                    {khoa.TenKhoa}{" "}
                    <span className="text-gray-400 ml-2 font-bold">
                      ({khoa.MaKhoa})
                    </span>
                  </h3>
                </div>
                <div className="flex gap-2">
                  {" "}
                  {/* Giữ nguyên div này cho nút Xóa Khoa */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditKhoa(khoa);
                    }}
                    type="button"
                    className="bg-blue-100 text-blue-600 text-[10px] font-black px-4 py-2 rounded-xl hover:bg-blue-200 transition-all uppercase"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmConfig({
                        isOpen: true,
                        id: khoa.KhoaID,
                        type: "khoa",
                      });
                    }}
                    type="button"
                    className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-red-600 transition-all uppercase shadow-lg shadow-red-100"
                  >
                    Xóa Khoa
                  </button>
                </div>
              </div>

              {/* Danh sách ngành thuộc khoa */}
              <div className="p-4 px-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="py-3 px-2">Mã ngành</th>
                      <th className="py-3 px-2">Tên ngành đào tạo</th>
                      <th className="py-3 px-2 text-right w-48">
                        {" "}
                        {/* Mở rộng cột thao tác */}
                        <div className="flex justify-end items-center gap-2">
                          {/* Nút Thêm Ngành - Đặt vào header cột Thao tác */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKhoaForNganh({
                                KhoaID: khoa.KhoaID,
                                MaNganh: "",
                                TenNganh: "",
                              });
                              setIsAddNganhModalOpen(true);
                            }}
                            type="button"
                            className="bg-blue-500 text-white text-[8px] font-black px-2 py-1 rounded-lg hover:bg-blue-600 transition-all uppercase shadow-lg shadow-blue-100"
                          >
                            + Thêm Ngành
                          </button>
                          <span>Thao tác</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {khoa.nganhs && khoa.nganhs.length > 0 ? (
                      khoa.nganhs.map((nganh) => (
                        <tr
                          key={nganh.NganhID}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-2 text-xs font-black text-blue-500">
                            {nganh.MaNganh}
                          </td>
                          <td className="py-4 px-2 text-sm font-bold text-gray-700">
                            {nganh.TenNganh}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditNganh(nganh);
                                }}
                                type="button"
                                className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-all uppercase"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmConfig({
                                    isOpen: true,
                                    id: nganh.NganhID,
                                    type: "nganh",
                                  });
                                }}
                                type="button"
                                className="bg-gray-100 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all uppercase"
                              >
                                Xóa Ngành
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-gray-400 text-[10px] uppercase font-bold italic tracking-widest"
                        >
                          Khoa này chưa có ngành đào tạo nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {khoas.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 uppercase font-black text-xs tracking-tighter">
              Hệ thống chưa có dữ liệu khoa
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm Khoa Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {editingKhoa ? "Cập nhật đơn vị Khoa" : "Tạo đơn vị Khoa mới"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingKhoa(null);
                  setNewKhoa({ MaKhoa: "", TenKhoa: "" });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitKhoa} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Mã Khoa
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: CNTT"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newKhoa.MaKhoa}
                  onChange={(e) =>
                    setNewKhoa({
                      ...newKhoa,
                      MaKhoa: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Tên Khoa đào tạo
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Công nghệ thông tin"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newKhoa.TenKhoa}
                  onChange={(e) =>
                    setNewKhoa({ ...newKhoa, TenKhoa: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingKhoa(null);
                    setNewKhoa({ MaKhoa: "", TenKhoa: "" });
                  }}
                  className="flex-1 px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  Lưu thiết lập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Ngành Mới */}
      {isAddNganhModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-white">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {editingNganh
                  ? "Cập nhật Ngành đào tạo"
                  : "Tạo Ngành đào tạo mới"}
              </h3>
              <button
                onClick={() => {
                  setIsAddNganhModalOpen(false);
                  setEditingNganh(null);
                  setSelectedKhoaForNganh(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitNganh} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Mã Ngành
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: CNPM"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedKhoaForNganh?.MaNganh || ""}
                  onChange={(e) =>
                    setSelectedKhoaForNganh({
                      ...selectedKhoaForNganh,
                      MaNganh: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Tên Ngành đào tạo
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kỹ thuật phần mềm"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedKhoaForNganh?.TenNganh || ""}
                  onChange={(e) =>
                    setSelectedKhoaForNganh({
                      ...selectedKhoaForNganh,
                      TenNganh: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddNganhModalOpen(false);
                    setEditingNganh(null);
                    setSelectedKhoaForNganh(null);
                  }}
                  className="flex-1 px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  Lưu thiết lập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa dùng chung cho cả Khoa và Ngành */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() =>
          setConfirmConfig({ isOpen: false, id: null, type: null })
        }
        onConfirm={() => {
          if (confirmConfig.type === "khoa") {
            executeDeleteKhoa(confirmConfig.id);
          } else {
            executeDeleteNganh(confirmConfig.id);
          }
          setConfirmConfig({ isOpen: false, id: null, type: null });
        }}
        title={
          confirmConfig.type === "khoa"
            ? "Xóa đơn vị Khoa"
            : "Xóa Ngành đào tạo"
        }
        message={
          confirmConfig.type === "khoa"
            ? "Bạn có chắc chắn muốn xóa Khoa này? Hệ thống sẽ kiểm tra các ràng buộc về Ngành, Môn học và Giảng viên trước khi thực hiện."
            : "Bạn có chắc chắn muốn xóa Ngành này? Dữ liệu về sinh viên và chương trình đào tạo liên quan có thể bị ảnh hưởng."
        }
      />
    </div>
  );
};

export default QuanLyKhoa;
