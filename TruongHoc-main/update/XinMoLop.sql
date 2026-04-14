-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 06, 2026 lúc 11:29 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `truonghoc`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chi_tiet_phieu`
--

CREATE TABLE `chi_tiet_phieu` (
  `ChiTietID` bigint(20) UNSIGNED NOT NULL,
  `NhomID` bigint(20) UNSIGNED NOT NULL,
  `SinhVienID` bigint(20) UNSIGNED NOT NULL,
  `NgayDangKy` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chi_tiet_phieu`
--

INSERT INTO `chi_tiet_phieu` (`ChiTietID`, `NhomID`, `SinhVienID`, `NgayDangKy`) VALUES
(3, 2, 3, '2026-04-04 09:17:33'),
(4, 3, 2, '2026-04-04 09:17:33'),
(5, 4, 105, '2026-04-04 09:17:33'),
(6, 1, 4, '2026-04-04 09:31:49'),
(14, 1, 1, '2026-04-04 11:17:17'),
(17, 14, 1, '2026-04-06 09:25:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phieu_xin_mo_lop`
--

CREATE TABLE `phieu_xin_mo_lop` (
  `NhomID` bigint(20) UNSIGNED NOT NULL,
  `MonHocID` int(10) UNSIGNED NOT NULL,
  `HocKyID` int(10) UNSIGNED NOT NULL,
  `Thu` varchar(20) DEFAULT NULL,
  `BuoiHoc` enum('Sáng','Chiều','Tối') NOT NULL,
  `SoLuongHienTai` int(11) DEFAULT 0,
  `TrangThai` enum('Đang gom','Đã mở lớp','Hủy bỏ') DEFAULT 'Đang gom',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `phieu_xin_mo_lop`
--

INSERT INTO `phieu_xin_mo_lop` (`NhomID`, `MonHocID`, `HocKyID`, `Thu`, `BuoiHoc`, `SoLuongHienTai`, `TrangThai`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Thứ Ba', 'Sáng', 2, 'Đã mở lớp', '2026-04-04 03:54:57', '2026-04-04 04:24:47'),
(2, 1, 1, 'Thứ Hai', 'Chiều', 1, 'Đang gom', '2026-04-04 09:17:22', '2026-04-04 09:17:22'),
(3, 1, 1, 'Thứ Hai', 'Sáng', 2, 'Đang gom', '2026-04-04 09:17:22', '2026-04-04 04:11:01'),
(4, 3, 1, 'Thứ Hai', 'Tối', 1, 'Đang gom', '2026-04-04 09:17:22', '2026-04-04 09:17:22'),
(14, 3, 1, 'Thứ Hai', 'Sáng', 1, 'Đã mở lớp', '2026-04-06 02:09:25', '2026-04-06 02:27:11');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chi_tiet_phieu`
--
ALTER TABLE `chi_tiet_phieu`
  ADD PRIMARY KEY (`ChiTietID`),
  ADD UNIQUE KEY `uk_sv_nhom_don` (`NhomID`,`SinhVienID`);

--
-- Chỉ mục cho bảng `phieu_xin_mo_lop`
--
ALTER TABLE `phieu_xin_mo_lop`
  ADD PRIMARY KEY (`NhomID`),
  ADD UNIQUE KEY `uk_mon_hk_lich` (`MonHocID`,`HocKyID`,`Thu`,`BuoiHoc`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chi_tiet_phieu`
--
ALTER TABLE `chi_tiet_phieu`
  MODIFY `ChiTietID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `phieu_xin_mo_lop`
--
ALTER TABLE `phieu_xin_mo_lop`
  MODIFY `NhomID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
