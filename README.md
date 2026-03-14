# Campus Supply & Inventory Management Module

This is the PHP/HTML prototype for the Supply and Inventory Management subsystem of the Integrated Campus Information System (ICIS). 

## 🚀 Features Included
* **Secure Authentication:** Session-based login for staff/admins.
* **Inventory Tracking:** View items, descriptions, quantities, and supplier details.
* **Automated Stock Control:** Dynamic badging that flags items when stock drops below the defined `reorder_level`.
* **Procurement Workflow:** Create Purchase Orders (POs) linked to specific suppliers and items. "Receiving" a PO automatically updates stock quantities in the `inventory_items` table.
* **Reporting & Analytics:** Dashboard with summary KPIs and a Chart.js visualization of inventory valuation by supplier.

## 📋 Prerequisites
1.  A local server environment (XAMPP, WAMP, MAMP, or equivalent).
2.  PHP 7.4 or higher.
3.  MySQL 8.0 or higher.

## 🛠️ Setup Instructions

### 1. Database Configuration
1. Open your database manager (phpMyAdmin, HeidiSQL, etc.).
2. Import the master `icis.sql` schema to create the database and tables.
3. Run the following SQL snippet to create the users table and default admin account (if not already in your schema):
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       role ENUM('Admin', 'Staff') DEFAULT 'Staff'
   );

   INSERT INTO users (username, password, role) 
   VALUES ('admin', '$2y$10$2ztNQLWAfMbamxC1H0BV6e.o2YoZZSXqmbzrRJrStd15GXcDuk97m', 'Admin');