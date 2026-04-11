<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LopHocPhan;
use App\Services\LopHocPhanService;
use Illuminate\Http\Request;

class LopHocPhanController extends Controller
{
    protected $service;

    public function __construct(LopHocPhanService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        // Lấy toàn bộ danh sách lớp học phần kèm các quan hệ để hiển thị ở Frontend
        $lops = LopHocPhan::with(['monHoc', 'hocKy', 'giangVien', 'lichHoc', 'lichThi'])->get();

        return response()->json([
            'success' => true,
            'data'    => $lops
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'MonHocID'       => 'required|exists:monhoc,MonHocID',
            'HocKyID'        => 'required|exists:hocky,HocKyID',
            'MaLopHP'        => 'required|string|max:50|unique:lophocphan,MaLopHP',
            'SoLuongToiDa'   => 'nullable|integer|min:10',
            'KhoahocAllowed' => 'nullable|string|max:100',
            'NgayBatDau'     => 'required|date',
            'NgayKetThuc'    => 'required|date|after_or_equal:NgayBatDau',
            'GiangVienID'    => 'nullable|exists:giangvien,GiangVienID',
        ]);

        $lop = $this->service->taoLop($data);

        return response()->json([
            'message' => 'Tạo lớp học phần thành công',
            'data'    => $lop->load(['monHoc', 'hocKy', 'giangVien'])
        ], 201);
    }
    

    public function update(Request $request)
    {
        $id = $request->input('LopHocPhanID');
        $lop = LopHocPhan::findOrFail($id);

        $data = $request->validate([
            'LopHocPhanID'   => 'required|exists:lophocphan,LopHocPhanID',
            'MaLopHP'        => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'unique:lophocphan,MaLopHP,' . $id . ',LopHocPhanID',
            ],
            'SoLuongToiDa'   => 'sometimes|nullable|integer|min:10',
            'KhoahocAllowed' => 'sometimes|nullable|string|max:100',
            'NgayBatDau'     => 'sometimes|required|date',
            'NgayKetThuc'    => 'sometimes|required|date|after_or_equal:NgayBatDau',
        ]);

        $updated = $this->service->capNhat($lop, $data);

        return response()->json([
            'message' => 'Cập nhật lớp thành công',
            'data'    => $updated
        ]);
    }

    public function assignGiangVien(Request $request)
    {
        $data = $request->validate([
            'LopHocPhanID' => 'required|exists:lophocphan,LopHocPhanID',
            'GiangVienID'  => 'required|exists:giangvien,GiangVienID',
        ]);

        $lop = LopHocPhan::findOrFail($data['LopHocPhanID']);
        $lop->update(['GiangVienID' => $data['GiangVienID']]);

        return response()->json([
            'message' => 'Phân công giảng viên thành công',
            'data'    => $lop
        ]);
    }

    public function setSiSo(Request $request)
    {
        $data = $request->validate([
            'LopHocPhanID' => 'required|exists:lophocphan,LopHocPhanID',
            'SoLuongToiDa' => 'required|integer|min:1',
        ]);

        $lop = LopHocPhan::findOrFail($data['LopHocPhanID']);
        $lop->update(['SoLuongToiDa' => $data['SoLuongToiDa']]);

        return response()->json([
            'message' => 'Cập nhật sĩ số tối đa thành công',
            'data'    => $lop
        ]);
    }

    /**
     * Xóa lớp học phần
     */
    public function destroy($id)
    {
        // Sử dụng withCount để kiểm tra xem đã có sinh viên đăng ký chưa
        $lop = LopHocPhan::withCount(['dangKyHocPhan'])->findOrFail($id);

        if ($lop->dang_ky_hoc_phan_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa lớp này vì đã có {$lop->dang_ky_hoc_phan_count} sinh viên đăng ký học phần."
            ], 400);
        }

        try {
            // Tự động xóa các dữ liệu liên quan như lịch học, lịch thi nếu cần (tùy thuộc vào thiết lập DB)
            $lop->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa lớp học phần thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi xóa lớp: ' . $e->getMessage()
            ], 500);
        }
    }
}