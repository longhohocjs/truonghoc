<?php
namespace App\Services;

use App\Models\HocKy;

class HocKyService
{
    public function getAllWithNamHoc() {
        return HocKy::with('namHoc')->get();
    }

    public function create(array $data) {
        return HocKy::create($data);
    }

    public function update($id, array $data) {
        $hocKy = HocKy::findOrFail($id);
        $hocKy->update($data);
        return $hocKy;
    }
}