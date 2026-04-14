<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XinMoLop extends Model
{
    protected $table = 'phieu_xin_mo_lop';
    protected $primaryKey = 'NhomID';
    
    protected $fillable = [
        'MonHocID', 
        'HocKyID', 
        'Thu', 
        'BuoiHoc', 
        'SoLuongHienTai', 
        'TrangThai'
    ];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'MonHocID', 'MonHocID');
    }

    public function hocKy()
    {
        return $this->belongsTo(HocKy::class, 'HocKyID', 'HocKyID');
    }

    public function chiTiet()
    {
        return $this->hasMany(ChiTietPhieu::class, 'NhomID', 'NhomID');
    }
}