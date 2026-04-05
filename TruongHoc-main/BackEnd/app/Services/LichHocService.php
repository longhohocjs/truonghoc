<?php

namespace App\Services;

use App\Models\LichHoc;
use App\Models\LopHocPhan;
use App\Models\DangKyHocPhan;
use App\Models\HocKy;
use Exception;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // Import Carbon for date handling

class LichHocService
{
    public function getDanhSachLopTheoKy($namHocId = null, $hocKyId = null)
    {
        $query = LopHocPhan::with(['monHoc', 'lichHoc', 'hocKy.namHoc']);

        if (!$hocKyId && !$namHocId) {
            $latestHocKy = HocKy::orderBy('HocKyID', 'desc')->first();
            $hocKyId = $latestHocKy ? $latestHocKy->HocKyID : null;
        }

        if ($hocKyId) {
            $query->where('HocKyID', $hocKyId);
        }

        if ($namHocId) {
            $query->whereHas('hocKy', function($q) use ($namHocId) {
                $q->where('NamHocID', $namHocId);
            });
        }

        return $query->get();
    }

    public function createLichHoc(array $data)
    {
        $lopHocPhanID = $data['LopHocPhanID'];
        $lichHocItems = $data['lich_hoc'];

        // Lấy thông tin lớp học phần để xác định ngày bắt đầu và kết thúc
        $lopHocPhan = LopHocPhan::findOrFail($lopHocPhanID);
        $lopNgayBatDau = Carbon::parse($lopHocPhan->NgayBatDau);
        $lopNgayKetThuc = Carbon::parse($lopHocPhan->NgayKetThuc);

        // Xóa tất cả lịch học cũ của lớp học phần này trước khi thêm mới (Sync logic)
        LichHoc::where('LopHocPhanID', $lopHocPhanID)->delete();

        foreach ($lichHocItems as $item) {
            $dayOfWeekFrontend = $item['NgayHoc']; // Thứ trong tuần từ Frontend (2=Thứ 2, ..., 8=Chủ Nhật)

            // Chuyển đổi thứ từ Frontend sang định dạng của Carbon (0=Chủ Nhật, 1=Thứ 2, ..., 6=Thứ 7)
            $carbonDayOfWeek = ($dayOfWeekFrontend == 8) ? Carbon::SUNDAY : ($dayOfWeekFrontend - 1);

            // Bắt đầu từ ngày bắt đầu của lớp học phần
            $currentDate = $lopNgayBatDau->copy();

            while ($currentDate->lte($lopNgayKetThuc)) {
                // Tìm ngày đầu tiên của thứ mong muốn (dayOfWeekFrontend) trên hoặc sau currentDate
                $dateToSave = $currentDate->copy()->next($carbonDayOfWeek);

                // Nếu ngày tìm được vượt quá ngày kết thúc của lớp, dừng lại
                if ($dateToSave->gt($lopNgayKetThuc)) {
                    break;
                }

                // Kiểm tra trùng lịch của sinh viên đã đăng ký cho ngày cụ thể này
                $this->checkTrungLichSinhVien(
                    $lopHocPhanID,
                    $dateToSave->toDateString(), // Truyền ngày cụ thể
                    $item['TietBatDau'],
                    $item['SoTiet']
                );

                // Tạo bản ghi mới cho từng buổi học vào ngày cụ thể
                LichHoc::create(array_merge($item, ['LopHocPhanID' => $lopHocPhanID, 'NgayHoc' => $dateToSave->toDateString()]));

                // Di chuyển đến ngày tiếp theo sau ngày đã lưu để tìm buổi học cùng thứ trong tuần kế tiếp
                $currentDate = $dateToSave->addDay();
            }
        }
        return ['message' => 'Lịch học đã được cập nhật thành công.'];
    }

    public function updateLichHoc($id, array $data)
    {
        $lich = LichHoc::findOrFail($id);
        $this->checkTrungLichSinhVien($lich->LopHocPhanID, $data['NgayHoc'], $data['TietBatDau'], $data['SoTiet'], $id);
        $lich->update($data);
        return $lich;
    }

    private function checkTrungLichSinhVien($lopID, $ngayHoc, $tietBD, $soTiet, $excludeId = null)
    {
        $tietKT = $tietBD + $soTiet - 1;
        $sinhVienIds = DangKyHocPhan::where('LopHocPhanID', $lopID)->pluck('SinhVienID');

        if ($sinhVienIds->isEmpty()) return;

        $trungLich = DB::table('lichhoc as lh')
            ->join('dangkyhocphan as dk', 'lh.LopHocPhanID', '=', 'dk.LopHocPhanID')
            ->whereIn('dk.SinhVienID', $sinhVienIds)
            ->where('lh.NgayHoc', $ngayHoc) // $ngayHoc giờ đây là chuỗi ngày tháng
            ->where(function($q) use ($tietBD, $tietKT) {
                $q->whereBetween('lh.TietBatDau', [$tietBD, $tietKT])
                  ->orWhereRaw('? BETWEEN lh.TietBatDau AND (lh.TietBatDau + lh.SoTiet - 1)', [$tietBD]);
            });

        if ($excludeId) {
            $trungLich->where('lh.LichHocID', '!=', $excludeId);
        } else {
            $trungLich->where('lh.LopHocPhanID', '!=', $lopID);
        }

        if ($trungLich->exists()) {
            throw new Exception("Trùng lịch học của sinh viên đã đăng ký lớp này!");
        }
    }
}