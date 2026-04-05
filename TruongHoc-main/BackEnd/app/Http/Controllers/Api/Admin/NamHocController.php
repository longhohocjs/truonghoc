<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NamHoc;
use App\Models\HocKy;
use App\Services\QuanLyNamHocService;
use Illuminate\Http\Request;

class NamHocController extends Controller
{
    protected $namHocService;

    public function __construct(QuanLyNamHocService $namHocService)
    {
        $this->namHocService = $namHocService;
    }

    public function storeNamHoc(Request $request)
    {
        $request->validate([
            'TenNamHoc'   => 'required|string|max:50|unique:namhoc,TenNamHoc',
            'NgayBatDau'  => 'required|date',
            'NgayKetThuc' => 'required|date|after_or_equal:NgayBatDau',
        ]);

        $namHoc = $this->namHocService->taoNamHoc($request->all());

        return response()->json([
            'message' => 'Thêm năm học thành công',
            'data'    => $namHoc
        ], 201);
    }

    public function storeHocKy(Request $request)
    {
        $request->validate([
            'NamHocID'    => 'required|exists:namhoc,NamHocID',
            'TenHocKy'    => 'required|string|max:100',
            'LoaiHocKy'   => 'required|in:HK1,HK2,He',
        ]);

        $exists = HocKy::where('NamHocID', $request->NamHocID)
            ->where('TenHocKy', $request->TenHocKy)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Học kỳ này đã tồn tại trong năm học'], 422);
        }

        $hocKy = $this->namHocService->taoHocKy($request->all());

        return response()->json([
            'message' => 'Thêm học kỳ thành công',
            'data'    => $hocKy
        ], 201);
    }

    public function getDanhSachHocKy(Request $request)
    {
        $query = HocKy::with('namHoc');

        if ($request->filled('nam_hoc_id')) {
            $query->where('NamHocID', $request->nam_hoc_id);
        }

        $list = $query->orderByDesc('NamHocID')->orderBy('LoaiHocKy')->get();

        return response()->json([
            'message' => 'Lấy danh sách học kỳ thành công',
            'data'    => $list
        ]);
    }
}