<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DotDangKy;
use App\Models\HocKy;
use App\Services\DotDangKyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DotDangKyController extends Controller
{
    protected $dotDangKyService;

    public function __construct(DotDangKyService $dotDangKyService)
    {
        $this->dotDangKyService = $dotDangKyService;
    }

    public function index(Request $request)
    {
        $dots = $this->dotDangKyService->getDanhSachDot(
            $request->query('NamHocID'),
            $request->query('HocKyID')
        );

        return response()->json([
            'status' => 'success',
            'data' => $dots
        ]);
    }

    public function filterDots(Request $request)
    {
        $request->validate([
            'NamHocID' => 'nullable|integer',
            'HocKyID'  => 'nullable|integer',
        ]);

        $dots = $this->dotDangKyService->getDanhSachDot(
            $request->input('NamHocID'),
            $request->input('HocKyID')
        );

        return response()->json([
            'status' => 'success',
            'data' => $dots
        ]);
    }

    public function getLopHocPhanByJson(Request $request)
    {
        $request->validate([
            'DotDangKyID' => 'required|exists:dotdangky,DotDangKyID',
            'KhoaID'      => 'nullable|integer',
            'NganhID'     => 'nullable|integer',
        ]);

        $filters = [
            'KhoaID'  => $request->input('KhoaID'),
            'NganhID' => $request->input('NganhID'),
        ];

        $lops = $this->dotDangKyService->getLopHocPhanTheoDot(
            $request->input('DotDangKyID'), 
            $filters
        );

        return response()->json([
            'status' => 'success',
            'count'  => $lops->count(),
            'data'   => $lops
        ]);
    }

    public function storeDotDangKy(Request $request)
    {
        $request->validate([
            'HocKyID'     => 'required|exists:hocky,HocKyID',
            'NgayBatDau'  => 'required|date',
            'NgayKetThuc' => 'required|date|after:NgayBatDau',
            'TenDot'      => 'nullable|string|max:255',
            'TrangThai'   => 'nullable|in:0,1',
        ]);

        $hocKy = HocKy::findOrFail($request->HocKyID);

        $dot = $this->dotDangKyService->create($request->all(), $hocKy);

        return response()->json([
            'message' => 'Tạo đợt đăng ký thành công',
            'data'    => $dot
        ], 201);
    }

    public function updateDotDangKy(Request $request) 
    {
        $request->validate([
            'DotDangKyID' => 'required|exists:dotdangky,DotDangKyID',
            'TenDot'      => 'nullable|string|max:255',
            'NgayBatDau'  => 'required|date',
            'NgayKetThuc' => 'required|date|after:NgayBatDau',
            'TrangThai'   => 'nullable|in:0,1',
        ]);

        $dot = DotDangKy::findOrFail($request->DotDangKyID);

        $updatedDot = $this->dotDangKyService->update($dot, $request->all());

        return response()->json([
            'status'  => 'success',
            'message' => 'Cập nhật thành công',
            'data'    => $updatedDot
        ]);
    }

    public function changeStatusDotDangKy(Request $request) 
    {
        $request->validate([
            'DotDangKyID' => 'required|exists:dotdangky,DotDangKyID',
            'TrangThai'   => 'required|in:0,1'
        ]);

        $dot = DotDangKy::findOrFail($request->DotDangKyID);

        $updatedDot = $this->dotDangKyService->changeStatus($dot, $request->TrangThai);

        $statusLabel = $request->TrangThai == 1 ? 'Kích hoạt' : 'Khóa cứng';

        return response()->json([
            'status'  => 'success',
            'message' => "Đã {$statusLabel} đợt đăng ký thành công",
            'data'    => $updatedDot
        ]);
    }
}