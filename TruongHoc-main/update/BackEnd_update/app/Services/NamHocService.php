<?php
namespace App\Services;

use App\Models\NamHoc;

class NamHocService
{
    public function getAll() {
        return NamHoc::with(['hocKy' => function($query) {
            $query->orderBy('LoaiHocKy', 'asc');
        }])->orderBy('NgayBatDau', 'desc')->get();
    }

    public function create(array $data) {
        return NamHoc::create($data);
    }

    public function update($id, array $data) {
        $namHoc = NamHoc::findOrFail($id);
        $namHoc->update($data);
        return $namHoc;
    }
}