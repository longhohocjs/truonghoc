<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\LopHocPhan;
use App\Models\DotDangKy;
use App\Models\DangKyHocPhan;
use App\Models\YeuCauMoLop;
use App\Models\LichThi;
use App\Services\StoreProcedure\HuyDangKyHocPhanService;
use App\Jobs\ProcessDangKyHocPhan;

class DangKyHocPhanController extends Controller
{
    public function getLopMo()
    {
        $dotMo = DotDangKy::where('TrangThai', 1)
            ->where('NgayBatDau', '<=', now())
            ->where('NgayKetThuc', '>=', now())
            ->pluck('HocKyID');

        if ($dotMo->isEmpty()) {
            return response()->json(['message' => 'Ngoài thời gian đăng ký'], 400);
        }

        $lops = LopHocPhan::withCount(['dangKyHocPhan as SoLuongHienTai' => function($query) {
            $query->where('TrangThai', 'ThanhCong');
        }])
        ->with([
            'monHoc.monTienQuyet' => fn($q) => $q->wherePivot('Loai', 1),
            'monHoc.monSongHanh' => fn($q) => $q->wherePivot('Loai', 2),
            'giangVien', 
            'lichHoc'
        ])
            ->whereIn('HocKyID', $dotMo)
            ->get();

        // Map dữ liệu để thêm chuỗi tên môn tiên quyết/song hành cho sinh viên dễ xem
        $data = $lops->map(function ($lop) {
            $lop->MonTienQuyet = $lop->monHoc->monTienQuyet->pluck('TenMon')->implode(', ') ?: 'Không có';
            $lop->MonSongHanh = $lop->monHoc->monSongHanh->pluck('TenMon')->implode(', ') ?: 'Không có';
            return $lop;
        });

        return response()->json($data);
    }

    public function dangKy(Request $request)
    {
        $validated = $request->validate([
            'LopHocPhanID' => 'required|integer|exists:lophocphan,LopHocPhanID',
        ]);

        $user = $request->user(); 
        $sinhVien = $user->sinhVien;
        $lopHocPhanID = (int) $validated['LopHocPhanID'];

        if (!$sinhVien) {
            return response()->json(['message' => 'Không tìm thấy thông tin sinh viên.'], 404);
        }

        try {
            $statusKey = "registration_status:{$sinhVien->SinhVienID}:{$lopHocPhanID}";
            
            // Xóa trạng thái cũ (Dùng Cache::forget để linh hoạt driver)
            Cache::forget($statusKey);

            $lockKey = "lock:lophocphan:{$lopHocPhanID}:reserve";
            $lock = Cache::lock($lockKey, 10);

            if (!$lock->get()) {
                return response()->json([
                    'status'  => 'failed',
                    'message' => 'Lớp đang được nhiều bạn đăng ký cùng lúc. Vui lòng thử lại sau 5-10 giây.'
                ], 429);
            }

            ProcessDangKyHocPhan::dispatch(
                $user->UserID,
                $sinhVien->SinhVienID,
                $lopHocPhanID
            )->onQueue('registration')
             ->afterCommit(); // Chỉ đẩy vào queue sau khi các DB logic trước đó thành công

            return response()->json([
                'status'  => 'processing',
                'message' => 'Yêu cầu đăng ký đã được gửi. Hệ thống đang xử lý... Kết quả sẽ có trong vài giây.'
            ]);
        } catch (\Exception $e) {
            // Bắt mọi lỗi liên quan đến kết nối Redis/Cache/Queue
            \Illuminate\Support\Facades\Log::error("Lỗi đăng ký học phần (Redis/Queue): " . $e->getMessage());
            return response()->json([
                'status'  => 'failed',
                'message' => 'Dịch vụ đăng ký tạm thời gián đoạn (Lỗi kết nối máy chủ xử lý). Vui lòng thử lại sau.'
            ], 503);
        } finally {
            if (isset($lock)) $lock->release();
        }
    }

    public function checkStatus(Request $request, $lhpID)
    {
        $sinhVien = $request->user()->sinhVien;
        
        if (!$sinhVien) {
            return response()->json(['message' => 'Không tìm thấy thông tin sinh viên.'], 404);
        }

        $svID = $sinhVien->SinhVienID;
        $statusKey = "registration_status:{$svID}:{$lhpID}";

        try {
            $status = Cache::get($statusKey);

            if (!$status) {
                return response()->json([
                    'status'  => 'processing',
                    'message' => 'Yêu cầu đang được xếp hàng xử lý...'
                ]);
            }

            if ($status === 'success') {
                return response()->json([
                    'status'  => 'success',
                    'message' => 'Chúc mừng! Bạn đã đăng ký học phần thành công.'
                ]);
            }

            return response()->json([
                'status'  => 'failed',
                'message' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể kiểm tra trạng thái lúc này.'
            ], 500);
        }
    }

    public function huyMon(Request $request, $dangKyID)
    {
        $service = app(HuyDangKyHocPhanService::class);
        $user = $request->user();
        $sinhVien = $user->sinhVien;

        // Lấy thông tin đăng ký trước khi hủy để có LopHocPhanID cập nhật sĩ số sau khi xóa
        $dangKy = DangKyHocPhan::where('DangKyID', $dangKyID)->first();
        
        if (!$dangKy) {
            return response()->json(['message' => 'Thông tin đăng ký không tồn tại hoặc đã được hủy trước đó.'], 404);
        }

        if ($dangKy->SinhVienID !== $sinhVien->SinhVienID) {
            return response()->json(['message' => 'Bạn không có quyền hủy học phần của sinh viên khác.'], 403);
        }

        return DB::transaction(function () use ($service, $dangKy, $dangKyID, $user) {
            try {
                $lopId = $dangKy->LopHocPhanID;

                // 1. Xóa bản ghi điểm rỗng
                DB::table('diemso')->where('DangKyID', $dangKyID)->delete();

                // 2. Ép trạng thái về chuẩn 'ThanhCong' để Procedure SELECT được dữ liệu
                DB::table('dangkyhocphan')
                    ->where('DangKyID', $dangKyID)
                    ->update(['TrangThai' => 'ThanhCong']);

                // 3. Gọi Service hủy
                $result = $service->huyDangKy((int)$dangKyID, (int)$user->UserID);

                if ($result['success']) {
                    // Cập nhật lại cache sĩ số lớp học phần
                    $lop = LopHocPhan::find($lopId);
                    if ($lop) {
                        $currentCount = DangKyHocPhan::where('LopHocPhanID', $lopId)->where('TrangThai', 'ThanhCong')->count();
                        $remaining = max(0, $lop->SoLuongToiDa - $currentCount);
                        Cache::put("lophocphan:{$lopId}:slots", $remaining, 3600);
                    }
                    return response()->json(['message' => $result['message']]);
                }

                return response()->json(['message' => $result['message']], 400);
            } catch (\Exception $innerEx) {
                return response()->json(['message' => 'Lỗi logic hủy: ' . $innerEx->getMessage()], 400);
            }
        });
    }

    public function getDaDangKy(Request $request)
    {
        $sinhVien = $request->user()->sinhVien;

        // Tìm đợt đăng ký đang mở phù hợp với thời gian hiện tại
        $dot = DotDangKy::where('TrangThai', 1)
            ->where('NgayBatDau', '<=', now())
            ->where('NgayKetThuc', '>=', now())
            ->first();

        // Nếu không có đợt đang mở, lấy đợt gần nhất để xem lại kết quả đã đăng ký
        if (!$dot) {
            $dot = DotDangKy::where('TrangThai', 1)
                ->orderByDesc('NgayKetThuc')
                ->first();
        }

        if (!$dot) {
            return response()->json([
                'message' => 'Hiện tại không có thông tin đợt đăng ký nào.'
            ], 404);
        }

        $danhSach = DangKyHocPhan::where('SinhVienID', $sinhVien->SinhVienID)
            ->where('TrangThai', 'ThanhCong')
            ->whereHas('lopHocPhan', function ($query) use ($dot) {
                $query->where('HocKyID', $dot->HocKyID);
            })
            ->with([
                'lopHocPhan.monHoc',
                'lopHocPhan.giangVien',
                'lopHocPhan.lichHoc'
            ])
            ->get();

        return response()->json([
            'hoc_ky' => $dot->TenDot,
            'data'   => $danhSach
        ]);
    }

    public function getDanhSachYeuCau(Request $request) {
        $sinhVien = $request->user()->sinhVien;
        if (!$sinhVien) return response()->json([], 404);

        $data = YeuCauMoLop::with('mon_hoc')
            ->where('SinhVienID', $sinhVien->SinhVienID)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($data);
    }

    public function guiYeuCauMoLop(Request $request) {
        $validated = $request->validate([
            'monHocID' => 'required|integer|exists:monhoc,MonHocID',
            'lyDo'     => 'required|string|max:1000',
        ]);

        $sinhVien = $request->user()->sinhVien;
        if (!$sinhVien) return response()->json(['message' => 'Không tìm thấy SV'], 404);

        YeuCauMoLop::create([
            'SinhVienID' => $sinhVien->SinhVienID,
            'MonHocID'   => $validated['monHocID'],
            'LyDo'       => $validated['lyDo'],
            'TrangThai'  => 0,
        ]);

        return response()->json(['success' => true, 'message' => 'Gửi yêu cầu thành công']);
    }

    private function trungLichThi(LichThi $lt1, LichThi $lt2): bool
    {
        // Nếu ngày thi khác nhau → không trùng
        if ($lt1->NgayThi != $lt2->NgayThi) {
            return false;
        }

        // Chuyển giờ thành timestamp (dùng strtotime)
        $start1 = strtotime($lt1->GioBatDau);
        $end1   = strtotime($lt1->GioKetThuc);
        $start2 = strtotime($lt2->GioBatDau);
        $end2   = strtotime($lt2->GioKetThuc);

        // Nếu có giờ nào không parse được → coi như không trùng (an toàn)
        if ($start1 === false || $end1 === false || $start2 === false || $end2 === false) {
            return false;
        }

        // Trùng nếu khoảng thời gian giao nhau
        return !($end1 <= $start2 || $end2 <= $start1);
    }
}