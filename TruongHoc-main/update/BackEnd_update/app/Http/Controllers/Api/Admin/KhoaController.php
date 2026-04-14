<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Nganh;
use App\Models\Khoa;
use App\Services\KhoaService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class KhoaController extends Controller
{
    protected $khoaService;

    public function __construct(KhoaService $khoaService)
    {
        $this->khoaService = $khoaService;
    }

    public function index(): JsonResponse
    {
        $khoas = Khoa::with('nganhs')->get();

        return response()->json([
            'status' => 'success',
            'data' => $this->khoaService->getAll()
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->khoaService->create($request->all());
        return response()->json($data, 201);
    }

    public function update(Request $request)
    {
        $data = $this->khoaService->update($request->all());
        return response()->json([
            'message' => 'Cập nhật khoa thành công',
            'data' => $data
        ]);
    }

    public function destroy(Request $request)
    {
        $this->khoaService->delete($request->all());
        return response()->json(['message' => 'Xóa khoa thành công']);
    }

    public function getNganhByKhoa($id): JsonResponse
    {
        $khoa = Khoa::with('nganhs')->findOrFail($id);
        return $this->success($khoa->nganhs, "Lấy danh sách ngành thuộc khoa {$khoa->TenKhoa} thành công");
    }

    public function getAllNganh(): JsonResponse
    {
        $nganhs = Nganh::all();

        return response()->json([
            'status' => 'success',
            'data' => $nganhs
        ]);
    }
}