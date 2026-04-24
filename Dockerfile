FROM php:8.2-apache

# Install MySQL extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy project files
COPY . /var/www/html/

# Enable Apache rewrite (optional but useful)
RUN a2enmod rewrite

RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

RUN chown -R www-data:www-data /var/wwww/html

EXPOSE 80

CMD ["apache2-foreground"]