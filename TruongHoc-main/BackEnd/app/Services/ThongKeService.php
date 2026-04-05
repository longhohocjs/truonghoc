<?php

namespace App\Services;

use App\Models\Khoa;
use App\Models\View\VBangDiemLopHocPhan;
use App\Models\View\VGpaHocKy;
use App\Models\View\VDanhSachLopGiangVien;
use Illuminate\Support\Facades\DB;

class ThongKeService
{
    public function thongKeSinhVienTheoKhoa()
    {
        return Khoa::withCount('nganhDaoTao as SoLuongNganh')
            ->get()
            ->map(function ($khoa) {
                return [
                    'TenKhoa' => $khoa->TenKhoa,
                    'SoLuongSinhVien' => DB::table('sinhvien')
                        ->join('lopsinhhoat', 'sinhvien.LopSinhHoatID', '=', 'lopsinhhoat.LopSinhHoatID')
                        ->where('lopsinhhoat.KhoaID', $khoa->KhoaID)
                        ->count()
                ];
            });
    }

    public function thongKeSiSoLop(array $filters)
    {
        return VDanhSachLopGiangVien::query()
            ->when($filters['HocKyID'] ?? null, function($q, $id) {
                return $q->where('HocKyID', $id);
            })
            ->get(['MaLopHP', 'TenMon', 'SoLuongToiDa', 'SoSinhVien']);
    }

    public function thongKeTyLeDauRot(int $lopHocPhanID)
    {
        $data = VBangDiemLopHocPhan::where('LopHocPhanID', $lopHocPhanID)->get();
        $tong = $data->count();
        
        if ($tong === 0) return ['dau' => 0, 'rot' => 0, 'tong' => 0];

        $dau = $data->where('DiemTongKet', '>=', 4.0)->count();
        $rot = $tong - $dau;

        return [
            'LopHocPhanID' => $lopHocPhanID,
            'TongSinhVien' => $tong,
            'SoLuongDau'   => $dau,
            'SoLuongRot'   => $rot,
            'TyLeDau'      => round(($dau / $tong) * 100, 2) . '%',
            'TyLeRot'      => round(($rot / $tong) * 100, 2) . '%'
        ];
    }

    public function thongKeGPATrungBinh($idHocKy) 
    {
        $ketQua = DB::table('diemso')
            ->join('dangkyhocphan', 'diemso.DangKyID', '=', 'dangkyhocphan.DangKyID')
            ->join('lophocphan', 'dangkyhocphan.LopHocPhanID', '=', 'lophocphan.LopHocPhanID')
            ->where('lophocphan.HocKyID', $idHocKy)
            ->select('diemso.*', 'dangkyhocphan.SinhVienID')
            ->get();

        return [
            'HocKyID' => $idHocKy,
            'SoLuongDiem' => $ketQua->count(),
            'DanhSach' => $ketQua
        ];
    }
}