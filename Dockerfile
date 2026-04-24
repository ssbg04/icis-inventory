FROM php:8.2-apache

# Install required extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy project
COPY . /var/www/html/

# Fix permissions (IMPORTANT FIXED TYPO)
RUN chown -R www-data:www-data /var/www/html/

# Ensure Apache allows .htaccess (API routing support)
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Optional: clean API-friendly Apache config
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Copy the default production PHP configuration
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Force PHP to allow Environment Variables in the $_ENV array
RUN sed -i 's/variables_order = "GPCS"/variables_order = "EGPCS"/g' "$PHP_INI_DIR/php.ini"

EXPOSE 80

CMD ["apache2-foreground"]