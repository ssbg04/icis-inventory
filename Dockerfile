FROM php:8.2-apache

# Set Philippines timezone
ENV TZ=Asia/Manila

# Install required packages + PHP extensions
RUN apt-get update && apt-get install -y tzdata && \
    docker-php-ext-install mysqli pdo pdo_mysql

# Configure system timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Set PHP timezone
RUN echo "date.timezone = Asia/Manila" > /usr/local/etc/php/conf.d/timezone.ini

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy project
COPY . /var/www/html/

# Fix permissions
RUN chown -R www-data:www-data /var/www/html/

# Ensure Apache allows .htaccess
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Optional Apache config
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Copy production PHP config
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Allow environment variables in PHP
RUN sed -i 's/variables_order = "GPCS"/variables_order = "EGPCS"/g' "$PHP_INI_DIR/php.ini"

EXPOSE 80

CMD ["apache2-foreground"]