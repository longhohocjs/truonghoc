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

        $updateData = [];
        if (array_key_exists('email', $data)) {
            $updateData['email'] = $data['email'] ?: null;
        }
        if (array_key_exists('sodienthoai', $data)) {
            $updateData['sodienthoai'] = $data['sodienthoai'] ?: null;
        }

        $giangVien->update($updateData);
        // Nạp lại các quan hệ để Frontend hiển thị đầy đủ thông tin sau khi cập nhật
        return $giangVien->load(['khoa', 'user']);
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