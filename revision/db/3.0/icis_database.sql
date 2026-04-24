-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for icis
CREATE DATABASE IF NOT EXISTS `icis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `icis`;

-- Dumping structure for table icis.accounts
CREATE TABLE IF NOT EXISTS `accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('Asset','Liability','Revenue','Expense') NOT NULL,
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.accounts: ~0 rows (approximately)

-- Dumping structure for table icis.assignments
CREATE TABLE IF NOT EXISTS `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `due_date` date DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `fk_assign_class` (`class_id`),
  CONSTRAINT `fk_assign_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.assignments: ~0 rows (approximately)

-- Dumping structure for table icis.budgets
CREATE TABLE IF NOT EXISTS `budgets` (
  `budget_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `year` year NOT NULL,
  `allocated_amount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`budget_id`),
  KEY `fk_budget_dept` (`department_id`),
  CONSTRAINT `fk_budget_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.budgets: ~0 rows (approximately)

-- Dumping structure for table icis.classes
CREATE TABLE IF NOT EXISTS `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `instructor_id` int NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `year` year DEFAULT NULL,
  `max_enrollment` int DEFAULT NULL,
  PRIMARY KEY (`class_id`),
  KEY `fk_class_course` (`course_id`),
  KEY `fk_class_instructor` (`instructor_id`),
  CONSTRAINT `fk_class_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `fk_class_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.classes: ~0 rows (approximately)

-- Dumping structure for table icis.courses
CREATE TABLE IF NOT EXISTS `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `credits` int DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `course_code` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.courses: ~0 rows (approximately)

-- Dumping structure for table icis.departments
CREATE TABLE IF NOT EXISTS `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) NOT NULL,
  `DESCRIPTION` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.departments: ~8 rows (approximately)
INSERT INTO `departments` (`department_id`, `department_name`, `DESCRIPTION`, `created_at`) VALUES
	(1, 'Human Resources', 'Handles recruitment, employee relations, and company culture', '2026-01-01 00:00:00'),
	(2, 'Information Technology', 'Manages all technology infrastructure and software development', '2026-01-01 00:00:00'),
	(3, 'Finance & Accounting', 'Handles financial operations, payroll, and budgeting', '2026-01-01 00:00:00'),
	(4, 'Marketing', 'Responsible for brand management and marketing campaigns', '2026-01-01 00:00:00'),
	(5, 'Sales', 'Drives revenue through customer acquisition and retention', '2026-01-01 00:00:00'),
	(6, 'Operations', 'Manages day-to-day business operations', '2026-01-01 00:00:00'),
	(7, 'Customer Support', 'Provides customer service and technical support', '2026-01-01 00:00:00'),
	(8, 'Research & Development', 'Innovates new products and improves existing ones', '2026-01-01 00:00:00');

-- Dumping structure for table icis.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `position_id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `is_faculty` tinyint(1) DEFAULT '0',
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('Active','Inactive','Terminated','Onboarding','Leave') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  KEY `fk_emp_department` (`department_id`),
  KEY `fk_emp_position` (`position_id`),
  CONSTRAINT `fk_emp_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `fk_emp_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.employees: ~22 rows (approximately)
INSERT INTO `employees` (`employee_id`, `department_id`, `position_id`, `first_name`, `last_name`, `birthdate`, `gender`, `email`, `hire_date`, `salary`, `is_faculty`, `phone`, `address`, `status`, `created_at`) VALUES
	(1, 1, 1, 'John', 'Smith', '1985-03-15', 'Male', 'john.smith@hris.com', '2020-01-15', NULL, 0, '+1-555-0101', '123 Main St, New York, NY 10001', 'Active', '2026-01-01 00:00:00'),
	(2, 2, 3, 'Sarah', 'Johnson', '1990-07-22', 'Female', 'sarah.johnson@hris.com', '2021-03-10', NULL, 0, '+1-555-0102', '456 Oak Ave, Los Angeles, CA 90001', 'Active', '2026-01-01 00:00:00'),
	(3, 3, 6, 'Michael', 'Williams', '1988-11-05', 'Male', 'michael.williams@hris.com', '2019-06-20', NULL, 0, '+1-555-0103', '789 Pine St, Chicago, IL 60601', 'Active', '2026-01-01 00:00:00'),
	(4, 4, 8, 'Emily', 'Brown', '1992-04-18', 'Female', 'emily.brown@hris.com', '2022-01-05', NULL, 0, '+1-555-0104', '321 Elm St, Houston, TX 77001', 'Active', '2026-01-01 00:00:00'),
	(5, 5, 10, 'David', 'Jones', '1987-09-30', 'Male', 'david.jones@hris.com', '2020-08-12', NULL, 0, '+1-555-0105', '654 Maple Dr, Phoenix, AZ 85001', 'Active', '2026-01-01 00:00:00'),
	(6, 6, 12, 'Lisa', 'Garcia', '1991-12-12', 'Female', 'lisa.garcia@hris.com', '2021-11-01', NULL, 0, '+1-555-0106', '987 Cedar Ln, Philadelphia, PA 19101', 'Active', '2026-01-01 00:00:00'),
	(7, 7, 13, 'Robert', 'Martinez', '1986-06-25', 'Male', 'robert.martinez@hris.com', '2019-09-15', NULL, 0, '+1-555-0107', '147 Birch Way, San Antonio, TX 78201', 'Active', '2026-01-01 00:00:00'),
	(8, 8, 15, 'Jennifer', 'Rodriguez', '1993-02-28', 'Female', 'jennifer.rodriguez@hris.com', '2022-03-20', NULL, 0, '+1-555-0108', '258 Spruce St, San Diego, CA 92101', 'Active', '2026-01-01 00:00:00'),
	(9, 2, 4, 'William', 'Wilson', '1989-08-14', 'Male', 'william.wilson@hris.com', '2020-05-10', NULL, 0, '+1-555-0109', '369 Willow Ct, Dallas, TX 75201', 'Active', '2026-01-01 00:00:00'),
	(10, 2, 5, 'Maria', 'Anderson', '1994-10-03', 'Female', 'maria.anderson@hris.com', '2023-01-15', NULL, 0, '+1-555-0110', '741 Aspen Ave, San Jose, CA 95101', 'Active', '2026-01-01 00:00:00'),
	(11, 1, 2, 'James', 'Taylor', '1984-05-19', 'Male', 'james.taylor@hris.com', '2018-11-20', NULL, 0, '+1-555-0111', '852 Oakwood Dr, Austin, TX 78701', 'Active', '2026-01-01 00:00:00'),
	(12, 3, 7, 'Patricia', 'Thomas', '1990-07-07', 'Female', 'patricia.thomas@hris.com', '2021-07-01', NULL, 0, '+1-555-0112', '963 Pinecrest Rd, Fort Worth, TX 76101', 'Active', '2026-01-01 00:00:00'),
	(13, 4, 9, 'Charles', 'Moore', '1987-12-21', 'Male', 'charles.moore@hris.com', '2019-12-05', NULL, 0, '+1-555-0113', '159 Lakeshore Dr, Columbus, OH 43201', 'Active', '2026-01-01 00:00:00'),
	(14, 5, 11, 'Linda', 'Jackson', '1992-03-11', 'Female', 'linda.jackson@hris.com', '2022-06-10', NULL, 0, '+1-555-0114', '753 Highland Blvd, Charlotte, NC 28201', 'Active', '2026-01-01 00:00:00'),
	(15, 6, 12, 'Thomas', 'White', '1986-09-17', 'Male', 'thomas.white@hris.com', '2020-10-01', NULL, 0, '+1-555-0115', '852 Valley View, Detroit, MI 48201', 'Active', '2026-01-01 00:00:00'),
	(16, 7, 14, 'Nancy', 'Harris', '1991-04-25', 'Female', 'nancy.harris@hris.com', '2021-04-15', NULL, 0, '+1-555-0116', '951 Mountain Rd, Memphis, TN 38101', 'Active', '2026-01-01 00:00:00'),
	(17, 8, 16, 'Daniel', 'Martin', '1988-11-08', 'Male', 'daniel.martin@hris.com', '2020-02-20', NULL, 0, '+1-555-0117', '357 River View, Boston, MA 02101', 'Active', '2026-01-01 00:00:00'),
	(18, 2, 4, 'Barbara', 'Thompson', '1993-06-13', 'Female', 'barbara.thompson@hris.com', '2022-08-01', NULL, 0, '+1-555-0118', '753 Ocean Dr, Seattle, WA 98101', 'Active', '2026-01-01 00:00:00'),
	(19, 3, 7, 'Kevin', 'Garcia', '1985-01-29', 'Male', 'kevin.garcia@hris.com', '2019-03-10', NULL, 0, '+1-555-0119', '951 Sunset Blvd, Denver, CO 80201', 'Active', '2026-01-01 00:00:00'),
	(20, 4, 9, 'Jessica', 'Martinez', '1994-08-04', 'Female', 'jessica.martinez@hris.com', '2023-02-01', NULL, 0, '+1-555-0120', '159 Pine Valley, Portland, OR 97201', 'Active', '2026-01-01 00:00:00'),
	(21, 5, 11, 'Mark', 'Robinson', '1989-10-19', 'Male', 'mark.robinson@hris.com', '2021-09-15', NULL, 0, '+1-555-0121', '357 Forest Ln, Las Vegas, NV 89101', 'Active', '2026-01-01 00:00:00'),
	(22, 6, 12, 'Sandra', 'Clark', '1992-02-27', 'Female', 'sandra.clark@hris.com', '2022-11-01', NULL, 0, '+1-555-0122', '753 Hillcrest Ave, Baltimore, MD 21201', 'Active', '2026-01-01 00:00:00');

-- Dumping structure for table icis.employee_leave
CREATE TABLE IF NOT EXISTS `employee_leave` (
  `leave_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Approved','Denied') DEFAULT 'Pending',
  PRIMARY KEY (`leave_id`),
  KEY `fk_leave_employee` (`employee_id`),
  CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.employee_leave: ~0 rows (approximately)

-- Dumping structure for table icis.employee_payments
CREATE TABLE IF NOT EXISTS `employee_payments` (
  `pay_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `pay_date` date NOT NULL,
  `gross_amount` decimal(12,2) DEFAULT NULL,
  `deductions` decimal(12,2) DEFAULT NULL,
  `net_amount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`pay_id`),
  KEY `fk_pay_employee` (`employee_id`),
  CONSTRAINT `fk_pay_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.employee_payments: ~0 rows (approximately)

-- Dumping structure for table icis.enrollments
CREATE TABLE IF NOT EXISTS `enrollments` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `enroll_date` date DEFAULT NULL,
  PRIMARY KEY (`enrollment_id`),
  KEY `fk_enroll_class` (`class_id`),
  KEY `fk_enroll_student` (`student_id`),
  CONSTRAINT `fk_enroll_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.enrollments: ~0 rows (approximately)

-- Dumping structure for table icis.evaluation_details
CREATE TABLE IF NOT EXISTS `evaluation_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `eval_id` int NOT NULL,
  `criterion_id` int NOT NULL,
  `score` int DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `fk_detail_eval` (`eval_id`),
  KEY `fk_detail_criterion` (`criterion_id`),
  CONSTRAINT `fk_detail_criterion` FOREIGN KEY (`criterion_id`) REFERENCES `eval_criteria` (`criterion_id`),
  CONSTRAINT `fk_detail_eval` FOREIGN KEY (`eval_id`) REFERENCES `faculty_evaluations` (`eval_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.evaluation_details: ~0 rows (approximately)

-- Dumping structure for table icis.eval_criteria
CREATE TABLE IF NOT EXISTS `eval_criteria` (
  `criterion_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`criterion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.eval_criteria: ~0 rows (approximately)

-- Dumping structure for table icis.faculty_evaluations
CREATE TABLE IF NOT EXISTS `faculty_evaluations` (
  `eval_id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` int NOT NULL,
  `evaluator_id` int NOT NULL,
  `eval_date` date NOT NULL,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `comments` text,
  PRIMARY KEY (`eval_id`),
  KEY `fk_eval_faculty` (`faculty_id`),
  KEY `fk_eval_evaluator` (`evaluator_id`),
  CONSTRAINT `fk_eval_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `fk_eval_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.faculty_evaluations: ~0 rows (approximately)

-- Dumping structure for table icis.inventory_items
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `quantity` int DEFAULT '0',
  `unit_price` decimal(10,2) DEFAULT NULL,
  `reorder_level` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `fk_item_supplier` (`supplier_id`),
  CONSTRAINT `fk_item_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.inventory_items: ~6 rows (approximately)
INSERT INTO `inventory_items` (`inventory_id`, `name`, `description`, `quantity`, `unit_price`, `reorder_level`, `supplier_id`) VALUES
	(1, 'Mouse', 'An input device use to navigate', 12, 269.00, 10, 2),
	(2, 'Wireless Keyboard', 'keyboard na walang wire', 25, 500.00, 10, 3),
	(3, 'Hologram Keyboard', 'hashdh', 22, 1200.00, 10, 3),
	(4, 'Wireless Mouse', '', 3, 199.00, 10, 2),
	(5, 'Wireless Keyboard K380', '', 2, 0.01, 10, 1),
	(6, 'Gamu Gamu', '', 1, 10.00, 10, 4);

-- Dumping structure for table icis.inventory_transactions
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL,
  `qty_issued` int NOT NULL,
  `transaction_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `inventory_id` (`inventory_id`),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_items` (`inventory_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.inventory_transactions: ~0 rows (approximately)

-- Dumping structure for table icis.positions
CREATE TABLE IF NOT EXISTS `positions` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `position_name` varchar(100) NOT NULL,
  `description` text,
  `basic_salary` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.positions: ~16 rows (approximately)
INSERT INTO `positions` (`position_id`, `position_name`, `description`, `basic_salary`, `created_at`) VALUES
	(1, 'HR Manager', NULL, 75000, '2026-01-01 00:00:00'),
	(2, 'HR Recruiter', NULL, 45000, '2026-01-01 00:00:00'),
	(3, 'IT Manager', NULL, 85000, '2026-01-01 00:00:00'),
	(4, 'Senior Developer', NULL, 65000, '2026-01-01 00:00:00'),
	(5, 'Junior Developer', NULL, 40000, '2026-01-01 00:00:00'),
	(6, 'Finance Manager', NULL, 80000, '2026-01-01 00:00:00'),
	(7, 'Accountant', NULL, 50000, '2026-01-01 00:00:00'),
	(8, 'Marketing Manager', NULL, 70000, '2026-01-01 00:00:00'),
	(9, 'Marketing Specialist', NULL, 45000, '2026-01-01 00:00:00'),
	(10, 'Sales Manager', NULL, 75000, '2026-01-01 00:00:00'),
	(11, 'Sales Representative', NULL, 40000, '2026-01-01 00:00:00'),
	(12, 'Operations Manager', NULL, 70000, '2026-01-01 00:00:00'),
	(13, 'Customer Support Lead', NULL, 50000, '2026-01-01 00:00:00'),
	(14, 'Support Specialist', NULL, 35000, '2026-01-01 00:00:00'),
	(15, 'R&D Manager', NULL, 80000, '2026-01-01 00:00:00'),
	(16, 'R&D Engineer', NULL, 55000, '2026-01-01 00:00:00');

-- Dumping structure for table icis.purchase_items
CREATE TABLE IF NOT EXISTS `purchase_items` (
  `po_item_id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`po_item_id`),
  KEY `fk_pi_po` (`po_id`),
  KEY `fk_pi_item` (`inventory_id`),
  CONSTRAINT `fk_pi_item` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_items` (`inventory_id`),
  CONSTRAINT `fk_pi_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.purchase_items: ~24 rows (approximately)
INSERT INTO `purchase_items` (`po_item_id`, `po_id`, `inventory_id`, `quantity`, `unit_price`) VALUES
	(1, 1, 1, 30, 269.00),
	(2, 2, 1, 12, 100.00),
	(3, 3, 5, 12, 0.01),
	(4, 4, 1, 10, 269.00),
	(5, 5, 5, 1, 0.01),
	(6, 6, 5, 2, 0.01),
	(7, 7, 5, 32, 0.01),
	(8, 8, 5, 12, 0.01),
	(9, 9, 3, 13, 1200.00),
	(10, 10, 5, 1000, 0.01),
	(11, 11, 5, 1, 0.01),
	(12, 12, 6, 1, 10.00),
	(13, 13, 6, 1, 10.00),
	(14, 14, 6, 10, 10.00),
	(15, 15, 6, 11, 10.00),
	(16, 16, 5, 1000000000, 0.01),
	(17, 17, 2, 20, 500.00),
	(18, 17, 3, 20, 1200.00),
	(19, 18, 4, 10, 199.00),
	(20, 19, 5, 10, 0.01),
	(21, 20, 6, 10, 10.00),
	(22, 21, 4, 10, 199.00),
	(23, 22, 5, 10, 0.01),
	(24, 23, 6, 10, 10.00),
	(25, 24, 4, 10, 199.00),
	(26, 25, 5, 10, 0.01),
	(27, 26, 6, 1, 10.00);

-- Dumping structure for table icis.purchase_orders
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `po_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `order_date` date NOT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('Pending','Approved','Received','Missing','Issues','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`po_id`),
  KEY `fk_po_supplier` (`supplier_id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.purchase_orders: ~23 rows (approximately)
INSERT INTO `purchase_orders` (`po_id`, `supplier_id`, `order_date`, `total_amount`, `status`) VALUES
	(1, 2, '2026-03-13', 8070.00, 'Received'),
	(2, 2, '2026-03-14', 1200.00, 'Received'),
	(3, 1, '2026-03-14', 0.12, 'Received'),
	(4, 2, '2026-03-14', 2690.00, 'Received'),
	(5, 1, '2026-03-14', 0.01, 'Received'),
	(6, 1, '2026-03-14', 0.02, 'Cancelled'),
	(7, 1, '2026-03-14', 0.32, 'Cancelled'),
	(8, 1, '2026-03-14', 0.12, 'Received'),
	(9, 3, '2026-03-14', 15600.00, 'Cancelled'),
	(10, 1, '2026-04-16', 10.00, 'Received'),
	(11, 1, '2026-04-17', 0.01, 'Received'),
	(12, 4, '2026-04-17', 10.00, 'Received'),
	(13, 4, '2026-04-17', 10.00, 'Received'),
	(14, 4, '2026-04-17', 100.00, 'Received'),
	(15, 4, '2026-04-17', 110.00, 'Received'),
	(16, 1, '2026-04-17', 10000000.00, 'Approved'),
	(17, 3, '2026-04-19', 34000.00, 'Received'),
	(18, 2, '2026-04-19', 1990.00, 'Approved'),
	(19, 1, '2026-04-19', 0.10, 'Approved'),
	(20, 4, '2026-04-19', 100.00, 'Pending'),
	(21, 2, '2026-04-22', 1990.00, 'Pending'),
	(22, 1, '2026-04-22', 0.10, 'Pending'),
	(23, 4, '2026-04-22', 100.00, 'Pending'),
	(24, 2, '2026-04-22', 1990.00, 'Approved'),
	(25, 1, '2026-04-22', 0.10, 'Approved'),
	(26, 4, '2026-04-22', 10.00, 'Approved');

-- Dumping structure for table icis.qa_indicators
CREATE TABLE IF NOT EXISTS `qa_indicators` (
  `indicator_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `target_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.qa_indicators: ~0 rows (approximately)

-- Dumping structure for table icis.qa_records
CREATE TABLE IF NOT EXISTS `qa_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `indicator_id` int NOT NULL,
  `year` year NOT NULL,
  `actual_value` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`record_id`),
  KEY `fk_qa_indicator` (`indicator_id`),
  CONSTRAINT `fk_qa_indicator` FOREIGN KEY (`indicator_id`) REFERENCES `qa_indicators` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.qa_records: ~0 rows (approximately)

-- Dumping structure for table icis.reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `reservation_id` int NOT NULL AUTO_INCREMENT,
  `resource_id` int NOT NULL,
  `reserved_by_employee` int DEFAULT NULL,
  `reserved_by_student` int DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`reservation_id`),
  KEY `fk_res_resource` (`resource_id`),
  KEY `fk_res_emp` (`reserved_by_employee`),
  KEY `fk_res_student` (`reserved_by_student`),
  CONSTRAINT `fk_res_emp` FOREIGN KEY (`reserved_by_employee`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `fk_res_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`resource_id`),
  CONSTRAINT `fk_res_student` FOREIGN KEY (`reserved_by_student`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.reservations: ~0 rows (approximately)

-- Dumping structure for table icis.resources
CREATE TABLE IF NOT EXISTS `resources` (
  `resource_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.resources: ~0 rows (approximately)

-- Dumping structure for table icis.rooms
CREATE TABLE IF NOT EXISTS `rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.rooms: ~0 rows (approximately)

-- Dumping structure for table icis.schedule
CREATE TABLE IF NOT EXISTS `schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `room_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `fk_sched_class` (`class_id`),
  KEY `fk_sched_room` (`room_id`),
  CONSTRAINT `fk_sched_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  CONSTRAINT `fk_sched_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.schedule: ~0 rows (approximately)

-- Dumping structure for table icis.students
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('M','F','Other') DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.students: ~0 rows (approximately)

-- Dumping structure for table icis.student_payments
CREATE TABLE IF NOT EXISTS `student_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `pay_date` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fk_spay_student` (`student_id`),
  CONSTRAINT `fk_spay_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.student_payments: ~0 rows (approximately)

-- Dumping structure for table icis.submissions
CREATE TABLE IF NOT EXISTS `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `submit_date` datetime DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `feedback` text,
  PRIMARY KEY (`submission_id`),
  KEY `fk_sub_assign` (`assignment_id`),
  KEY `fk_sub_student` (`student_id`),
  CONSTRAINT `fk_sub_assign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`),
  CONSTRAINT `fk_sub_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.submissions: ~0 rows (approximately)

-- Dumping structure for table icis.suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.suppliers: ~4 rows (approximately)
INSERT INTO `suppliers` (`supplier_id`, `name`, `contact_person`, `phone`, `email`, `address`) VALUES
	(1, 'Global Office Supplies', 'Jane Doe', '555-019-2837', 'jane.doe@globaloffice.test', '123 Commerce Blvd, Suite 100, Metropolis, NY 10001'),
	(2, 'TechSource IT Solutions', 'John Smith', '555-982-1122', 'sales@techsource.test', '88 Silicon Valley Road, Tech Park, CA 94025'),
	(3, 'SciLab Direct', 'Dr. Emily Chen', '555-444-9988', 'echen@scilabdirect.test', '450 Innovation Drive, Research Triangle, NC 27709'),
	(4, 'SiSiBiGi IT Solutions', 'Cris Charles', '09914970689', 'crischarlesgarcia345@gmail.com', '256 Purok 2'),
	(6, 'test', 'sts', 'sat', 'tsts@sa', 'ast');

-- Dumping structure for table icis.surveys
CREATE TABLE IF NOT EXISTS `surveys` (
  `survey_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `description` text,
  `created_date` date DEFAULT NULL,
  PRIMARY KEY (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.surveys: ~0 rows (approximately)

-- Dumping structure for table icis.survey_responses
CREATE TABLE IF NOT EXISTS `survey_responses` (
  `response_id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `respondent_role` varchar(50) DEFAULT NULL,
  `answer` text,
  `rating` int DEFAULT NULL,
  `response_date` date DEFAULT NULL,
  PRIMARY KEY (`response_id`),
  KEY `fk_survey` (`survey_id`),
  CONSTRAINT `fk_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`survey_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.survey_responses: ~0 rows (approximately)

-- Dumping structure for table icis.transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `trans_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('Debit','Credit') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `fk_trans_account` (`account_id`),
  CONSTRAINT `fk_trans_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.transactions: ~0 rows (approximately)

-- Dumping structure for table icis.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_employee_id` (`employee_id`),
  CONSTRAINT `fk_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.users: ~7 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `role`, `employee_id`, `created_at`) VALUES
	(1, 'admin', '$2y$10$YIeSKpZp1xgjA6PogiM4oOJ7tSbkT2W75HZWW5WAD8FMJ6IH09bWq', 'admin', NULL, '2026-01-01 00:00:00'),
	(2, 'john.smith', '$2y$10$yZh7v6eVUuxMJNemp59tNu.1full0giINls2UHUOyVQCap.R5JYwm', 'employee', 1, '2026-01-01 00:00:00'),
	(3, 'sarah.johnson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 2, '2026-01-01 00:00:00'),
	(4, 'michael.williams', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 3, '2026-01-01 00:00:00'),
	(5, 'emily.brown', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', 4, '2026-01-01 00:00:00'),
	(6, 'hr_manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'hr', 1, '2026-01-01 00:00:00'),
	(7, 'finance_head', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'finance', 3, '2026-01-01 00:00:00');

-- Dumping structure for table icis.vendor_payments
CREATE TABLE IF NOT EXISTS `vendor_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `po_id` int DEFAULT NULL,
  `pay_date` date NOT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fk_vpay_supplier` (`supplier_id`),
  KEY `fk_vpay_po` (`po_id`),
  CONSTRAINT `fk_vpay_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`),
  CONSTRAINT `fk_vpay_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.vendor_payments: ~14 rows (approximately)
INSERT INTO `vendor_payments` (`payment_id`, `supplier_id`, `po_id`, `pay_date`, `amount`) VALUES
	(1, 1, 3, '2026-03-14', 0.12),
	(2, 2, 4, '2026-03-14', 2690.00),
	(3, 1, 5, '2026-03-14', 0.01),
	(4, 1, 8, '2026-03-14', 0.12),
	(5, 1, 10, '2026-04-16', 10.00),
	(6, 1, 11, '2026-04-17', 0.01),
	(7, 4, 13, '2026-04-17', 10.00),
	(8, 4, 13, '2026-04-17', 10.00),
	(9, 4, 13, '2026-04-17', 10.00),
	(10, 4, 13, '2026-04-17', 10.00),
	(11, 4, 13, '2026-04-17', 10.00),
	(12, 4, 14, '2026-04-17', 100.00),
	(13, 4, 15, '2026-04-17', 110.00),
	(14, 3, 17, '2026-04-19', 34000.00);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
