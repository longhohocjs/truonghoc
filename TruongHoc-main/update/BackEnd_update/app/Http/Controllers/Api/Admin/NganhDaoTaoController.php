<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\NganhDaoTaoService;
use Illuminate\Http\Request;

class NganhDaoTaoController extends Controller
{
    protected $nganhService;

    public function __construct(NganhDaoTaoService $nganhService)
    {
        $this->nganhService = $nganhService;
    }

    public function index()
    {
        return response()->json($this->nganhService->getAll());
    }

    public function store(Request $request)
    {
        $data = $this->nganhService->create($request->all());
        return response()->json($data, 201);
    }
    
    public function update(Request $request)
    {
        $id = $request->input('NganhID'); 
        $data = $this->nganhService->update($id, $request->all());

        if (!$data) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy Ngành đào tạo với ID: ' . $id
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật ngành thành công',
            'data' => $data
        ]);
    }

    public function destroy(Request $request)
    {
        $id = $request->input('NganhID');
        
        $this->nganhService->delete($id);
        return response()->json([
            'status' => true,
            'message' => 'Xóa ngành thành công'
        ]);
    }
}