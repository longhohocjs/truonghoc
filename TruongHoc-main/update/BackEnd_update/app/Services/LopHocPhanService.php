<?php

namespace App\Services;

use App\Models\LopHocPhan;
use App\Models\LichHoc;
use App\Models\LichThi;
use App\Models\GiangVien;
use App\Models\DangKyHocPhan;
use App\Models\DiemSo;
use App\Models\View\VDanhSachLopGiangVien;
use App\Models\View\VSinhVienTrongLopHocPhan;
use App\Services\StoreProcedure\NhapDiemService;
use App\Services\StoreProcedure\TinhDiemTongKetService;
use App\Services\LogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;

class LopHocPhanService
{
    protected $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    public function getLopPhanCong($giangVienID)
    {
        return VDanhSachLopGiangVien::where('GiangVienID', $giangVienID)
            ->orderByDesc('TenHocKy')
            ->get()
            ->map(fn($item) => [
                'lop_hoc_phan_id' => $item->LopHocPhanID,
                'ma_lop_hp'       => $item->MaLopHP,
                'ten_mon'         => $item->TenMon ?? 'Chưa có môn',
                'so_tin_chi'      => $item->SoTinChi ?? 0,
                'nam_hoc'         => $item->NamHoc ?? 'Chưa có',
                'ten_hoc_ky'      => $item->TenHocKy,
                'so_luong_toi_da' => $item->SoLuongToiDa,
                'so_sinh_vien'    => $item->SoSinhVien,
                'si_so'           => $item->SiSo, 
                'giang_vien'      => [
                    'ho_ten' => $item->TenGiangVien,
                    'hoc_vi' => $item->HocVi,
                ],
            ]);
    }

    public function getSinhVienTrongLop($lopHocPhanID)
    {
        $lop = LopHocPhan::with(['hocKy.namHoc'])->findOrFail($lopHocPhanID);
        $namHoc = $lop->hocKy->namHoc->TenNamHoc ?? 'Chưa có';

        return VSinhVienTrongLopHocPhan::where('LopHocPhanID', $lopHocPhanID)
            ->orderBy('HoTenSinhVien', 'asc')
            ->get()
            ->map(fn($item) => [
                'sinh_vien_id'      => $item->SinhVienID,
                'ma_sv'             => $item->MaSV,
                'ho_ten'            => $item->HoTenSinhVien,
                'email'             => $item->Email,
                'so_dien_thoai'     => $item->SoDienThoai,
                'thoi_gian_dang_ky' => $item->ThoiGianDangKy,
                'trang_thai'        => $item->TrangThai,
                'nam_hoc'           => $namHoc,
            ]);
    }

    public function getDanhSachIn($lopHocPhanID): array
    {
        $lop = LopHocPhan::with(['monHoc', 'hocKy', 'giangVien'])->findOrFail($lopHocPhanID);
        $sinhVien = $this->getSinhVienTrongLop($lopHocPhanID);

        return [
            'meta' => [
                'ma_lop_hp'   => $lop->MaLopHP,
                'ten_mon'     => $lop->monHoc->TenMon ?? 'N/A',
                'ten_hoc_ky'  => $lop->hocKy->TenHocKy ?? 'N/A',
                'giang_vien'  => $lop->giangVien->HoTen ?? 'N/A',
            ],
            'danh_sach' => $sinhVien,
        ];
    }

    public function capNhatDiemSinhVien(array $data)
    {
        $dangKy = DangKyHocPhan::where('LopHocPhanID', $data['lop_hoc_phan_id'])
            ->where('SinhVienID', $data['sinh_vien_id'])
            ->firstOrFail();

        $userID = Auth::id(); 

        $nhapDiemService = app(NhapDiemService::class);
        
        $dataDiem = [
            'diem_chuyen_can' => $data['diem_chuyen_can'] ?? null,
            'diem_giua_ky'    => $data['diem_giua_ky'] ?? null,
            'diem_thi'        => $data['diem_thi'] ?? null,
        ];

        $resNhapDiem = $nhapDiemService->capNhatDiem(
            $dangKy->DangKyID,
            $dataDiem,
            $userID
        );

        if (!$resNhapDiem['success']) {
            return $resNhapDiem;
        }

        if (isset($data['diem_thi'])) {
            $tinhDiemService = app(TinhDiemTongKetService::class);
            $tinhDiemService->tinhDiem($dangKy->DangKyID, $userID);
        }

        return [
            'success' => true,
            'message' => 'Cập nhật điểm thành công và đã tính toán lại tổng kết.',
        ];
    }

    /**
     * Tạo mới lớp học phần
     */
    public function taoLop(array $data): LopHocPhan
    {
        return DB::transaction(function () use ($data) {
            $lop = LopHocPhan::create([
                'MonHocID'     => $data['MonHocID'],
                'HocKyID'      => $data['HocKyID'],
                'GiangVienID'  => $data['GiangVienID'] ?? null,
                'MaLopHP'      => $data['MaLopHP'],
                'SoLuongToiDa' => $data['SoLuongToiDa'] ?? 80,
                'KhoahocAllowed' => $data['KhoahocAllowed'] ?? null,
                'NgayBatDau'   => $data['NgayBatDau'],
                'NgayKetThuc'  => $data['NgayKetThuc'],
            ]);

            $this->log('TAO_LOP_HOC_PHAN', "Tạo lớp {$lop->MaLopHP} (ID: {$lop->LopHocPhanID})");

            return $lop;
        });
    }

    public function capNhat(LopHocPhan $lop, array $data): LopHocPhan
    {
        $lop->update([
            'MaLopHP'      => $data['MaLopHP']      ?? $lop->MaLopHP,
            'SoLuongToiDa' => $data['SoLuongToiDa'] ?? $lop->SoLuongToiDa,
            'KhoahocAllowed' => $data['KhoahocAllowed'] ?? $lop->KhoahocAllowed,
            'NgayBatDau'   => $data['NgayBatDau']   ?? $lop->NgayBatDau,
            'NgayKetThuc'  => $data['NgayKetThuc']  ?? $lop->NgayKetThuc,
        ]);

        $this->log('CAP_NHAT_LOP_HP', "Cập nhật lớp {$lop->MaLopHP}");

        return $lop;
    }

    public function phanCongGiangVien(LopHocPhan $lop, ?int $giangVienId): LopHocPhan
    {
        if ($giangVienId !== null) {
            GiangVien::findOrFail($giangVienId);
        }

        $lop->update(['GiangVienID' => $giangVienId]);

        $moTa = $giangVienId 
            ? "Phân công GV ID {$giangVienId} cho lớp {$lop->MaLopHP}"
            : "Bỏ phân công giảng viên lớp {$lop->MaLopHP}";

        $this->log('PHAN_CONG_GV', $moTa);

        return $lop;
    }

    public function capNhatSiSo(LopHocPhan $lop, int $siSo): LopHocPhan
    {
        $lop->update(['SoLuongToiDa' => $siSo]);

        $this->log('CAP_NHAT_SISO', "Cập nhật sĩ số lớp {$lop->MaLopHP} → {$siSo}");

        return $lop;
    }

    private function log(string $hanhDong, string $moTa, int $id = null): void
    {
        $this->logService->write($hanhDong, $moTa, 'lophocphan', $id);
    }
}