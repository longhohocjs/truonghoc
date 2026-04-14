<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;
use App\Models\DangKyHocPhan;
use App\Models\LopHocPhan;
use App\Models\SinhVien;
use App\Services\DangKyHocPhanService;
use Throwable;

class ProcessDangKyHocPhan implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $userId;
    public $sinhVienID;
    public $lopHocPhanID;
    public $tries = 3; 
    public $backoff = 5;

    public function __construct(int $userId, int $sinhVienID, int $lopHocPhanID)
    {
        $this->userId = $userId;
        $this->sinhVienID = $sinhVienID;
        $this->lopHocPhanID = $lopHocPhanID;
    }

    public function handle(DangKyHocPhanService $dangKyService): void
    {
        $statusKey = "registration_status:{$this->sinhVienID}:{$this->lopHocPhanID}";
        $slotsKey = "lophocphan:{$this->lopHocPhanID}:slots";

        try {
            DB::transaction(function () use ($dangKyService, $statusKey, $slotsKey) {
                
                $exists = DangKyHocPhan::where('SinhVienID', $this->sinhVienID)
                    ->where('LopHocPhanID', $this->lopHocPhanID)
                    ->exists();

                if ($exists) {
                    Redis::set($statusKey, 'Bạn đã đăng ký môn học này rồi.', 'EX', 300);
                    return;
                }

                $lop = LopHocPhan::where('LopHocPhanID', $this->lopHocPhanID)
                    ->lockForUpdate()
                    ->first();

                if (!$lop) {
                    throw new \Exception('Lớp học phần không tồn tại.');
                }

                $currentCount = DangKyHocPhan::where('LopHocPhanID', $this->lopHocPhanID)->count();
                if ($currentCount >= $lop->SoLuongToiDa) {
                    throw new \Exception('Lớp đã đầy sĩ số.');
                }

                $sinhVien = SinhVien::findOrFail($this->sinhVienID);
                $validation = $dangKyService->validateAll($sinhVien, $this->lopHocPhanID);
                
                if (!$validation['success']) {
                    throw new \Exception($validation['message']);
                }

                DangKyHocPhan::create([
                    'SinhVienID'     => $this->sinhVienID,
                    'LopHocPhanID'   => $this->lopHocPhanID,
                    'UserID'         => $this->userId,
                    'ThoiGianDangKy' => now(),
                    'TrangThai'      => 'DaDangKy', 
                ]);

                if (Redis::exists($slotsKey)) {
                    Redis::decr($slotsKey);
                }

                Redis::set($statusKey, 'success', 'EX', 600);
            }, 5);

        } catch (Throwable $e) {
            $this->handleJobError($e, $statusKey);
        }
    }

    protected function handleJobError(Throwable $e, string $statusKey): void
    {
        $userErrors = ['lớp đã đầy', 'trùng lịch', 'tiên quyết', 'không tồn tại', 'đã đăng ký'];
        $isUserError = false;
        $message = mb_strtolower($e->getMessage());

        foreach ($userErrors as $errorPart) {
            if (str_contains($message, $errorPart)) {
                $isUserError = true;
                break;
            }
        }

        if ($isUserError) {
            Redis::set($statusKey, $e->getMessage(), 'EX', 300);
            Log::warning("Registration logic error: " . $e->getMessage());
        } else {
            Log::error("System error in Job: " . $e->getMessage());
            Redis::set($statusKey, 'Hệ thống đang bận, vui lòng thử lại sau.', 'EX', 60);
            throw $e; 
        }
    }

    public function failed(Throwable $exception): void
    {
        $statusKey = "registration_status:{$this->sinhVienID}:{$this->lopHocPhanID}";
        Redis::set($statusKey, 'Đăng ký thất bại hệ thống. Vui lòng thử lại.', 'EX', 300);
    }
}