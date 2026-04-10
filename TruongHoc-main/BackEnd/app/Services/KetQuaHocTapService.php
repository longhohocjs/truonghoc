<?php

namespace App\Services;

use App\Models\User;
use App\Models\View\VDiemHocKySinhVien;
use App\Models\View\VGpaHocKy;

class KetQuaHocTapService
{
    public function getKetQuaTongHop($user, $hocKyId = null): array
    {
        $sv = $user->sinhVien;
        if (!$sv) {
            return ['success' => false, 'data' => null, 'message' => 'Không tìm thấy sinh viên'];
        }

        $query = VDiemHocKySinhVien::where('SinhVienID', $sv->SinhVienID);
        if ($hocKyId) {
            $query->where('HocKyID', $hocKyId);
        }

        $diemChiTiet = $query->get()->map(function($item) {
            $diem10 = $item->DiemTongKet ?? $item->diem_tong_ket;
            $info4 = $this->quyDoiHe4($diem10);
            
            return [
                'ten_hoc_ky'   => $item->TenHocKy,
                'ma_mon'       => $item->MaMon,
                'ten_mon'      => $item->TenMon,
                'so_tin_chi'   => $item->SoTinChi,
                'diem_cc'      => $item->DiemChuyenCan ?? $item->diem_chuyen_can,
                'diem_gk'      => $item->DiemGiuaKy ?? $item->diem_giua_ky,
                'diem_thi'     => $item->DiemThi ?? $item->diem_thi,
                'diem_tk'      => $diem10,
                'diem_chu'     => $info4['chu'],
                'diem_he_4'    => $info4['so'],
            ];
        });

        $gpa = VGpaHocKy::where('SinhVienID', $sv->SinhVienID)
            ->when($hocKyId, fn($q) => $q->where('HocKyID', $hocKyId))
            ->orderBy('HocKyID', 'desc') // Lấy GPA của học kỳ mới nhất nếu không chọn cụ thể
            ->first();

        return [
            'success' => true,
            'data'    => [
                'diem_chi_tiet' => $diemChiTiet,
                'gpa_hoc_ky'    => $gpa ? [
                    'ten_hoc_ky'     => $gpa->TenHocKy,
                    'so_mon'         => $gpa->SoMon,
                    'tong_tin_chi'   => $gpa->TongTinChi,
                    'gpa'            => round($gpa->GPA_HocKy_TamTinh, 2),
                    'gpa_he_4'       => $this->tinhGpaHe4($diemChiTiet),
                ] : null,
            ],
            'message' => 'Lấy kết quả học tập thành công',
        ];
    }

    private function quyDoiHe4($diem) {
        if ($diem === null) return ['chu' => '-', 'so' => 0];
        if ($diem >= 8.5) return ['chu' => 'A', 'so' => 4.0];
        if ($diem >= 7.0) return ['chu' => 'B', 'so' => 3.0];
        if ($diem >= 5.5) return ['chu' => 'C', 'so' => 2.0];
        if ($diem >= 4.0) return ['chu' => 'D', 'so' => 1.0];
        return ['chu' => 'F', 'so' => 0.0];
    }

    private function tinhGpaHe4($dsDiem) {
        $tongDiemHe4 = 0;
        $tongTinChi = 0;
        foreach ($dsDiem as $d) {
            $tongDiemHe4 += ($d['diem_he_4'] * $d['so_tin_chi']);
            $tongTinChi += $d['so_tin_chi'];
        }
        return $tongTinChi > 0 ? round($tongDiemHe4 / $tongTinChi, 2) : 0;
    }
}