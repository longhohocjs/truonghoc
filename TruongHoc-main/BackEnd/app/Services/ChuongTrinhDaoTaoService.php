<?php

namespace App\Services;

use App\Models\ChuongTrinhDaoTao;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChuongTrinhDaoTaoService
{
    /**
     * Lấy toàn bộ chương trình đào tạo của sinh viên dựa trên ngành
     */
    public function getProgramByStudent(User $user)
    {
        $sinhVien = $user->sinhVien;

        if (!$sinhVien || !$sinhVien->NganhID) {
            return [
                'success' => false,
                'message' => 'Sinh viên chưa được gán vào ngành học cụ thể.'
            ];
        }

        $ctdt = ChuongTrinhDaoTao::with(['monHoc'])
            ->where('NganhID', $sinhVien->NganhID)
            ->orderBy('HocKyGoiY', 'asc')
            ->get();

        return [
            'success' => true,
            'data' => [
                'nganh' => $sinhVien->nganh->TenNganh ?? 'N/A',
                'chuong_trinh' => $ctdt
            ]
        ];
    }

    /**
     * Lấy danh sách chương trình đào tạo cho Admin với bộ lọc và phân trang.
     */
    public function layDanhSachCTDT(array $filters = [])
    {
        $query = ChuongTrinhDaoTao::with(['monHoc', 'nganhDaoTao.khoa']);

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

        $perPage = $filters['per_page'] ?? 10; // Default per_page
        return $query->paginate($perPage);
    }

    /**
     * Thêm môn học vào chương trình đào tạo.
     */
    public function themMonVaoCTDT(array $data): ChuongTrinhDaoTao
    {
        // Kiểm tra xem môn học đã tồn tại trong CTDT của ngành này chưa
        $exists = ChuongTrinhDaoTao::where('NganhID', $data['NganhID'])
                                   ->where('MonHocID', $data['MonHocID'])
                                   ->exists();
        if ($exists) {
            throw new \Exception('Môn học này đã có trong chương trình đào tạo của ngành.');
        }

        return ChuongTrinhDaoTao::create($data);
    }

    /**
     * Cập nhật môn học trong chương trình đào tạo.
     */
    public function capNhatMonTrongCTDT(ChuongTrinhDaoTao $ctdt, array $data): ChuongTrinhDaoTao
    {
        $ctdt->update($data);
        return $ctdt;
    }

    /**
     * Gán nhiều môn học vào chương trình đào tạo.
     */
    public function ganNhieuMonVaoCTDT(array $data): int
    {
        $insertedCount = 0;
        foreach ($data['MonHocIDs'] as $monHocID) {
            try {
                $this->themMonVaoCTDT([
                    'NganhID' => $data['NganhID'],
                    'MonHocID' => $monHocID,
                    'HocKyGoiY' => $data['HocKyGoiY'],
                    'BatBuoc' => $data['BatBuoc'],
                ]);
                $insertedCount++;
            } catch (\Exception $e) {
                // Bỏ qua nếu môn học đã tồn tại
                continue;
            }
        }
        return $insertedCount;
    }

    /**
     * Xóa môn học khỏi chương trình đào tạo.
     */
    public function xoaMonKhoiCTDT($id): void
    {
        $ctdt = ChuongTrinhDaoTao::findOrFail($id);
        // Có thể thêm kiểm tra ràng buộc ở đây nếu cần, ví dụ:
        // if ($ctdt->lopHocPhan()->exists()) {
        //     throw new \Exception('Không thể xóa môn học này vì đã có lớp học phần được mở.');
        // }
        $ctdt->delete();
    }
}