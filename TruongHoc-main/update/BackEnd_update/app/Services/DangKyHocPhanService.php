<?php

namespace App\Services;

use App\Models\LopHocPhan;
use App\Models\DangKyHocPhan;
use App\Models\ChuongTrinhDaoTao;
use App\Models\DotDangKy;
use App\Models\SinhVien;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DangKyHocPhanService
{
    public function validateAll(SinhVien $sinhVien, int $lopHocPhanID): array
    {
        $lop = LopHocPhan::with([
            'monHoc.monTienQuyet',
            'monHoc.monSongHanh',
            'lichHoc',
            'lichThi',
            'hocKy'
        ])->findOrFail($lopHocPhanID);

        $dot = DotDangKy::where('HocKyID', $lop->HocKyID)
            ->where('TrangThai', 1)
            ->first();

        if (!$dot || !$dot->isOpening()) {
            throw new Exception('Hiện tại không trong thời gian đăng ký học phần cho học kỳ này.');
        }

        if ($this->daDangKyMonTrongHocKy($sinhVien->SinhVienID, $lop->MonHocID, $lop->HocKyID)) {
            throw new Exception('Bạn đã đăng ký một lớp khác của môn học này trong học kỳ hiện tại.');
        }

        if (!$this->checkSiSo($lop)) {
            throw new Exception('Lớp học phần đã đầy sĩ số.');
        }

        if (!$this->checkMonTienQuyet($sinhVien->SinhVienID, $lop->monHoc)) {
            throw new Exception('Bạn chưa hoàn thành môn tiên quyết cho môn này.');
        }

        if (!$this->checkMonSongHanh($sinhVien->SinhVienID, $lop->monHoc)) {
            throw new Exception('Bạn cần đăng ký đồng thời môn song hành.');
        }

        if ($this->checkTrungLich($sinhVien, $lop)) {
            throw new Exception('Lịch học hoặc lịch thi bị trùng với lớp đã đăng ký.');
        }
        
        if ($lop->KhoahocAllowed !== null) {
            $allowed = explode(',', str_replace(' ', '', $lop->KhoahocAllowed));
            if (!in_array($sinhVien->khoahoc, $allowed)) {
                throw new Exception('Lớp học phần này không dành cho khóa ' . $sinhVien->khoahoc . ' của bạn.');
            }
        }

        return [
            'success' => true,
            'message' => 'Validate đăng ký thành công, có thể tiến hành đăng ký.',
        ];
    }

    private function daDangKyMonTrongHocKy(int $sinhVienID, int $monHocID, int $hocKyID): bool
    {
        try {
            return DB::table('v_dangkyhocphan_hien_tai')
                ->where('SinhVienID', $sinhVienID)
                ->where('MaMon', function ($q) use ($monHocID) {
                    $q->select('MaMon')->from('monhoc')->where('MonHocID', $monHocID);
                })
                ->exists();
        } catch (\Exception $e) {
            Log::warning("View v_dangkyhocphan_hien_tai lỗi, fallback query: " . $e->getMessage());

            return DangKyHocPhan::where('SinhVienID', $sinhVienID)
                ->whereHas('lopHocPhan', function ($q) use ($monHocID, $hocKyID) {
                    $q->where('MonHocID', $monHocID)
                        ->where('HocKyID', $hocKyID);
                })
                ->exists();
        }
    }

    private function checkSiSo(LopHocPhan $lop): bool
    {
        $daDangKy = $lop->dangKyHocPhan()->count();
        return $daDangKy < $lop->SoLuongToiDa;
    }

    private function checkMonTienQuyet(int $sinhVienID, $monHoc): bool
    {
        $tienQuyetIDs = $monHoc->monTienQuyet->pluck('MonHocID');

        if ($tienQuyetIDs->isEmpty()) {
            return true;
        }

        return DB::table('trangthai_monhoc_sinhvien')
            ->where('SinhVienID', $sinhVienID)
            ->whereIn('MonHocID', $tienQuyetIDs)
            ->where('TrangThai', 'Đã đạt')
            ->count() === $tienQuyetIDs->count();
    }

    private function checkMonSongHanh(int $sinhVienID, $monHoc): bool
    {
        $songHanhIDs = $monHoc->monSongHanh->pluck('MonHocID');

        if ($songHanhIDs->isEmpty()) {
            return true;
        }

        return DangKyHocPhan::where('SinhVienID', $sinhVienID)
            ->whereHas('lopHocPhan', fn($q) => $q->whereIn('MonHocID', $songHanhIDs))
            ->exists();
    }

    private function checkTrungLich(SinhVien $sinhVien, LopHocPhan $lopMoi): bool
    {
        $dangKyHienTai = $sinhVien->dangKyHocPhan()
            ->with(['lopHocPhan.lichHoc', 'lopHocPhan.lichThi'])
            ->get();

        foreach ($dangKyHienTai as $dk) {
            $lopCu = $dk->lopHocPhan;

            foreach ($lopMoi->lichHoc as $lhMoi) {
                foreach ($lopCu->lichHoc as $lhCu) {
                    if ($this->trungLich($lhMoi, $lhCu)) {
                        return true;
                    }
                }
            }

            foreach ($lopMoi->lichThi as $ltMoi) {
                foreach ($lopCu->lichThi as $ltCu) {
                    if ($this->trungLichThi($ltMoi, $ltCu)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private function trungLich($lh1, $lh2): bool
    {
        if ($lh1->NgayHoc !== $lh2->NgayHoc) {
            return false;
        }

        $tietBD1 = $lh1->TietBatDau;
        $tietKT1 = $tietBD1 + $lh1->SoTiet - 1;

        $tietBD2 = $lh2->TietBatDau;
        $tietKT2 = $tietBD2 + $lh2->SoTiet - 1;

        return !($tietKT1 < $tietBD2 || $tietKT2 < $tietBD1);
    }

    private function trungLichThi($lt1, $lt2): bool
    {
        if ($lt1->NgayThi !== $lt2->NgayThi) {
            return false;
        }

        $start1 = strtotime($lt1->GioBatDau);
        $end1   = strtotime($lt1->GioKetThuc);
        $start2 = strtotime($lt2->GioBatDau);
        $end2   = strtotime($lt2->GioKetThuc);

        if ($start1 === false || $end1 === false || $start2 === false || $end2 === false) {
            return false;
        }

        return !($end1 <= $start2 || $end2 <= $start1);
    }

    private function getCaThi(string $gioBatDau): ?int
    {
        $hour = (int) explode(':', $gioBatDau)[0];
        if ($hour >= 7 && $hour < 10) return 1;
        if ($hour >= 10 && $hour < 13) return 2;
        if ($hour >= 13 && $hour < 16) return 3;
        if ($hour >= 16) return 4;
        return null;
    }
}