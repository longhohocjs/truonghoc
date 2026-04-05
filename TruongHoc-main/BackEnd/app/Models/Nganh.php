<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nganh extends Model
{
    // Tên bảng khớp với 'exists:nganhdaotao,NganhID' trong UserController
    protected $table = 'nganhdaotao';

    protected $primaryKey = 'NganhID';

    protected $fillable = ['MaNganh', 'TenNganh', 'KhoaID'];

    public function khoa()
    {
        return $this->belongsTo(Khoa::class, 'KhoaID', 'KhoaID');
    }
}