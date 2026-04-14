<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use App\Models\XinMoLop;
use App\Services\XinMoLopService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class XinMoLopController extends Controller
{
    protected $xinMoLopService;

    public function __construct(XinMoLopService $xinMoLopService)
    {
        $this->xinMoLopService = $xinMoLopService;
    }

    public function index(Request $request)
    {
        $monHocID = $request->input('MonHocID'); 
        $hocKyID = $request->input('HocKyID');

        if (!$monHocID || !$hocKyID) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu dữ liệu MonHocID hoặc HocKyID',
            ], 400);
        }

        $nhoms = XinMoLop::where('MonHocID', $monHocID)
            ->where('HocKyID', $hocKyID)
            ->where('TrangThai', 'Đang gom')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $nhoms
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'MonHocID' => 'required|exists:monhoc,MonHocID',
            'HocKyID'  => 'required|exists:hocky,HocKyID',
            'Thu'      => 'required',
            'BuoiHoc'  => 'required|in:Sáng,Chiều,Tối',
        ]);

        try {
            $user = Auth::user();

            // Kiểm tra xem user có thực sự là sinh viên và có bản ghi sinh viên kèm theo không
            if (!$user || !$user->sinhVien) {
                throw new \Exception("Tài khoản này không có thông tin sinh viên hợp lệ.");
            }

            // Lấy SinhVienID từ quan hệ hasOne
            $sinhVienId = $user->sinhVien->SinhVienID; 
            
            $result = $this->xinMoLopService->ghiDanhXinMoLop($request->all(), $sinhVienId);
            
            return response()->json([
                'message' => 'Đăng ký nguyện vọng thành công!',
                'data' => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user || !$user->sinhVien) {
                throw new \Exception("Tài khoản không hợp lệ.");
            }

            $sinhVienId = $user->sinhVien->SinhVienID;
            $nhomId = $request->input('NhomID');

            if (!$nhomId) {
                throw new \Exception("Vui lòng cung cấp ID nhóm nguyện vọng.");
            }
            $this->xinMoLopService->huyXinMoLop($nhomId, $sinhVienId);

            return response()->json([
                'message' => 'Đã hủy nguyện vọng thành công.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}