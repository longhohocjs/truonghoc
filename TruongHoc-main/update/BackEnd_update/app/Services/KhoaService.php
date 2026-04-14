<?php

namespace App\Services;

use App\Models\Khoa;

class KhoaService
{
    public function getAll()
    {
        return Khoa::all();
    }

    public function create(array $data)
    {
        return Khoa::create($data);
    }

    public function update(array $data)
    {
        $id = $data['KhoaID'] ?? null;

        if (!$id) {
            throw new \Exception("Thiếu KhoaID để cập nhật.");
        }

        $khoa = Khoa::findOrFail($id);
        $khoa->update($data);
        return $khoa;
    }

    public function delete(array $data)
    {
        $id = $data['KhoaID'] ?? null;

        if (!$id) {
            throw new \Exception("Thiếu KhoaID để xóa.");
        }

        $khoa = Khoa::findOrFail($id);
        return $khoa->delete();
    }
}