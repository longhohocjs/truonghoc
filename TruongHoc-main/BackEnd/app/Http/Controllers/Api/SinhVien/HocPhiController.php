<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use App\Services\HocPhiService;
use Illuminate\Http\Request;


class HocPhiController extends Controller
{
    protected $hocPhiService;

    public function __construct(HocPhiService $hocPhiService)
    {
        $this->hocPhiService = $hocPhiService;
    }

    public function index(Request $request)
    {
        $sinhVien = $request->user()->sinhVien;
        if (!$sinhVien) return response()->json(['message' => 'Không tìm thấy SV'], 404);

        $data = $this->hocPhiService->getHocPhiHienTai($sinhVien->SinhVienID);
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}