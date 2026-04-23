<?php

namespace App\Services;

use App\Models\DangKyHocPhan;
use App\Models\DotDangKy;
use Illuminate\Support\Facades\DB;

class HocPhiService
{
    // Đơn giá mặc định (có thể đưa vào DB hoặc cấu hình hệ thống)
    const DON_GIA_TIN_CHI = 500000; 

    public function getHocPhiHienTai($sinhVienID)
    {
        $sinhVien = \App\Models\SinhVien::find($sinhVienID);
        // 1. Lấy đợt đăng ký/học kỳ hiện tại
        $dot = DotDangKy::where('TrangThai', 1)->orderByDesc('NgayKetThuc')->first();
        
        if (!$dot) {
            return [
                'ma_sv' => $sinhVien->MaSV ?? '',
                'hoc_ky' => 'Chưa có đợt mở',
                'chi_tiet' => [],
                'is_locked' => false
            ];
        }

        $hanNop = $dot->HanNopHocPhi ? \Carbon\Carbon::parse($dot->HanNopHocPhi) : \Carbon\Carbon::parse($dot->NgayKetThuc)->addDays(7);

        // 2. Lấy danh sách các môn đã đăng ký thành công trong học kỳ này
        $danhSachMon = DangKyHocPhan::where('SinhVienID', $sinhVienID)
            ->where('TrangThai', 'ThanhCong')
            ->whereHas('lopHocPhan', function ($q) use ($dot) {
                $q->where('HocKyID', $dot->HocKyID);
            })
            ->with('lopHocPhan.monHoc')
            ->get();

        $tongTinChi = 0;
        $allPaid = true;
        
        $chiTiet = $danhSachMon->map(function ($dk) use (&$tongTinChi, &$allPaid) {
            $tinChi = $dk->lopHocPhan->monHoc->SoTinChi ?? 0;
            $tongTinChi += $tinChi;
            if (!$dk->TrangThaiThanhToan) $allPaid = false;
            
            return [
                'ma_mon' => $dk->lopHocPhan->monHoc->MaMon,
                'ten_mon' => $dk->lopHocPhan->monHoc->TenMon,
                'so_tin_chi' => $tinChi,
                'thanh_tien' => $tinChi * self::DON_GIA_TIN_CHI,
                'ngay_dang_ky' => $dk->ThoiGianDangKy,
                'da_thanh_toan' => (bool)$dk->TrangThaiThanhToan
            ];
        });

        // Logic khóa: Nếu quá hạn nộp và chưa thanh toán xong hết
        $isOverdue = now()->greaterThan($hanNop);
        $isLocked = $isOverdue && !$allPaid;

        return [
            'ma_sv' => $sinhVien->MaSV ?? '',
            'hoc_ky' => $dot->TenDot,
            'don_gia' => self::DON_GIA_TIN_CHI,
            'tong_tin_chi' => $tongTinChi,
            'tong_tien' => $tongTinChi * self::DON_GIA_TIN_CHI,
            'trang_thai_thanh_toan' => $allPaid,
            'han_nop' => $hanNop->format('Y-m-d'),
            'is_locked' => $isLocked,
            'chi_tiet' => $chiTiet
        ];
    }
}