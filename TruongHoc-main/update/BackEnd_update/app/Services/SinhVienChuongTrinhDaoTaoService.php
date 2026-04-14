<?php

namespace App\Services;

use App\Models\User;
use App\Models\View\VSinhVienChuongTrinhDaoTao;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SinhVienChuongTrinhDaoTaoService
{
    public function getChuongTrinhDaoTao(User $user): array
    {
        $sv = $user->sinhVien;
        if (!$sv) {
            throw new ModelNotFoundException('Không tìm thấy sinh viên.');
        }

        $ctdt = VSinhVienChuongTrinhDaoTao::where('SinhVienID', $sv->SinhVienID)
            ->get()
            ->map(fn($item) => [
                'ma_mon'       => $item->MaMon,
                'ten_mon'      => $item->TenMon,
                'so_tin_chi'   => $item->SoTinChi,
                'hoc_ky_goi_y' => $item->HocKyGoiY,
                'bat_buoc'     => (bool) $item->BatBuoc,
            ]);

        return [
            'success' => true,
            'data'    => [
                'nganh' => [
                    'ma_nganh'  => $sv->nganh->MaNganh ?? 'N/A',
                    'ten_nganh' => $sv->nganh->TenNganh ?? 'N/A',
                ],
                'chuong_trinh' => $ctdt,
                'tong_mon'     => $ctdt->count(),
            ],
            'message' => 'Lấy chương trình đào tạo thành công',
        ];
    }

    public function getMonDaHocVaDiemTotNhat(User $user)
    {
        $sv = $user->sinhVien;
        if (!$sv) {
            throw new ModelNotFoundException('Không tìm thấy thông tin sinh viên.');
        }

        $dangKy = $sv->dangKyHocPhan()
            ->with(['lopHocPhan.monHoc', 'diemSo'])
            ->get();

        $grouped = $dangKy->groupBy(function ($dk) {
            return $dk->lopHocPhan->monHoc->MonHocID ?? null;
        })->filter(function ($group) {
            return $group->isNotEmpty();
        });

        $result = $grouped->map(function ($group) {
            $mon = $group->first()->lopHocPhan->monHoc;

            $diemCacLan = $group->map(function ($dk) {
                return $dk->diemSo ? $dk->diemSo->DiemTongKet : null;
            })->filter()->values();

            $diemTotNhat = $diemCacLan->isNotEmpty() ? $diemCacLan->max() : null;
            $soLanHoc   = $group->count();

            return [
                'mon_hoc_id'    => $mon->MonHocID,
                'ma_mon'        => $mon->MaMon ?? 'N/A',
                'ten_mon'       => $mon->TenMon ?? 'N/A',
                'tin_chi'       => $mon->SoTinChi ?? null,
                'diem_tot_nhat' => $diemTotNhat,
                'so_lan_hoc'    => $soLanHoc,
                'da_dat'        => $diemTotNhat !== null && $diemTotNhat >= 5.0,
            ];
        })->values();

        return $result;
    }

    public function getMonDaHoanThanh(User $user)
    {
        $monDaHoc = $this->getMonDaHocVaDiemTotNhat($user);

        return $monDaHoc
            ->filter(function ($item) {
                return $item['da_dat'];
            })
            ->map(function ($item) {
                return [
                    'ma_mon'       => $item['ma_mon'],
                    'ten_mon'      => $item['ten_mon'],
                    'tin_chi'      => $item['tin_chi'],
                    'diem'         => $item['diem_tot_nhat'],
                    'so_lan_hoc'   => $item['so_lan_hoc'],
                ];
            })
            ->values()
            ->toArray();
    }

    public function getMonConThieu(User $user)
    {
        $sv = $user->sinhVien;
        if (!$sv || !$sv->NganhID) {
            throw new ModelNotFoundException('Không tìm thấy ngành học.');
        }

        $ctdt = $sv->nganh->chuongTrinhDaoTao()
            ->with('monHoc')
            ->get()
            ->map(function ($ct) {
                return [
                    'mon_hoc_id'   => $ct->MonHocID,
                    'ma_mon'       => $ct->monHoc->MaMon ?? 'N/A',
                    'ten_mon'      => $ct->monHoc->TenMon ?? 'N/A',
                    'tin_chi'      => $ct->monHoc->SoTinChi ?? null,
                    'hoc_ky_goi_y' => $ct->HocKyGoiY,
                    'bat_buoc'     => (bool) $ct->BatBuoc,
                ];
            });

        $monDaHoc = $this->getMonDaHocVaDiemTotNhat($user)
            ->keyBy('mon_hoc_id');

        $conThieu = $ctdt->filter(function ($monCT) use ($monDaHoc) {
            $daHoc = $monDaHoc->get($monCT['mon_hoc_id']);
            return !$daHoc || !$daHoc['da_dat'];
        })->map(function ($monCT) use ($monDaHoc) {
            $daHoc = $monDaHoc->get($monCT['mon_hoc_id']);

            $monCT['diem_tot_nhat'] = $daHoc ? $daHoc['diem_tot_nhat'] : null;
            $monCT['so_lan_hoc']    = $daHoc ? $daHoc['so_lan_hoc'] : 0;
            $monCT['da_dat']        = false;

            return $monCT;
        })->values()->toArray();

        return $conThieu;
    }
}