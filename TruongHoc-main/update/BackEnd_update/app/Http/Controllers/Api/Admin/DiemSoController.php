<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\DiemSoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiemSoController extends Controller
{
    protected $diemSoService;

    public function __construct(DiemSoService $diemSoService)
    {
        $this->diemSoService = $diemSoService;
    }

    public function indexLopHP(Request $request)
    {
        $data = $this->diemSoService->getBangDiemLopHP($request->json()->all());
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function indexRenLuyen(Request $request)
    {
        $data = $this->diemSoService->getDiemRenLuyen($request->json()->all());
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function updateDiem(Request $request)
    {
        try {
            $userID = Auth::id() ?: 1; // Ưu tiên Auth ID, fallback về admin hệ thống
            $this->diemSoService->capNhatDiemLopHP($request->json()->all(), $userID);
            return response()->json(['success' => true, 'message' => 'Cập nhật điểm thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function updateRenLuyen(Request $request)
    {
        try {
            $this->diemSoService->capNhatDiemRenLuyen($request->json()->all());
            return response()->json(['success' => true, 'message' => 'Cập nhật điểm rèn luyện thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function lockDiem(Request $request)
    {
        $this->diemSoService->setLockStatus($request->input('LopHocPhanID'), 1);
        return response()->json(['success' => true, 'message' => 'Đã khóa nhập điểm']);
    }

    public function unlockDiem(Request $request)
    {
        $this->diemSoService->setLockStatus($request->input('LopHocPhanID'), 0);
        return response()->json(['success' => true, 'message' => 'Đã mở khóa nhập điểm']);
    }
}