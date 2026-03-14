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
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.departments: ~0 rows (approximately)

-- Dumping structure for table icis.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `position_id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('M','F','Other') DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT NULL,
  `is_faculty` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`employee_id`),
  KEY `fk_emp_department` (`department_id`),
  KEY `fk_emp_position` (`position_id`),
  CONSTRAINT `fk_emp_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  CONSTRAINT `fk_emp_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.employees: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.inventory_items: ~0 rows (approximately)
INSERT INTO `inventory_items` (`inventory_id`, `name`, `description`, `quantity`, `unit_price`, `reorder_level`, `supplier_id`) VALUES
	(1, 'Mouse', 'An input device use to navigate', 160, 269.00, 10, 2);

-- Dumping structure for table icis.positions
CREATE TABLE IF NOT EXISTS `positions` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.positions: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.purchase_items: ~0 rows (approximately)
INSERT INTO `purchase_items` (`po_item_id`, `po_id`, `inventory_id`, `quantity`, `unit_price`) VALUES
	(1, 1, 1, 30, 269.00);

-- Dumping structure for table icis.purchase_orders
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `po_id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `order_date` date NOT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `status` enum('Draft','Ordered','Received','Cancelled') DEFAULT 'Draft',
  PRIMARY KEY (`po_id`),
  KEY `fk_po_supplier` (`supplier_id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.purchase_orders: ~0 rows (approximately)
INSERT INTO `purchase_orders` (`po_id`, `supplier_id`, `order_date`, `total_amount`, `status`) VALUES
	(1, 2, '2026-03-13', 8070.00, 'Received');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.suppliers: ~0 rows (approximately)
INSERT INTO `suppliers` (`supplier_id`, `name`, `contact_person`, `phone`, `email`, `address`) VALUES
	(1, 'Global Office Supplies', 'Jane Doe', '555-019-2837', 'jane.doe@globaloffice.test', '123 Commerce Blvd, Suite 100, Metropolis, NY 10001'),
	(2, 'TechSource IT Solutions', 'John Smith', '555-982-1122', 'sales@techsource.test', '88 Silicon Valley Road, Tech Park, CA 94025'),
	(3, 'SciLab Direct', 'Dr. Emily Chen', '555-444-9988', 'echen@scilabdirect.test', '450 Innovation Drive, Research Triangle, NC 27709');

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
  `role` enum('Admin','Staff') DEFAULT 'Staff',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.users: ~1 rows (approximately)
INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
	(1, 'admin', '$2y$10$jQorcKtpCuLjuQsHMLKZcOM/4noWLsxa4NqkHBqMpScJykXzpYPZm', 'Admin');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table icis.vendor_payments: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
