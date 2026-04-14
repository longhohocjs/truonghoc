<?php

namespace App\Services;

use App\Models\ThongBao;

class ThongBaoService
{
    public function getThongBaoSinhVien($perPage = 10)
    {
        return ThongBao::active()
            ->where(function ($query) {
                $query->where('DoiTuong', 'SinhVien')
                      ->orWhere('DoiTuong', 'TatCa');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getThongBaoChiTiet($id)
    {
        return ThongBao::active()
            ->where('ThongBaoID', $id)
            ->where(function ($query) {
                $query->where('DoiTuong', 'SinhVien')
                      ->orWhere('DoiTuong', 'TatCa');
            })
            ->firstOrFail();
    }
}