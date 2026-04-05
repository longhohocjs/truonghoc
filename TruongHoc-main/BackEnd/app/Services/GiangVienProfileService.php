<?php

namespace App\Services;

use App\Models\GiangVien;
use Illuminate\Support\Facades\Hash;
use Exception;

class GiangVienProfileService
{
    public function getProfile($giangVienID)
    {
        return GiangVien::with(['khoa', 'user'])->findOrFail($giangVienID);
    }

    public function updateContactInfo($giangVienID, array $data)
    {
        $giangVien = GiangVien::findOrFail($giangVienID);
        $giangVien->update([
            'email' => $data['Email'] ?? $giangVien->email,
            'sodienthoai' => $data['SoDienThoai'] ?? $giangVien->sodienthoai,
        ]);
        return $giangVien;
    }

    public function changePassword($user, $oldPassword, $newPassword)
    {
        if (!Hash::check($oldPassword, $user->PasswordHash)) {
            throw new Exception("Mật khẩu cũ không chính xác.");
        }
        $user->update(['PasswordHash' => Hash::make($newPassword)]);
        return true;
    }
}