<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LopHocPhan;
use App\Models\Khoa;
use App\Models\DangKyHocPhan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{
    /**
     * Tổng hợp dữ liệu thống kê cho Dashboard Admin
     */
    public function index(): JsonResponse
    {
        try {
            // 1. Tính toán Summary
            $tongLhp = LopHocPhan::count();
            $tongChoNgoi = LopHocPhan::sum('SoLuongToiDa');
            $daDangKy = DangKyHocPhan::count();
            $tiLeLapDay = $tongChoNgoi > 0 ? round(($daDangKy / $tongChoNgoi) * 100, 1) : 0;

            // 2. Dữ liệu biểu đồ (Thống kê theo Khoa) - Sử dụng Query Builder để chính xác hơn
            $chartData = Khoa::all()->map(function($khoa) {
                // Tính tổng chỉ tiêu của khoa
                $totalSlots = DB::table('lophocphan')
                    ->join('monhoc', 'lophocphan.MonHocID', '=', 'monhoc.MonHocID')
                    ->where('monhoc.KhoaID', $khoa->KhoaID)
                    ->sum('SoLuongToiDa');

                // Tính số lượng sinh viên đã đăng ký thực tế của khoa
                $registeredCount = DB::table('dangkyhocphan')
                    ->join('lophocphan', 'dangkyhocphan.LopHocPhanID', '=', 'lophocphan.LopHocPhanID')
                    ->join('monhoc', 'lophocphan.MonHocID', '=', 'monhoc.MonHocID')
                    ->where('monhoc.KhoaID', $khoa->KhoaID)
                    ->count();

                return [
                    'name' => $khoa->TenKhoa,
                    'registered' => $registeredCount,
                    'total' => (int)$totalSlots ?: 100 // Tránh chia cho 0 hoặc hiển thị trống
                ];
            });

            // 3. Danh sách lớp tiêu biểu (Tỉ lệ đăng ký cao nhất)
            $topClasses = LopHocPhan::with('monHoc')
                ->get()
                ->map(function($lop) {
                    $count = DangKyHocPhan::where('LopHocPhanID', $lop->LopHocPhanID)->count();
                    $tiLe = $lop->SoLuongToiDa > 0 ? round(($count / $lop->SoLuongToiDa) * 100) : 0;
                    return [
                        'ma_lhp' => $lop->MaLopHP,
                        'ten_mon' => $lop->monHoc->TenMon ?? 'N/A',
                        'ti_le' => $tiLe,
                        'si_so' => "{$count}/{$lop->SoLuongToiDa}"
                    ];
                })
                ->sortByDesc('ti_le')
                ->take(5)
                ->values();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'summary' => [
                        'tong_lhp' => $tongLhp,
                        'tong_cho_ngoi' => $tongChoNgoi,
                        'da_dang_ky' => $daDangKy,
                        'ti_le_lap_day' => $tiLeLapDay,
                    ],
                    'chartData' => $chartData,
                    'topClasses' => $topClasses
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}