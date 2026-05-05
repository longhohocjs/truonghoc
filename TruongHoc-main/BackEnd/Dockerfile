# Sử dụng PHP 8.2 FPM làm base
FROM php:8.2-fpm-alpine

# Cài đặt các dependencies hệ thống và Nginx
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl

# Cài đặt các PHP extensions cần thiết cho Laravel
RUN docker-php-ext-install pdo_mysql gd xml

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www

# Copy toàn bộ source code vào container
COPY . .

# Cài đặt các gói phụ thuộc của Laravel
RUN composer install --no-dev --optimize-autoloader

# Cấu hình quyền truy cập cho thư mục storage và bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Copy cấu hình Nginx đã tạo ở bước 1 vào container
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Expose cổng 80
EXPOSE 80

# Script khởi chạy: Chạy cả PHP-FPM và Nginx
CMD php-fpm -D && nginx -g "daemon off;"