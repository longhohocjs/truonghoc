<?php

namespace App\Http\Controllers\Api\HocTap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\NamHocService;
use App\Services\HocKyService;

class HocKyNamHocController extends Controller
{
    protected $namHocService;
    protected $hocKyService;

    public function __construct(NamHocService $namHocService, HocKyService $hocKyService)
    {
        $this->namHocService = $namHocService;
        $this->hocKyService = $hocKyService;
    }

    public function index()
    {
        $data = $this->namHocService->getAll();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function storeNamHoc(Request $request)
    {
        $data = $request->validate([
            'TenNamHoc' => 'required|string',
            'NgayBatDau' => 'required|date',
            'NgayKetThuc' => 'required|date|after:NgayBatDau',
        ]);

        $result = $this->namHocService->create($data);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function updateNamHoc(Request $request)
    {
        $data = $request->validate([
            'NamHocID' => 'required|exists:namhoc,NamHocID',
            'TenNamHoc' => 'required|string',
            'NgayBatDau' => 'required|date',
            'NgayKetThuc' => 'required|date',
        ]);

        $this->namHocService->update($data['NamHocID'], $data);
        return response()->json(['success' => true]);
    }

    public function storeHocKy(Request $request)
    {
        $data = $request->validate([
            'TenHocKy' => 'required|string',
            'NamHocID' => 'required|exists:namhoc,NamHocID',
            'LoaiHocKy' => 'required|integer',
            'NgayBatDau' => 'required|date',
            'NgayKetThuc' => 'required|date|after:NgayBatDau',
        ]);

        $result = $this->hocKyService->create($data);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function updateHocKy(Request $request)
    {
        $data = $request->validate([
            'HocKyID' => 'required|exists:hocky,HocKyID',
            'TenHocKy' => 'required|string',
            'NamHocID' => 'required|exists:namhoc,NamHocID',
            'LoaiHocKy' => 'required|integer',
            'NgayBatDau' => 'required|date',
            'NgayKetThuc' => 'required|date',
        ]);

        $this->hocKyService->update($data['HocKyID'], $data);
        return response()->json(['success' => true]);
    }
}