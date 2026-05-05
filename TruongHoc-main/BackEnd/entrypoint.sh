#!/bin/sh

# Chờ một chút để đảm bảo database sẵn sàng (tùy chọn, nhưng hữu ích)
# sleep 5

# Chạy database migrations
echo "Running database migrations..."
php artisan migrate --force

# Xóa và cache các cấu hình cho môi trường production để tối ưu hiệu suất
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Khởi động PHP-FPM và Nginx
echo "Starting PHP-FPM and Nginx..."
php-fpm -D && nginx -g "daemon off;"