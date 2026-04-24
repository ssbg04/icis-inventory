FROM php:8.2-apache

# Install MySQL extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy project files
COPY . /var/www/html/

# Enable Apache rewrite (optional but useful)
RUN a2enmod rewrite

# Apache listen on Render port
ENV PORT 10000

RUN sed -i "s/Listen 80/Listen 10000/" /etc/apache2/ports.conf
RUN sed -i "s/:80:10000/g" /etc/apache2/sites-available/000-default.conf

EXPOSE 10000