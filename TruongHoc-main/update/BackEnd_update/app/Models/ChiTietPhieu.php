<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChiTietPhieu extends Model
{
    protected $table = 'chi_tiet_phieu';
    protected $primaryKey = 'ChiTietID';
    public $timestamps = false;

    protected $fillable = ['NhomID', 'SinhVienID'];

    public function nhom()
    {
        return $this->belongsTo(XinMoLop::class, 'NhomID', 'NhomID');
    }

    public function sinhVien()
    {
        return $this->belongsTo(SinhVien::class, 'SinhVienID', 'SinhVienID');
    }
}