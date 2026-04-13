<?php

namespace App\Services;

use App\Models\User;
use App\Models\HocKy;
use App\Models\DangKyHocPhan;
use Carbon\Carbon;

class SinhVienLichService
{
    public function getLichHoc(User $user, ?int $hocKyId = null, ?string $date = null): array
    {
        $sinhVien = $user->sinhVien;
        if (!$sinhVien) return ['success' => false, 'message' => 'Không tìm thấy sinh viên'];

        $hocKy = $hocKyId ? HocKy::with('namHoc')->find($hocKyId) : $this->getHocKyHienTai($sinhVien->SinhVienID);
        if (!$hocKy) return ['success' => false, 'message' => 'Không xác định được học kỳ'];

        $targetDate = $date ? Carbon::parse($date) : Carbon::today();
        $startOfWeek = $targetDate->copy()->startOfWeek()->format('Y-m-d');
        $endOfWeek   = $targetDate->copy()->endOfWeek()->format('Y-m-d');

        $registrations = DangKyHocPhan::where('SinhVienID', $sinhVien->SinhVienID)
            ->where('TrangThai', 'ThanhCong')
            ->whereHas('lopHocPhan', fn($q) => $q->where('HocKyID', $hocKy->HocKyID))
            ->with(['lopHocPhan.monHoc', 'lopHocPhan.giangVien', 'lopHocPhan.hocKy', 'lopHocPhan.lichHoc' => function($q) use ($startOfWeek, $endOfWeek) {
                $q->whereBetween('NgayHoc', [$startOfWeek, $endOfWeek]);
            }])
            ->get();

        $schedules = $registrations->flatMap(function($dk) {
            return $dk->lopHocPhan->lichHoc->map(fn($lh) => [
                'ngay_hoc'    => $lh->NgayHoc,
                'thu'         => Carbon::parse($lh->NgayHoc)->locale('vi')->dayName,
                'ten_mon'     => $dk->lopHocPhan->monHoc->TenMon ?? 'N/A',
                'phong'       => $lh->PhongHoc,
                'phong_hoc'   => $lh->PhongHoc,
                'tiet_bd'     => $lh->TietBatDau,
                'so_tiet'     => $lh->SoTiet,
                'ma_lop_hp'   => $dk->lopHocPhan->MaLopHP,
                'giang_vien'  => $dk->lopHocPhan->giangVien->HoTen ?? 'N/A',
                'thoi_gian_lop' => [
                    'bat_dau'  => $dk->lopHocPhan->NgayBatDau ?: $dk->lopHocPhan->hocKy->NgayBatDau,
                    'ket_thuc' => $dk->lopHocPhan->NgayKetThuc ?: $dk->lopHocPhan->hocKy->NgayKetThuc,
                ]
            ]);
        })->sortBy(['ngay_hoc', 'tiet_bd'])->values()->all();

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

        $hocKy = $hocKyId ? HocKy::with('namHoc')->find($hocKyId) : $this->getHocKyHienTai($sinhVien->SinhVienID);
        if (!$hocKy) return ['success' => false, 'message' => 'Không xác định được học kỳ'];

        $registrations = DangKyHocPhan::where('SinhVienID', $sinhVien->SinhVienID)
            ->where('TrangThai', 'ThanhCong')
            ->whereHas('lopHocPhan', fn($q) => $q->where('HocKyID', $hocKy->HocKyID))
            ->with(['lopHocPhan.monHoc', 'lopHocPhan.giangVien', 'lopHocPhan.hocKy', 'lopHocPhan.lichThi'])
            ->get();

        $lichThi = $registrations->flatMap(function($dk) use ($sinhVien) {
            return $dk->lopHocPhan->lichThi->map(fn($lt) => [
                'ma_mon'      => $dk->lopHocPhan->monHoc->MaMon ?? 'N/A',
                'ten_mon'     => $dk->lopHocPhan->monHoc->TenMon ?? 'N/A',
                'ma_lop_hp'   => $dk->lopHocPhan->MaLopHP,
                'ngay_thi'    => $lt->NgayThi,
                'thu'         => $lt->NgayThi ? Carbon::parse($lt->NgayThi)->locale('vi')->dayName : 'N/A',
                'gio_thi'     => ($lt->GioBatDau && $lt->GioKetThuc) ? Carbon::parse($lt->GioBatDau)->format('H:i') . ' - ' . Carbon::parse($lt->GioKetThuc)->format('H:i') : 'N/A',
                'gio'         => $lt->GioBatDau ? Carbon::parse($lt->GioBatDau)->format('H:i') : 'N/A',
                'gio_bat_dau' => $lt->GioBatDau ? Carbon::parse($lt->GioBatDau)->format('H:i') : 'N/A',
                'gio_ket_thuc'=> $lt->GioKetThuc ? Carbon::parse($lt->GioKetThuc)->format('H:i') : 'N/A',
                'ca_thi'      => $this->getCaThi($lt->GioBatDau),
                'phong_thi'   => $lt->PhongThi ?? 'Chưa bố trí',
                'hinh_thuc'   => $lt->HinhThucThi ?? 'Tập trung',
                'sbd'         => $sinhVien->MaSV ?? $sinhVien->ma_sv ?? 'N/A', // Sử dụng toán tử ?? để lấy chuỗi thực tế
                'giang_vien'  => $dk->lopHocPhan->giangVien->HoTen ?? 'N/A',
                'ngay_hoc_ky' => [
                    'bat_dau'  => $dk->lopHocPhan->hocKy->NgayBatDau ?? null,
                    'ket_thuc' => $dk->lopHocPhan->hocKy->NgayKetThuc ?? null
                ]
            ]);
        })->sortBy('ngay_thi')->values()->all();

        return [
            'success' => true,
            'hoc_ky'  => $hocKy->TenHocKy,
            'nam_hoc' => $hocKy->namHoc->TenNamHoc ?? 'N/A',
            'data'    => $lichThi
        ];
    }

    private function getHocKyHienTai($sinhVienID = null)
    {
        // 1. Ưu tiên cao nhất: Học kỳ của đợt đăng ký đang mở (Context quan trọng nhất)
        $activeDot = \App\Models\DotDangKy::where('TrangThai', 1)
            ->where('NgayBatDau', '<=', now())
            ->where('NgayKetThuc', '>=', now())
            ->latest()
            ->first();
        
        if ($activeDot) {
            return HocKy::with('namHoc')->find($activeDot->HocKyID);
        }

        // 2. Tìm học kỳ theo ngày hiện tại
        $current = HocKy::with('namHoc')
            ->where('NgayBatDau', '<=', Carbon::today())
            ->where('NgayKetThuc', '>=', Carbon::today())
            ->first();

        if ($current) return $current;

        // 2. Nếu không có học kỳ hiện tại (thời gian nghỉ), tìm học kỳ gần nhất mà sinh viên có đăng ký
        if ($sinhVienID) {
            $latestReg = DangKyHocPhan::where('SinhVienID', $sinhVienID)
                ->where('TrangThai', 'ThanhCong')
                ->whereHas('lopHocPhan')
                ->with('lopHocPhan.hocKy.namHoc')
                ->latest('ThoiGianDangKy')
                ->first();
            
            if ($latestReg && $latestReg->lopHocPhan && $latestReg->lopHocPhan->hocKy) {
                return $latestReg->lopHocPhan->hocKy;
            }
        }

        // 3. Fallback cuối cùng lấy học kỳ mới nhất
        return HocKy::with('namHoc')->orderBy('HocKyID', 'desc')->first();
    }

    private function getCaThi(?string $gioBatDau): ?int
    {
        if (!$gioBatDau) return null;
        $hour = (int) explode(':', $gioBatDau)[0];
        if ($hour >= 7 && $hour < 10) return 1;
        if ($hour >= 10 && $hour < 13) return 2;
        if ($hour >= 13 && $hour < 16) return 3;
        if ($hour >= 16) return 4;
        return null;
    }
}