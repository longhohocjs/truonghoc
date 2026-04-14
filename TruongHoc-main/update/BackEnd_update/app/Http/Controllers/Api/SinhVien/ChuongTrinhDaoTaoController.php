<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use App\Services\SinhVienChuongTrinhDaoTaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChuongTrinhDaoTaoController extends Controller
{
    protected $service;

    public function __construct(SinhVienChuongTrinhDaoTaoService $service)
    {
        $this->service = $service;
    }

    public function getChuongTrinh(Request $request): JsonResponse
    {
        $data = $this->service->getChuongTrinhDaoTao($request->user());

        return $this->success($data, 'Lấy chương trình đào tạo thành công');
    }

    public function getMonDaHoanThanh(Request $request): JsonResponse
    {
        $data = $this->service->getMonDaHoanThanh($request->user());

        return $this->success($data, 'Lấy danh sách môn đã hoàn thành thành công');
    }

    public function getMonConThieu(Request $request): JsonResponse
    {
        $data = $this->service->getMonConThieu($request->user());

        return $this->success($data, 'Lấy danh sách môn còn thiếu thành công');
    }
}