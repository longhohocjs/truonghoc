<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function storeSinhVien(Request $request)
    {
        $data = $request->validate([
            'MaSV'        => 'required|unique:sinhvien,MaSV|unique:users,Username',
            'HoTen'       => 'required',
            'khoahoc'     => 'required',
            'KhoaID'      => 'required|exists:khoa,KhoaID',
            'NganhID'     => 'required|exists:nganhdaotao,NganhID',
            'sodienthoai' => 'nullable|string',
            'email'       => 'nullable|email'
        ]);

        try {
            $result = $this->userService->createSinhVienWithAccount($data);
            return response()->json([
                'status' => 'success',
                'data' => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function storeStaffProfile(Request $request)
    {
        $request->validate([
            'MaGV' => 'nullable|string|max:20|unique:giangvien,MaGV',
            'RoleID' => 'required|in:1,2',
            'HoTen' => 'required',
            'email' => 'required|email',
            'sodienthoai' => 'nullable',
            'KhoaID' => 'required_if:RoleID,2|exists:khoa,KhoaID',
            'HocVi' => 'nullable',
            'ChuyenMon' => 'nullable'
        ]);

        try {
            $profile = $this->userService->createStaffProfile($request->except('RoleID'), $request->RoleID);
            return response()->json([
                'status' => 'success',
                'data' => $profile
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function indexSinhVien(Request $request)
    {
        $filters = $request->only(['KhoaID', 'NganhID', 'khoahoc', 'search']);

        try {
            $data = $this->userService->getSinhVienList($filters);
            return response()->json([
                'status' => 'success',
                'count'  => $data->total(),
                'data'   => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function indexStaff(Request $request)
    {
        $roleId = $request->input('RoleID');
        
        if (!$roleId) {
            $roleId = $request->is('*giang-vien*') ? 2 : 1;
        }

        $filters = [
            'RoleID' => $roleId,
            'search' => $request->input('search')
        ];

        try {
            $data = $this->userService->getStaffList($filters);
            
            return response()->json([
                'status' => 'success',
                'type'   => $roleId == 2 ? 'GIANG_VIEN' : 'ADMIN',
                'count'  => $data->total(),
                'data'   => $data
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function assignAccount(Request $request)
    {
        $request->validate([
            'StaffID' => 'required',
            'RoleID' => 'required|in:1,2',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:6'
        ]);

        try {
            $user = $this->userService->createAccountForExistingStaff($request->all());
            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleStatus(Request $request)
    {
        try {
            $user = $this->userService->updateUserStatus($request->UserID);
            return response()->json([
                'status' => 'success',
                'is_active' => $user->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $this->userService->resetPassword($request->UserID);
            return response()->json([
                'status' => 'success',
                'message' => 'PASSWORD_RESET_DEFAULT'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSinhVien(Request $request)
    {
        $data = $request->validate([
            'SinhVienID'  => 'required|exists:sinhvien,SinhVienID',
            'MaSV'        => 'sometimes|required|unique:sinhvien,MaSV,' . $request->SinhVienID . ',SinhVienID',
            'HoTen'       => 'sometimes|required',
            'NgaySinh'    => 'sometimes|nullable|date',
            'KhoaID'      => 'sometimes|required|exists:khoa,KhoaID',
            'NganhID'     => 'sometimes|required|exists:nganhdaotao,NganhID',
            'email'       => 'sometimes|nullable|email',
            'sodienthoai' => 'sometimes|nullable',
            'TinhTrang'   => 'sometimes|required',
            'khoahoc'     => 'sometimes|nullable'
        ]);

        try {
            $id = $data['SinhVienID'];
            unset($data['SinhVienID']); // Xóa ID khỏi mảng dữ liệu update để tránh lỗi SQL

            $result = $this->userService->updateSinhVien($id, $data);
            return response()->json(['status' => 'success', 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function updateStaff(Request $request)
    {
        $data = $request->validate([
            'StaffID'     => 'required',
            'MaGV'        => 'sometimes|nullable|string|max:20',
            'RoleID'      => 'required|in:1,2',
            'HoTen'       => 'sometimes|required',
            'email'       => 'sometimes|nullable|email',
            'sodienthoai' => 'sometimes|nullable',
            'KhoaID'      => 'sometimes|required_if:RoleID,2|exists:khoa,KhoaID',
            'HocVi'       => 'sometimes|nullable',
            'ChuyenMon'   => 'sometimes|nullable'
        ]);

        try {
            $id = $data['StaffID'];
            $roleId = $data['RoleID'];
            unset($data['StaffID'], $data['RoleID']); // Xóa các trường định danh và Role

            $result = $this->userService->updateStaff($id, $data, $roleId);
            return response()->json(['status' => 'success', 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->userService->deleteUser($id);
            return response()->json(['status' => 'success', 'message' => 'Xóa tài khoản thành công']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroyStaffProfile($id, $roleId)
    {
        try {
            $this->userService->deleteStaffProfile($id, $roleId);
            return response()->json(['status' => 'success', 'message' => 'Xóa hồ sơ thành công']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}