<?php

namespace App\Services;

use App\Models\ChuongTrinhDaoTao;
use App\Services\LogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ChuongTrinhDaoTaoService
{
    protected $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    public function layDanhSachCTDT(array $filters)
    {
        $query = ChuongTrinhDaoTao::with(['nganhDaoTao.khoa', 'monHoc']);

        if (!empty($filters['KhoaID'])) {
            $query->whereHas('nganhDaoTao', function ($q) use ($filters) {
                $q->where('KhoaID', $filters['KhoaID']);
            });
        }

        if (!empty($filters['NganhID'])) {
            $query->where('NganhID', $filters['NganhID']);
        }

        if (!empty($filters['HocKyGoiY'])) {
            $query->where('HocKyGoiY', $filters['HocKyGoiY']);
        }

        if (!empty($filters['search'])) {
            $query->whereHas('monHoc', function ($q) use ($filters) {
                $q->where('TenMon', 'like', '%' . $filters['search'] . '%')
                ->orWhere('MaMon', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('ID', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function themMonVaoCTDT(array $data): ChuongTrinhDaoTao
    {
        $exists = ChuongTrinhDaoTao::where('NganhID', $data['NganhID'])
            ->where('MonHocID', $data['MonHocID'])
            ->exists();

        if ($exists) {
            throw new \Exception('Môn học này đã tồn tại trong chương trình đào tạo của ngành.');
        }

        $ctdt = ChuongTrinhDaoTao::create([
            'NganhID'     => $data['NganhID'],
            'MonHocID'    => $data['MonHocID'],
            'HocKyGoiY'   => $data['HocKyGoiY'],
            'BatBuoc'     => $data['BatBuoc'],
        ]);

        $this->ghiLog('TAO_CTDT', "Thêm môn {$data['MonHocID']} vào CTĐT ngành {$data['NganhID']}");

        return $ctdt;
    }

    public function capNhatMonTrongCTDT(ChuongTrinhDaoTao $ctdt, array $data): ChuongTrinhDaoTao
    {
        $ctdt->update([
            'HocKyGoiY' => $data['HocKyGoiY'] ?? $ctdt->HocKyGoiY,
            'BatBuoc'   => $data['BatBuoc'] ?? $ctdt->BatBuoc,
        ]);

        $this->ghiLog('CAP_NHAT_CTDT', "Cập nhật môn {$ctdt->MonHocID} trong CTĐT ngành {$ctdt->NganhID}");

        return $ctdt;
    }

    public function ganNhieuMonVaoCTDT(array $data): int
    {
        $inserted = 0;
        $nganhID = $data['NganhID'];
        $hocKy = $data['HocKyGoiY'];
        $batBuoc = $data['BatBuoc'];

        foreach ($data['MonHocIDs'] as $monID) {
            $exists = ChuongTrinhDaoTao::where('NganhID', $nganhID)
                ->where('MonHocID', $monID)
                ->exists();

            if (!$exists) {
                ChuongTrinhDaoTao::create([
                    'NganhID'     => $nganhID,
                    'MonHocID'    => $monID,
                    'HocKyGoiY'   => $hocKy,
                    'BatBuoc'     => $batBuoc,
                ]);
                $inserted++;
            }
        }

        if ($inserted > 0) {
            $this->ghiLog('GAN_NHIEU_MON_CTDT', "Gán {$inserted} môn vào CTĐT ngành {$nganhID}");
        }

        return $inserted;
    }

    public function xoaMonKhoiCTDT(int $id): bool
    {
        $ctdt = ChuongTrinhDaoTao::findOrFail($id);
        $this->ghiLog('XOA_CTDT', "Xóa môn {$ctdt->MonHocID} khỏi CTĐT ngành {$ctdt->NganhID}");
        return $ctdt->delete();
    }

    private function ghiLog(string $hanhDong, string $moTa): void
    {
        $this->logService->write($hanhDong, $moTa, 'chuongtrinhdaotao');
    }
}