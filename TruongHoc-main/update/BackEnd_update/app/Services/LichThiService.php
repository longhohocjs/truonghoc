<?php

namespace App\Services;

use App\Models\LichThi;
use App\Models\DangKyHocPhan;
use Exception;
use Illuminate\Support\Facades\DB;

class LichThiService
{
    public function createLichThi(array $data)
    {
        $lopHocPhanID = $data['LopHocPhanID'];
        $lichThiItems = $data['lich_thi'];

        // Xóa tất cả lịch thi cũ của lớp học phần này trước khi thêm mới (Sync logic)
        LichThi::where('LopHocPhanID', $lopHocPhanID)->delete();

        foreach ($lichThiItems as $item) {
            // Kiểm tra trùng lịch của sinh viên đã đăng ký
            $this->checkTrungLichThi($lopHocPhanID, $item['NgayThi'], $item['GioBatDau'], $item['GioKetThuc']);
            
            // Tạo bản ghi mới cho từng buổi thi
            LichThi::create(array_merge($item, ['LopHocPhanID' => $lopHocPhanID]));
        }

        return ['message' => 'Lịch thi đã được cập nhật thành công.'];
    }

    public function updateLichThi($id, array $data)
    {
        $lichThi = LichThi::findOrFail($id);
        $this->checkTrungLichThi($lichThi->LopHocPhanID, $data['NgayThi'], $data['GioBatDau'], $data['GioKetThuc'], $id);
        $lichThi->update($data);
        return $lichThi;
    }

    private function checkTrungLichThi($lopID, $ngayThi, $gioBD, $gioKT, $excludeId = null)
    {
        $sinhVienIds = DangKyHocPhan::where('LopHocPhanID', $lopID)->pluck('SinhVienID');
        if ($sinhVienIds->isEmpty()) return;

        $trung = DB::table('lichthi as lt')
            ->join('dangkyhocphan as dk', 'lt.LopHocPhanID', '=', 'dk.LopHocPhanID')
            ->whereIn('dk.SinhVienID', $sinhVienIds)
            ->where('lt.NgayThi', $ngayThi)
            ->where(function($q) use ($gioBD, $gioKT) {
                $q->where(function($query) use ($gioBD, $gioKT) {
                    $query->where('lt.GioBatDau', '<', $gioKT)
                          ->where('lt.GioKetThuc', '>', $gioBD);
                });
            });

        if ($excludeId) {
            $trung->where('lt.LichThiID', '!=', $excludeId);
        } else {
            $trung->where('lt.LopHocPhanID', '!=', $lopID);
        }

        if ($trung->exists()) {
            throw new Exception("Trùng lịch thi của sinh viên đã đăng ký lớp này!");
        }
    }
}