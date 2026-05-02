<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('giangvien', function (Blueprint $table) {
            $table->string('LoaiGiangVien', 50)->default('Cơ hữu')->after('ChuyenMon');
        });
    }

    public function down(): void
    {
        Schema::table('giangvien', function (Blueprint $table) {
            $table->dropColumn('LoaiGiangVien');
        });
    }
};