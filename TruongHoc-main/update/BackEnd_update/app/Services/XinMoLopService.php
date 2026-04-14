<?php

namespace App\Services;

use App\Models\XinMoLop;
use App\Models\ChiTietPhieu;
use App\Models\LopHocPhan;
use App\Models\DangKyHocPhan;
use App\Models\LichHoc;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class XinMoLopService
{
    public function ghiDanhXinMoLop($data, $sinhVienId)
    {
        return DB::transaction(function () use ($data, $sinhVienId) {
            // 1. Kiểm tra đã đăng ký môn này trong học kỳ chưa (Giữ nguyên)
            $daHocMonNay = DangKyHocPhan::where('SinhVienID', $sinhVienId)
                ->whereHas('lopHocPhan', function ($q) use ($data) {
                    $q->where('HocKyID', $data['HocKyID'])
                    ->where('MonHocID', $data['MonHocID']);
                })->exists();

            if ($daHocMonNay) {
                throw new \Exception("Bạn đã đăng ký môn học này trong học kỳ này rồi.");
            }

            // 2. KIỂM TRA TRÙNG LỊCH DỰA TRÊN NGÀY HỌC CỤ THỂ
            // Logic: Tìm xem có bất kỳ bản ghi 'lichhoc' nào mà:
            // - Thuộc về các lớp sinh viên đã đăng ký trong học kỳ này.
            // - Ngày đó (NgayHoc) có Thứ trùng với Thứ sinh viên đang xin (data['Thu']).
            // - Trùng buổi học (BuoiHoc).

            $isTrungLich = DangKyHocPhan::where('SinhVienID', $sinhVienId)
                ->whereHas('lopHocPhan', function($q) use ($data) {
                    $q->where('HocKyID', $data['HocKyID']); // Chỉ xét các lớp trong học kỳ hiện tại
                })
                ->whereHas('lopHocPhan.lichHoc', function ($q) use ($data) {
                    // Ánh xạ Thứ tiếng Việt sang chỉ số WEEKDAY của MySQL
                    // MySQL WEEKDAY: 0 = Thứ 2, 1 = Thứ 3, ..., 6 = Chủ Nhật
                    $mapThuToWeekday = [
                        'Thứ Hai' => 0, '2' => 0,
                        'Thứ Ba'  => 1, '3' => 1,
                        'Thứ Tư'  => 2, '4' => 2,
                        'Thứ Năm' => 3, '5' => 3,
                        'Thứ Sáu' => 4, '6' => 4,
                        'Thứ Bảy' => 5, '7' => 5,
                        'Chủ Nhật'=> 6, '8' => 6,
                    ];

                    $weekdayIndex = $mapThuToWeekday[$data['Thu']] ?? 0;

                    // Sử dụng whereRaw để MySQL tự tính Thứ từ cột NgayHoc
                    $q->whereRaw("WEEKDAY(NgayHoc) = ?", [$weekdayIndex])
                    ->where('BuoiHoc', $data['BuoiHoc']);
                })
                ->exists();

            if ($isTrungLich) {
                throw new \Exception("Trùng lịch: Bạn đã có lịch học vào {$data['Thu']} ({$data['BuoiHoc']}) trong học kỳ này.");
            }

            // 3. Logic Nhóm nguyện vọng (Giữ nguyên vì bảng phieu_xin_mo_lop có cột Thu)
            $nhom = XinMoLop::where('MonHocID', $data['MonHocID'])
                ->where('HocKyID', $data['HocKyID'])
                ->where('Thu', $data['Thu'])
                ->where('BuoiHoc', $data['BuoiHoc'])
                ->where('TrangThai', 'Đang gom')
                ->lockForUpdate() 
                ->first();

            if (!$nhom) {
                $nhom = XinMoLop::create([
                    'MonHocID' => $data['MonHocID'],
                    'HocKyID'  => $data['HocKyID'],
                    'Thu'      => $data['Thu'],
                    'BuoiHoc'  => $data['BuoiHoc'],
                    'TrangThai' => 'Đang gom',
                    'SoLuongHienTai' => 0
                ]);
            }

            // 4. Lưu chi tiết phiếu (Dùng bảng chi_tiet_nguyen_vong như Model bạn gửi)
            $alreadyJoined = ChiTietPhieu::where('NhomID', $nhom->NhomID)
                ->where('SinhVienID', $sinhVienId)
                ->exists();

            if ($alreadyJoined) {
                throw new \Exception("Bạn đã tham gia nhóm nguyện vọng này rồi.");
            }

            ChiTietPhieu::create([
                'NhomID' => $nhom->NhomID,
                'SinhVienID' => $sinhVienId
            ]);

            $nhom->increment('SoLuongHienTai');

            return $nhom;
        });
    }

    public function huyXinMoLop($nhomId, $sinhVienId)
    {
        return DB::transaction(function () use ($nhomId, $sinhVienId) {
            $chiTiet = ChiTietPhieu::where('NhomID', $nhomId)
                ->where('SinhVienID', $sinhVienId)
                ->first();

            if (!$chiTiet) {
                throw new \Exception("Không tìm thấy bản đăng ký nguyện vọng.");
            }

            $chiTiet->delete();

            $nhom = XinMoLop::find($nhomId);
            if ($nhom && $nhom->SoLuongHienTai > 0) {
                $nhom->decrement('SoLuongHienTai');
            }

            return true;
        });
    }

    public function pheDuyetXinMoLop($nhomId, $giangVienId, $maLopHP, $soLuongToiDa, $ngayBD, $ngayKT)
    {
        return DB::transaction(function () use ($nhomId, $giangVienId, $maLopHP, $soLuongToiDa, $ngayBD, $ngayKT) {
            $nhom = XinMoLop::with('chiTiet')->lockForUpdate()->findOrFail($nhomId);

            if ($nhom->TrangThai !== 'Đang gom') {
                throw new \Exception("Nhóm này đã được xử lý hoặc không ở trạng thái chờ duyệt.");
            }

            $lopHP = LopHocPhan::create([
                'MonHocID'      => $nhom->MonHocID,
                'HocKyID'       => $nhom->HocKyID,
                'GiangVienID'   => $giangVienId,
                'MaLopHP'       => $maLopHP,
                'SoLuongToiDa'  => $soLuongToiDa,
                'NgayBatDau'    => $ngayBD,
                'NgayKetThuc'   => $ngayKT,
            ]);

            // Đăng ký tự động cho danh sách sinh viên trong nhóm
            foreach ($nhom->chiTiet as $ct) {
                DangKyHocPhan::create([
                    'SinhVienID'     => $ct->SinhVienID,
                    'LopHocPhanID'   => $lopHP->LopHocPhanID,
                    'ThoiGianDangKy' => now(),
                    'TrangThai'      => 'Đã đăng ký'
                ]);
            }

            $currentDate = Carbon::parse($ngayBD);
            $endDate = Carbon::parse($ngayKT);
            $tietBatDau = ($nhom->BuoiHoc == 'Sáng') ? 1 : (($nhom->BuoiHoc == 'Chiều') ? 6 : 11);

            $mapThu = [
                'Thứ Hai' => Carbon::MONDAY, '2' => Carbon::MONDAY,
                'Thứ Ba'  => Carbon::TUESDAY, '3' => Carbon::TUESDAY,
                'Thứ Tư'  => Carbon::WEDNESDAY, '4' => Carbon::WEDNESDAY,
                'Thứ Năm' => Carbon::THURSDAY, '5' => Carbon::THURSDAY,
                'Thứ Sáu' => Carbon::FRIDAY, '6' => Carbon::FRIDAY,
                'Thứ Bảy' => Carbon::SATURDAY, '7' => Carbon::SATURDAY,
                'Chủ Nhật' => Carbon::SUNDAY, '8' => Carbon::SUNDAY,
            ];

            $targetDay = $mapThu[$nhom->Thu] ?? Carbon::MONDAY;

            if ($currentDate->dayOfWeek !== $targetDay) {
                $currentDate->next($targetDay);
            }

            // Chạy vòng lặp tạo từng buổi học cho đến khi vượt quá ngày kết thúc
            while ($currentDate->lte($endDate)) {
                LichHoc::create([
                    'LopHocPhanID' => $lopHP->LopHocPhanID,
                    'NgayHoc'      => $currentDate->toDateString(),
                    'BuoiHoc'      => $nhom->BuoiHoc,
                    'TietBatDau'   => $tietBatDau,
                    'SoTiet'       => 4,
                    'PhongHoc'     => 'Phòng chờ sắp xếp',
                    'GhiChu'       => 'Lớp mở từ nguyện vọng sinh viên'
                ]);

                $currentDate->addWeek();
            }

            $nhom->update(['TrangThai' => 'Đã mở lớp']);

            return $lopHP;
        });
    }
}