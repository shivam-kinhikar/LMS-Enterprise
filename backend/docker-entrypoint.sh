#!/bin/bash
# Exit on error
set -e

# Replace the default Apache port (80) with the port provided by Render ($PORT)
sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Run migrations if database is connected
php artisan migrate --force --seed

# Execute the main container command (apache2-foreground)
exec "$@"
