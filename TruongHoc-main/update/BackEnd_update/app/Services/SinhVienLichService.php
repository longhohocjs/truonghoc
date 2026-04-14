<?php

namespace App\Services;

use App\Models\User;
use App\Models\HocKy;
use App\Models\View\VLichHocSinhVien;
use App\Models\View\VLichThiSinhVien;
use Carbon\Carbon;

class SinhVienLichService
{
    public function getLichHoc(User $user, ?int $hocKyId = null, ?string $date = null): array
    {
        $sinhVien = $user->sinhVien;
        if (!$sinhVien) return ['success' => false, 'message' => 'Không tìm thấy sinh viên'];

        $hocKy = $hocKyId ? HocKy::with('namHoc')->find($hocKyId) : $this->getHocKyHienTai();
        if (!$hocKy) return ['success' => false, 'message' => 'Không xác định được học kỳ'];

        $targetDate = $date ? Carbon::parse($date) : Carbon::today();
        $startOfWeek = $targetDate->copy()->startOfWeek()->format('Y-m-d');
        $endOfWeek   = $targetDate->copy()->endOfWeek()->format('Y-m-d');

        $schedules = VLichHocSinhVien::where('SinhVienID', $sinhVien->SinhVienID)
            ->where('HocKyID', $hocKy->HocKyID)
            ->whereBetween('NgayHoc', [$startOfWeek, $endOfWeek])
            ->orderBy('NgayHoc')
            ->orderBy('TietBatDau')
            ->get()
            ->map(fn($item) => [
                'ngay_hoc'    => $item->NgayHoc,
                'thu'         => Carbon::parse($item->NgayHoc)->locale('vi')->dayName,
                'ten_mon'     => $item->TenMon,
                'phong'       => $item->PhongHoc,
                'tiet_bd'     => $item->TietBatDau,
                'so_tiet'     => $item->SoTiet,
                'ma_lop_hp'   => $item->MaLopHP,
                'giang_vien'  => $item->TenGiangVien,
                'thoi_gian_lop' => [
                    'bat_dau'  => $item->NgayBatDauLop ?: $item->NgayBatDauHocKy,
                    'ket_thuc' => $item->NgayKetThucLop ?: $item->NgayKetThucHocKy,
                ]
            ]);

        return [
            'success' => true,
            'hoc_ky'  => $hocKy->TenHocKy,
            'nam_hoc' => $hocKy->namHoc->TenNamHoc ?? 'N/A',
            'range'   => ['start' => $startOfWeek, 'end' => $endOfWeek],
            'data'    => $schedules,
        ];
    }

    public function getLichThi(User $user, ?int $hocKyId = null): array
    {
        $sinhVien = $user->sinhVien;
        if (!$sinhVien) return ['success' => false, 'message' => 'Không tìm thấy sinh viên'];

        $hocKy = $hocKyId ? HocKy::with('namHoc')->find($hocKyId) : $this->getHocKyHienTai();
        if (!$hocKy) return ['success' => false, 'message' => 'Không xác định được học kỳ'];

        $lichThi = VLichThiSinhVien::where('SinhVienID', $sinhVien->SinhVienID)
            ->where('HocKyID', $hocKy->HocKyID)
            ->orderBy('NgayThi', 'asc')
            ->get()
            ->map(fn($item) => [
                'ten_mon'     => $item->TenMon,
                'ma_lop_hp'   => $item->MaLopHP,
                'ngay_thi'    => $item->NgayThi,
                'thu'         => Carbon::parse($item->NgayThi)->locale('vi')->dayName,
                'gio_thi'     => $item->GioBatDau ? substr($item->GioBatDau, 0, 5) : 'N/A',
                'phong_thi'   => $item->PhongThi,
                'hinh_thuc'   => $item->HinhThucThi,
                'giang_vien'  => $item->TenGiangVien,
                'ngay_hoc_ky' => [
                    'bat_dau'  => $item->NgayBatDauHocKy,
                    'ket_thuc' => $item->NgayKetThucHocKy
                ]
            ]);

        return [
            'success' => true,
            'hoc_ky'  => $hocKy->TenHocKy,
            'nam_hoc' => $hocKy->namHoc->TenNamHoc ?? 'N/A',
            'data'    => $lichThi
        ];
    }

    private function getHocKyHienTai()
    {
        return HocKy::with('namHoc')
            ->where('NgayBatDau', '<=', Carbon::today())
            ->where('NgayKetThuc', '>=', Carbon::today())
            ->first() ?? HocKy::orderBy('HocKyID', 'desc')->first();
    }
}