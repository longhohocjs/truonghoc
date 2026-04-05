<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Nganh; // Import Nganh model
use App\Models\Khoa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class KhoaController extends Controller
{
    /**
     * Lấy danh sách khoa kèm theo các ngành thuộc khoa đó
     */
    public function index(): JsonResponse
    {
        // Eager loading 'nganhs' để frontend hiển thị được danh sách ngành
        $khoas = Khoa::with('nganhs')->get();

        return response()->json([
            'status' => 'success',
            'data' => $khoas
        ]);
    }

    /**
     * Lưu thông tin khoa mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'MaKhoa'  => 'required|string|unique:khoa,MaKhoa|max:20',
            'TenKhoa' => 'required|string|max:255',
        ]);

        $khoa = Khoa::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $khoa
        ], 201);
    }

    /**
     * Lấy danh sách ngành thuộc một khoa cụ thể
     */
    public function getNganhByKhoa($id): JsonResponse
    {
        $khoa = Khoa::with('nganhs')->findOrFail($id);
        
        // Trả về mảng các ngành thuộc khoa này
        return $this->success($khoa->nganhs, "Lấy danh sách ngành thuộc khoa {$khoa->TenKhoa} thành công");
    }

    /**
     * Xóa khoa
     */
    public function destroy($id): JsonResponse
    {
        $khoa = Khoa::findOrFail($id);
        
        // Có thể thêm kiểm tra nếu khoa còn ngành thì không cho xóa
        $khoa->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa khoa thành công'
        ]);
    }

    /**
     * Lấy danh sách tất cả các ngành
     */
    public function getAllNganh(): JsonResponse
    {
        $nganhs = Nganh::all();

        return response()->json([
            'status' => 'success',
            'data' => $nganhs
        ]);
    }
}