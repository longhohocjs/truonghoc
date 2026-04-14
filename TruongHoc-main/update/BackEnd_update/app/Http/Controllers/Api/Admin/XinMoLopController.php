<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\XinMoLop;
use App\Services\XinMoLopService;
use Illuminate\Http\Request;

class XinMoLopController extends Controller
{
    protected $xinMoLopService;

    public function __construct(XinMoLopService $xinMoLopService)
    {
        $this->xinMoLopService = $xinMoLopService;
    }

    public function index()
    {
        $danhSach = XinMoLop::with(['monHoc', 'hocKy'])
            ->where('TrangThai', 'Đang gom')
            ->orderBy('SoLuongHienTai', 'desc')
            ->get();

        return response()->json($danhSach);
    }

    public function approve(Request $request, $nhomId)
    {
        $request->validate([
            'GiangVienID'  => 'required|exists:giangvien,GiangVienID',
            'MaLopHP'      => 'required|unique:lophocphan,MaLopHP',
            'SoLuongToiDa' => 'required|integer|min:1',
            'NgayBatDau'   => 'required|date',
            'NgayKetThuc'  => 'required|date|after:NgayBatDau',
        ]);

        try {
            $lopHP = $this->xinMoLopService->pheDuyetXinMoLop(
                $nhomId,
                $request->GiangVienID,
                $request->MaLopHP,
                $request->SoLuongToiDa,
                $request->NgayBatDau,
                $request->NgayKetThuc
            );

            return response()->json([
                'message' => 'Phê duyệt và mở lớp thành công!',
                'data' => $lopHP
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}