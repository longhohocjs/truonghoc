<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Khoa extends Model
{
    // Khai báo tên bảng chính xác trong DB của bạn
    protected $table = 'khoa';
    
    // Khai báo khóa chính (Laravel mặc định là 'id')
    protected $primaryKey = 'KhoaID';

    protected $fillable = ['MaKhoa', 'TenKhoa'];

    /**
     * Một Khoa có nhiều Ngành đào tạo
     */
    public function nganhs(): HasMany
    {
        return $this->hasMany(Nganh::class, 'KhoaID', 'KhoaID');
    }
}