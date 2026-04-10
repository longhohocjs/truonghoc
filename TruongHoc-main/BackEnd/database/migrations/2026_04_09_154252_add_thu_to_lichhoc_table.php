<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   // ...
public function up(): void
{
    Schema::table('lichhoc', function (Blueprint $table) {
        $table->tinyInteger('Thu')->nullable()->after('NgayHoc');
    });
}

public function down(): void
{
    Schema::table('lichhoc', function (Blueprint $table) {
        $table->dropColumn('Thu');
    });
}
// ...

};