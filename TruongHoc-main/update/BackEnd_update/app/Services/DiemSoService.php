<?php

namespace App\Services;

use App\Models\DiemRenLuyen;
use App\Models\LopHocPhan;
use App\Models\View\VBangDiemLopHocPhan;
use App\Models\View\VDiemRenLuyenSinhVien;
use App\Services\StoreProcedure\NhapDiemService;
use App\Services\StoreProcedure\TinhDiemTongKetService;
use App\Services\StoreProcedure\TinhGpaHocKyService;
use App\Services\LogService;
use Illuminate\Support\Facades\DB;

class DiemSoService
{
    protected $nhapDiemSP;
    protected $tinhDiemTongKetSP;
    protected $tinhGpaSP;
    protected $logService;

    public function __construct(
        NhapDiemService $nhapDiemSP,
        TinhDiemTongKetService $tinhDiemTongKetSP,
        TinhGpaHocKyService $tinhGpaSP,
        LogService $logService
    ) {
        $this->nhapDiemSP = $nhapDiemSP;
        $this->tinhDiemTongKetSP = $tinhDiemTongKetSP;
        $this->tinhGpaSP = $tinhGpaSP;
        $this->logService = $logService;
    }

    public function getBangDiemLopHP(array $filters)
    {
        return VBangDiemLopHocPhan::query()
            ->when($filters['LopHocPhanID'] ?? null, function($q, $id) {
                return $q->where('LopHocPhanID', $id);
            })
            ->get();
    }

    public function getDiemRenLuyen(array $filters)
    {
        return VDiemRenLuyenSinhVien::query()
            ->when($filters['HocKyID'] ?? null, function($q, $id) {
                return $q->where('HocKyID', $id);
            })
            ->when($filters['LopSinhHoatID'] ?? null, function($q, $id) {
                return $q->whereIn('SinhVienID', function($sub) use ($id) {
                    $sub->select('SinhVienID')->from('sinhvien')->where('LopSinhHoatID', $id);
                });
            })
            ->get();
    }

    public function capNhatDiemLopHP(array $data, int $userID)
    {
        $lopHPID = $data['LopHocPhanID'];
        $lop = LopHocPhan::findOrFail($lopHPID);

        if ($lop->TrangThaiNhapDiem == 1) {
            throw new \Exception("Lớp học phần này đã bị khóa nhập điểm.");
        }

        return DB::transaction(function () use ($data, $userID, $lopHPID) {
            foreach ($data['DanhSachDiem'] as $diem) {
                $this->nhapDiemSP->capNhatDiem($diem['DangKyID'], [
                    'diem_chuyen_can' => $diem['DiemChuyenCan'] ?? null,
                    'diem_giua_ky'    => $diem['DiemGiuaKy'] ?? null,
                    'diem_thi'         => $diem['DiemThi'] ?? null,
                ], $userID);

                $this->tinhDiemTongKetSP->tinhDiem($diem['DangKyID'], $userID);
            }

            $this->logService->write(
                'Cập nhật điểm học phần', 
                "Người dùng ID $userID đã cập nhật điểm cho lớp HP ID $lopHPID", 
                'lophocphan', 
                $lopHPID
            );

            return true;
        });
    }

    public function capNhatDiemRenLuyen(array $data)
    {
        return DB::transaction(function () use ($data) {
            foreach ($data['DanhSachDRL'] as $item) {
                DiemRenLuyen::updateOrCreate(
                    ['SinhVienID' => $item['SinhVienID'], 'HocKyID' => $data['HocKyID']],
                    ['TongDiem' => $item['TongDiem'], 'XepLoai' => $item['XepLoai'], 'NgayDanhGia' => now()]
                );
            }

            $this->logService->write(
                'Cập nhật điểm rèn luyện', 
                "Cập nhật điểm rèn luyện học kỳ ID " . $data['HocKyID'], 
                'diemrenluyen'
            );
            
            return true;
        });
    }

    public function setLockStatus(int $lopHPID, int $status)
    {
        $statusText = $status == 1 ? "Khóa" : "Mở khóa";
        $result = LopHocPhan::where('LopHocPhanID', $lopHPID)->update(['TrangThaiNhapDiem' => $status]);
        
        if($result) {
            $this->logService->write(
                "$statusText nhập điểm", 
                "Thực hiện $statusText chức năng nhập điểm cho lớp HP ID $lopHPID", 
                'lophocphan', 
                $lopHPID
            );
        }
        return $result;
    }
}