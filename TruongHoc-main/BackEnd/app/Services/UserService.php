<?php

namespace App\Services;

use App\Models\User;
use App\Models\SinhVien;
use App\Models\GiangVien;
use App\Models\Admin;
use App\Services\LogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    protected $logService;

    public function __construct(LogService $logService) {
        $this->logService = $logService;
    }

    public function getSinhVienList(array $filters)
    {
        $query = SinhVien::with(['user', 'khoa', 'nganh']);

        if (!empty($filters['KhoaID'])) {
            $query->where('KhoaID', $filters['KhoaID']);
        }

        if (!empty($filters['NganhID'])) {
            $query->where('NganhID', $filters['NganhID']);
        }

        if (!empty($filters['khoahoc'])) {
            $query->where('khoahoc', 'LIKE', '%' . $filters['khoahoc'] . '%');
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('HoTen', 'LIKE', '%' . $filters['search'] . '%')
                  ->orWhere('MaSV', 'LIKE', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('SinhVienID', 'desc')->paginate(15);
    }

    public function getStaffList(array $filters)
    {
        $roleId = $filters['RoleID'];

        if ($roleId == 2) {
            $query = GiangVien::with(['user', 'khoa']);
        } else {
            $query = Admin::with(['user']);
        }

        if (!empty($filters['search'])) {
            $query->where('HoTen', 'LIKE', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }

    public function createSinhVienWithAccount(array $data)
    {
        return DB::transaction(function () use ($data) {
            $password = !empty($data['sodienthoai']) ? $data['sodienthoai'] : '123456';

            $user = User::create([
                'Username'     => $data['MaSV'],
                'PasswordHash' => Hash::make($password),
                'RoleID'       => 3,
                'is_active'    => true
            ]);

            $sinhVien = SinhVien::create([
                'UserID'        => $user->UserID,
                'MaSV'          => $data['MaSV'],
                'HoTen'         => $data['HoTen'],
                'khoahoc'       => $data['khoahoc'],
                'KhoaID'        => $data['KhoaID'],
                'NganhID'       => $data['NganhID'],
                'email'         => $data['email'] ?? null,
                'sodienthoai'   => $data['sodienthoai'] ?? null,
                'TinhTrang'     => 'DangHoc'
            ]);
            $this->logService->write(
                'CREATE_USER', 
                "Tạo tài khoản và profile cho SV: {$sinhVien->HoTen} (MSV: {$sinhVien->MaSV})", 
                'sinhvien', 
                $sinhVien->SinhVienID
            );

            return $sinhVien;
        });
    }

    public function createStaffProfile(array $data, $roleId)
    {
        $insertData = $data;

        // Chuẩn hóa casing cho Admin (Email, SoDienThoai)
        if ($roleId == 1) {
            if (isset($insertData['email'])) {
                $insertData['Email'] = $insertData['email'];
            }
            if (isset($insertData['sodienthoai'])) {
                $insertData['SoDienThoai'] = $insertData['sodienthoai'];
            }
        }

        // Chuyển chuỗi rỗng thành null cho các trường có thể để trống
        foreach (['email', 'sodienthoai', 'Email', 'SoDienThoai', 'HocVi', 'ChuyenMon', 'MaGV'] as $field) {
            if (isset($insertData[$field]) && $insertData[$field] === '') {
                $insertData[$field] = null;
            }
        }

        if ($roleId == 2) {
            // Lọc chỉ lấy các trường có trong fillable của model
            $profile = GiangVien::create(array_intersect_key($insertData, array_flip((new GiangVien)->getFillable())));
            $this->logService->write('CREATE_STAFF', "Tạo hồ sơ giảng viên: {$profile->HoTen}", 'giangvien', $profile->GiangVienID);
            return $profile;
        } elseif ($roleId == 1) {
            $profile = Admin::create(array_intersect_key($insertData, array_flip((new Admin)->getFillable())));
            $this->logService->write('CREATE_STAFF', "Tạo hồ sơ Admin: {$profile->HoTen}", 'admin', $profile->AdminID);
            return $profile;
        }
        throw new \Exception("INVALID_ROLE");
    }

    public function createAccountForExistingStaff(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Kiểm tra hồ sơ tồn tại trước khi tạo User
            if ($data['RoleID'] == 2) {
                $profile = GiangVien::findOrFail($data['StaffID']);
            } else {
                $profile = Admin::findOrFail($data['StaffID']);
            }

            $user = User::create([
                'Username'     => $data['username'],
                'PasswordHash' => Hash::make($data['password']),
                'RoleID'       => $data['RoleID'],
                'is_active'    => true
            ]);

            // Cập nhật UserID vào hồ sơ đã tìm thấy
            $profile->UserID = $user->UserID;
            $profile->save();

            return $user;
        });
    }

    public function resetPassword($userId)
    {
        $user = User::findOrFail($userId);
        $user->PasswordHash = Hash::make('123456');
        $user->save();
        return $user;
    }

    public function updateUserStatus($userId)
    {
        $user = User::findOrFail($userId);
        $user->is_active = !$user->is_active;
        $user->save();
        return $user;
    }

    public function updateSinhVien($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $sv = SinhVien::findOrFail($id);
            
            // Nếu có thay đổi MaSV, cập nhật luôn Username trong bảng users
            if (!empty($data['MaSV']) && $data['MaSV'] !== $sv->MaSV) {
                User::where('UserID', $sv->UserID)->update([
                    'Username' => $data['MaSV']
                ]);
            }

            // Chuẩn bị dữ liệu để cập nhật, chuyển chuỗi rỗng thành null cho các trường nullable
            $updateData = $data;
            if (isset($updateData['email']) && $updateData['email'] === '') {
                $updateData['email'] = null;
            }
            if (isset($updateData['sodienthoai']) && $updateData['sodienthoai'] === '') {
                $updateData['sodienthoai'] = null;
            }

            $this->logService->write('UPDATE_USER', "Cập nhật hồ sơ SV: {$sv->MaSV}", 'sinhvien', $sv->SinhVienID);            
            
            // Chỉ lấy các trường có trong fillable của model để tránh gửi thừa dữ liệu gây lỗi trigger
            $sv->update(array_intersect_key($updateData, array_flip($sv->getFillable())));
            return $sv->fresh();
        });
    }

    public function updateStaff($id, array $data, $roleId)
    {
        if ($roleId == 2) {
            $profile = GiangVien::findOrFail($id);
        } else {
            $profile = Admin::findOrFail($id);
        }

        // Chuẩn bị dữ liệu để cập nhật, chuyển chuỗi rỗng thành null cho các trường nullable
        $updateData = $data;

        // Xử lý casing cho Admin (Email, SoDienThoai) để khớp với Model Admin.php
        if ($roleId == 1) {
            if (isset($updateData['email'])) {
                $updateData['Email'] = ($updateData['email'] === '') ? null : $updateData['email'];
            }
            if (isset($updateData['sodienthoai'])) {
                $updateData['SoDienThoai'] = ($updateData['sodienthoai'] === '') ? null : $updateData['sodienthoai'];
            }
        } else {
            if (isset($updateData['email']) && $updateData['email'] === '') {
                $updateData['email'] = null;
            }
            if (isset($updateData['sodienthoai']) && $updateData['sodienthoai'] === '') {
                $updateData['sodienthoai'] = null;
            }
        }

        if (isset($updateData['HocVi']) && $updateData['HocVi'] === '') {
            $updateData['HocVi'] = null;
        }
        if (isset($updateData['ChuyenMon']) && $updateData['ChuyenMon'] === '') {
            $updateData['ChuyenMon'] = null;
        }

        $this->logService->write('UPDATE_USER', "Cập nhật hồ sơ nhân sự ID: {$id}", 'staff', $id);        
        
        // Lọc chỉ lấy các trường hợp lệ trong fillable
        $profile->update(array_intersect_key($updateData, array_flip($profile->getFillable())));
        return $profile;
    }

    public function deleteUser($userId)
    {
        return DB::transaction(function () use ($userId) {
            $user = User::findOrFail($userId);
            
            // Tìm và xóa các hồ sơ liên quan trước khi xóa User
            if ($user->RoleID == 3) {
                SinhVien::where('UserID', $userId)->delete();
            } elseif ($user->RoleID == 2) {
                GiangVien::where('UserID', $userId)->delete();
            } elseif ($user->RoleID == 1) {
                Admin::where('UserID', $userId)->delete();
            }

            $this->logService->write(
                'DELETE_USER', 
                "Xóa tài khoản và hồ sơ liên quan của: {$user->Username} (ID: {$userId})", 
                'users', 
                $userId
            );
            
            return $user->delete();
        });
    }

    public function deleteStaffProfile($id, $roleId)
    {
        if ($roleId == 2) {
            $profile = GiangVien::findOrFail($id);
            $this->logService->write('DELETE_STAFF', "Xóa hồ sơ giảng viên: {$profile->HoTen}", 'giangvien', $id);
        } else {
            $profile = Admin::findOrFail($id);
            $this->logService->write('DELETE_STAFF', "Xóa hồ sơ Admin: {$profile->HoTen}", 'admin', $id);
        }
        return $profile->delete();
    }
}