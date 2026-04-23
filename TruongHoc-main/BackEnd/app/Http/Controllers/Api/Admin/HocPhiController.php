<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DangKyHocPhan;
use App\Models\SinhVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HocPhiController extends Controller
{
    public function index(Request $request)
    {
        $query = SinhVien::with(['dangKyHocPhan' => function($q) {
            $q->where('TrangThai', 'ThanhCong')->with('lopHocPhan.monHoc');
        }]);

        if ($request->search) {
            $query->where('MaSV', 'like', "%{$request->search}%")
                  ->orWhere('HoTen', 'like', "%{$request->search}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20)
        ]);
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'SinhVienID' => 'required',
            'HocKyID' => 'required'
        ]);

        // Xác nhận thanh toán cho tất cả môn trong học kỳ đó của sinh viên
        $updated = DangKyHocPhan::where('SinhVienID', $request->SinhVienID)
            ->whereHas('lopHocPhan', function($q) use ($request) {
                $q->where('HocKyID', $request->HocKyID);
            })
            ->update(['TrangThaiThanhToan' => 1]);

        return response()->json([
            'success' => true,
            'message' => "Đã xác nhận thanh toán cho {$updated} học phần."
        ]);
    }
}