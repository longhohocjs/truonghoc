<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LopHocPhan extends Model
{
    protected $table = 'lophocphan';
    protected $primaryKey = 'LopHocPhanID';
    public $timestamps = false;

    protected $fillable = [
        'MonHocID',
        'HocKyID',
        'GiangVienID',
        'MaLopHP',
        'SoLuongToiDa',
        'KhoahocAllowed',
        'NgayBatDau',
        'NgayKetThuc'
    ];

protected $casts = [
    'NgayBatDau' => 'date',
    'NgayKetThuc' => 'date',
];

    public function monHoc()
    {
        return $this->belongsTo(MonHoc::class, 'MonHocID', 'MonHocID');
    }

    public function giangVien()
    {
        return $this->belongsTo(GiangVien::class, 'GiangVienID', 'GiangVienID');
    }

    public function dangKyHocPhan()
    {
        return $this->hasMany(DangKyHocPhan::class, 'LopHocPhanID', 'LopHocPhanID');
    }

    public function lichHoc() {
        return $this->hasMany(LichHoc::class, 'LopHocPhanID', 'LopHocPhanID');
    }

    public function lichThi() {
        return $this->hasMany(LichThi::class, 'LopHocPhanID', 'LopHocPhanID');
    }

    public function hocKy() {
        return $this->belongsTo(HocKy::class, 'HocKyID', 'HocKyID');
    }
}