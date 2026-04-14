<?php

namespace App\Http\Controllers\Api\SinhVien;

use App\Http\Controllers\Controller;
use App\Services\SinhVienProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    protected $profileService;

    public function __construct(SinhVienProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $result = $this->profileService->getSinhVienProfile($user);

        if (!$result['success']) {
            return $this->error($result['message'], 404);
        }

        return $this->success($result['data'], 'Lấy thông tin cá nhân thành công');
    }

    public function updateContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'       => 'nullable|email|max:255|unique:users,Email,' . $request->user()->UserID . ',UserID',
            'sodienthoai' => 'nullable|string|max:15|regex:/^([0-9\s\-\+\(\)]*)$/',
        ]);

        try {
            $updated = $this->profileService->updateContact(
                $request->user(),
                $request->only(['email', 'sodienthoai'])
            );

            return $this->success(
                $updated,
                'Cập nhật thông tin liên lạc thành công'
            );
        } catch (\Exception $e) {
            return $this->error(
                $e->getMessage(),
                422
            );
        }
    }

    public function studyInfo(Request $request): JsonResponse
    {
        $user = $request->user();

        $studyData = $this->profileService->getStudyInformation($user);

        return $this->success(
            $studyData,
            'Lấy thông tin học tập thành công'
        );
    }
}