<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use App\Services\ThongBaoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ThongBaoController extends Controller
{
    protected $thongBaoService;

    public function __construct(ThongBaoService $thongBaoService)
    {
        $this->thongBaoService = $thongBaoService;
    }

    public function index(): JsonResponse
    {
        $notifications = $this->thongBaoService->getThongBaoSinhVien();
        
        return response()->json([
            'success' => true,
            'data' => $notifications
        ], 200);
    }

    public function show(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|integer',
        ]);

        try {
            $id = $request->input('id');
            $notification = $this->thongBaoService->getThongBaoChiTiet($id);

            return response()->json([
                'success' => true,
                'message' => 'Lấy thông báo thành công',
                'data' => $notification
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Thông báo không tồn tại, đã hết hạn hoặc không thuộc quyền xem của bạn.'
            ], 404);
        }
    }
}