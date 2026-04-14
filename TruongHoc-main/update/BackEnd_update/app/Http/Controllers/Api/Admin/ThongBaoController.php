<?php

namespace App\Http\Controllers\Api\Admin;

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
        $result = $this->thongBaoService->getAllThongBao();
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'TieuDe' => 'required|string|max:255',
            'NoiDung' => 'required|string',
            'LoaiThongBao' => 'required|string',
            'DoiTuong' => 'required|string',
            'NgayBatDauHienThi' => 'required|date',
            'NgayKetThucHienThi' => 'required|date|after_or_equal:NgayBatDauHienThi',
        ]);

        $thongBao = $this->thongBaoService->createThongBao($data);

        return response()->json([
            'success' => true,
            'message' => 'Thông báo đã được tạo và gửi email đến toàn bộ sinh viên.',
            'data' => $thongBao
        ], 201);
    }
}