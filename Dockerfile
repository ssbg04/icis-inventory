FROM php:8.2-apache

# Install MySQL extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy project files
COPY . /var/www/html/

# Enable Apache rewrite (optional but useful)
RUN a2enmod rewrite

EXPOSE 80