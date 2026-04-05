<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dieukienmonhoc', function (Blueprint $table) {
            $table->tinyInteger('Loai')->default(1)->comment('1: Tien quyet, 2: Song hanh')->after('MonTienQuyetID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dieukienmonhoc', function (Blueprint $table) {
            $table->dropColumn('Loai');
        });
    }
};