<?php

namespace App\Services;

use App\Models\NganhDaoTao;

class NganhDaoTaoService
{
    public function getAll()
    {
        return NganhDaoTao::with('khoa')->get();
    }

    public function create(array $data)
    {
        return NganhDaoTao::create($data);
    }
    
    public function update($id, array $data)
    {
        $nganh = NganhDaoTao::find($id);
        
        if (!$nganh) {
            return null; 
        }

        $nganh->update($data);
        return $nganh;
    }

    public function delete($id)
    {
        $nganh = NganhDaoTao::findOrFail($id);
        return $nganh->delete();
    }
}