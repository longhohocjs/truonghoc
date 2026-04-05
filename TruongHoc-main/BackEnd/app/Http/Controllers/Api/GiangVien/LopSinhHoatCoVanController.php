<?php

namespace App\Http\Controllers\Api\GiangVien;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\LopSinhHoatService;
use App\Models\LopSinhHoat;
use App\Models\View\VSinhVienLopSinhHoat;

class LopSinhHoatCoVanController extends Controller
{
    protected $service;

    public function __construct(LopSinhHoatService $service)
    {
        $this->service = $service;
    }

    public function getLopPhanCong(Request $request): JsonResponse
    {
        $giangVien = $request->user()?->giangVien;

        if (!$giangVien) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giảng viên'], 403);
        }

        $data = $this->service->getLopSinhHoatPhanCong($giangVien->GiangVienID);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách lớp sinh hoạt thành công',
            'data'    => $data
        ]);
    }

    public function getSinhVienTrongLop(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lopSinhHoatID' => 'required|integer|exists:lopsinhhoat,LopSinhHoatID',
        ]);

        $giangVien = $request->user()?->giangVien;

        if (!$giangVien) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giảng viên'], 403);
        }

        $lop = LopSinhHoat::where('LopHocPhanID', $validated['lopSinhHoatID']) // Hoặc LopSinhHoatID tùy DB của bạn
            ->where('GiangVienID', $giangVien->GiangVienID)
            ->first();

        if (!$lop) {
            return response()->json(['success' => false, 'message' => 'Lớp sinh hoạt không thuộc quyền quản lý của bạn'], 403);
        }

        $sinhVienList = $this->service->getSinhVienTrongLopSinhHoat($validated['lopSinhHoatID']);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sinh viên thành công',
            'data'    => $sinhVienList
        ]);
    }

    public function getDiemRenLuyen(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lopSinhHoatID' => 'required|integer|exists:lopsinhhoat,LopSinhHoatID',
            'hocKyID'       => 'nullable|integer|exists:hocky,HocKyID',
            'namHocID'      => 'nullable|integer|exists:namhoc,NamHocID',
        ]);

        $giangVien = $request->user()?->giangVien;

        if (!$giangVien) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giảng viên'], 403);
        }

        $lop = LopSinhHoat::where('LopSinhHoatID', $validated['lopSinhHoatID'])
            ->where('GiangVienID', $giangVien->GiangVienID)
            ->first();

        if (!$lop) {
            return response()->json(['success' => false, 'message' => 'Lớp sinh hoạt không thuộc quyền của bạn'], 403);
        }

        $diemList = $this->service->getDiemRenLuyenTrongLop(
            $validated['lopSinhHoatID'],
            $validated['hocKyID'] ?? null,
            $validated['namHocID'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Lấy điểm rèn luyện thành công',
            'data'    => $diemList
        ]);
    }

    public function capNhatDiemRenLuyen(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lopSinhHoatID' => 'required|integer|exists:lopsinhhoat,LopSinhHoatID',
            'sinhVienID'    => 'required|integer|exists:sinhvien,SinhVienID',
            'hocKyID'       => 'required|integer|exists:hocky,HocKyID',
            'tongDiem'      => 'required|numeric|min:0|max:100',
            'xepLoai'       => 'nullable|string|in:XuatSac,Gioi,Kha,TrungBinh,Yeu,Kem',
        ]);

        $giangVien = $request->user()?->giangVien;
        $currentUserId = $request->user()?->id;

        if (!$giangVien || !$currentUserId) {
            return response()->json(['success' => false, 'message' => 'Không thể xác thực người dùng'], 403);
        }

        $lop = LopSinhHoat::where('LopSinhHoatID', $validated['lopSinhHoatID'])
            ->where('GiangVienID', $giangVien->GiangVienID)
            ->exists();

        if (!$lop) {
            return response()->json(['success' => false, 'message' => 'Lớp sinh hoạt không thuộc quyền của bạn'], 403);
        }

        $isInLop = VSinhVienLopSinhHoat::where('LopSinhHoatID', $validated['lopSinhHoatID'])
            ->where('SinhVienID', $validated['sinhVienID'])
            ->exists();

        if (!$isInLop) {
            return response()->json(['success' => false, 'message' => 'Sinh viên không thuộc lớp sinh hoạt này'], 403);
        }

        $result = $this->service->capNhatDiemRenLuyen(
            $validated['sinhVienID'],
            $validated['hocKyID'],
            $validated['tongDiem'],
            $validated['xepLoai'] ?? null,
            $giangVien->GiangVienID,
            $currentUserId
        );

        return response()->json($result);
    }
}