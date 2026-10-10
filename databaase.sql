-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: login_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','1234'),(2,'student','student123');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 23:13:36
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smart_attendance
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_activity_logs`
--

DROP TABLE IF EXISTS `admin_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_activity_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_activity_logs`
--

LOCK TABLES `admin_activity_logs` WRITE;
/*!40000 ALTER TABLE `admin_activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_invites`
--

DROP TABLE IF EXISTS `admin_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_invites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invite_key` varchar(100) NOT NULL,
  `created_by` int NOT NULL,
  `used_by` int DEFAULT NULL,
  `status` enum('active','used','revoked') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invite_key` (`invite_key`),
  KEY `created_by` (`created_by`),
  KEY `used_by` (`used_by`),
  CONSTRAINT `admin_invites_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_invites_ibfk_2` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_invites`
--

LOCK TABLES `admin_invites` WRITE;
/*!40000 ALTER TABLE `admin_invites` DISABLE KEYS */;
INSERT INTO `admin_invites` VALUES (1,'JAVA-ADMIN-427DD4372C53',2,NULL,'revoked','2026-09-27 11:43:02',NULL),(2,'JAVA-ADMIN-7F0AC20FA805',2,4,'used','2026-09-27 11:48:56','2026-09-27 11:50:48'),(3,'JAVA-ADMIN-BF0295D2AAF4',2,NULL,'revoked','2026-09-27 12:19:47',NULL),(4,'JAVA-ADMIN-3FB4DB13B3D0',2,NULL,'active','2026-09-27 22:08:01',NULL);
/*!40000 ALTER TABLE `admin_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_subjects`
--

DROP TABLE IF EXISTS `admin_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_subjects_ibfk_1` (`admin_id`),
  KEY `admin_subjects_ibfk_2` (`subject_id`),
  CONSTRAINT `admin_subjects_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `admin_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_subjects`
--

LOCK TABLES `admin_subjects` WRITE;
/*!40000 ALTER TABLE `admin_subjects` DISABLE KEYS */;
INSERT INTO `admin_subjects` VALUES (7,2,1,'2026-09-25 22:00:58'),(8,2,2,'2026-09-25 22:00:58'),(9,2,3,'2026-09-25 22:00:58'),(10,2,4,'2026-09-25 22:00:58'),(11,2,5,'2026-09-25 22:00:58'),(12,2,6,'2026-09-25 22:00:58'),(13,4,1,'2026-09-27 11:50:48'),(14,4,2,'2026-09-27 11:50:48'),(15,4,3,'2026-09-27 11:50:48'),(16,4,4,'2026-09-27 11:50:48'),(17,4,5,'2026-09-27 11:50:48'),(18,4,6,'2026-09-27 11:50:48');
/*!40000 ALTER TABLE `admin_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `login_time` datetime DEFAULT NULL,
  `submission_time` datetime DEFAULT NULL,
  `status` enum('present','absent','in_progress','submitted') DEFAULT 'present',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_id` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_attempts`
--

DROP TABLE IF EXISTS `exam_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `status` enum('in_progress','submitted','abandoned','blocked') NOT NULL DEFAULT 'in_progress',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_exam` (`student_id`,`exam_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_attempts`
--

LOCK TABLES `exam_attempts` WRITE;
/*!40000 ALTER TABLE `exam_attempts` DISABLE KEYS */;
INSERT INTO `exam_attempts` VALUES (1,1,1,'in_progress','2026-09-26 12:30:07',NULL),(2,1,3,'submitted','2026-09-26 12:32:40','2026-09-26 12:33:21'),(3,1,4,'in_progress','2026-09-26 12:37:52',NULL),(4,1,5,'blocked','2026-09-26 12:41:50','2026-09-26 12:41:57'),(5,1,8,'submitted','2026-09-26 12:44:41','2026-09-26 12:46:07'),(6,1,9,'submitted','2026-09-26 13:03:15','2026-09-26 13:04:43'),(7,1,10,'submitted','2026-09-26 13:17:28','2026-09-26 13:17:49'),(8,1,11,'submitted','2026-09-27 10:53:20','2026-09-27 10:53:24'),(9,1,13,'submitted','2026-09-27 12:25:40','2026-09-27 12:26:45'),(10,5,14,'submitted','2026-09-27 22:32:40','2026-09-27 22:32:50'),(11,3,9,'in_progress','2026-09-28 16:30:40',NULL),(12,6,15,'blocked','2026-09-30 18:30:49','2026-09-30 18:31:18');
/*!40000 ALTER TABLE `exam_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_questions`
--

DROP TABLE IF EXISTS `exam_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(500) NOT NULL,
  `option_b` varchar(500) NOT NULL,
  `option_c` varchar(500) NOT NULL,
  `option_d` varchar(500) NOT NULL,
  `correct_option` enum('A','B','C','D') NOT NULL,
  `marks` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_questions`
--

LOCK TABLES `exam_questions` WRITE;
/*!40000 ALTER TABLE `exam_questions` DISABLE KEYS */;
INSERT INTO `exam_questions` VALUES (2,1,'Which sorting algorithm has an average-case time complexity of O(n log n)?','Bubble Sort','Selection Sort','Merge Sort','Linear Search','C',1,'2026-09-25 23:20:52'),(3,1,'What is the worst-case time complexity of Quick Sort?','O(n)','O(log n)','v','O(n²)','D',1,'2026-09-25 23:21:38'),(4,1,'Which algorithm is used to find the shortest path from a single source in a weighted graph with non-negative edge weights?','Prim\'s Algorithm','Dijkstra\'s Algorithm','Kruskal\'s Algorithm','DFS','B',1,'2026-09-25 23:22:22'),(5,1,'What does Big-O notation represent?','Best-case complexity','Average-case complexity only','Upper bound of an algorithm\'s growth rate','Memory address of an algorithm','C',1,'2026-09-25 23:23:11'),(6,1,'Which technique divides a problem into smaller subproblems and combines their solutions?','Greedy Method','Divide and Conquer','Backtracking','Brute Force','B',1,'2026-09-25 23:23:59'),(7,1,'What is the time complexity of accessing an element in an array using its index?','O(n)','O(log n)','O(1)','O(n²)','C',1,'2026-09-25 23:24:38'),(8,1,'Which algorithm is commonly used to find a Minimum Spanning Tree?','Dijkstra\'s Algorithm','Binary Search','Kruskal\'s Algorithm','Binary Sort','C',1,'2026-09-25 23:25:20'),(9,1,'Which of the following is an example of a greedy algorithm?','Merge Sort','Dijkstra\'s Algorithm','Binary Search','Floyd-Warshall Algorithm','B',1,'2026-09-25 23:26:15'),(10,1,'What is the worst-case time complexity of Bubble Sort?','O(log n)','O(n)','O(n log n)','O(n²)','D',1,'2026-09-25 23:26:51'),(11,1,'kya re bhenKeK0de???','Mast tu bata??','dfvdfv','vdfv','vfd','B',1,'2026-09-26 12:29:15'),(12,3,'SHUBHAM CHA BAAP KON??','BHAVESH','PRATHAMESH','SANTOSH','VIJAAY KA DOSTT','A',1,'2026-09-26 12:32:12'),(13,4,'hello','1','3','2','5','C',1,'2026-09-26 12:37:23'),(14,5,'fgg','dg','ddg','gdgg','dg','D',1,'2026-09-26 12:41:37'),(15,8,'ergeg','r','g','s','ger','B',1,'2026-09-26 12:44:33'),(16,9,'What is the main purpose of analyzing an algorithm?','To determine the programming language used','To determine the efficiency of the algorithm','To increase the size of the program','To change the computer hardware','B',1,'2026-09-26 12:51:07'),(17,9,'Which notation is commonly used to represent the upper bound of an algorithm\'s time complexity?','Big-O notation','Big-Ω notation','Big-Θ notation','Little-o notation','A',1,'2026-09-26 12:52:23'),(18,9,'What is the worst-case time complexity of linear search in an array of n elements?','O(1)','O(log n)',': O(n)','O(n²)','C',1,'2026-09-26 12:53:22'),(19,9,'What is the time complexity of binary search in a sorted array?','O(n)','O(n²)','O(log n)','O(1)','C',1,'2026-09-26 12:55:53'),(20,9,'Which algorithm technique divides a problem into smaller subproblems, solves them independently, and combines their results?','A) Greedy Method','B) Divide and Conquer','C) Backtracking','D) Branch and Bound','B',1,'2026-09-26 12:57:03'),(21,9,'Which data structure is primarily used to implement Breadth-First Search (BFS)?','A) Stack','B) Queue','C) Heap','D) Linked List','B',1,'2026-09-26 12:58:21'),(22,9,'Which algorithm is commonly used to find the minimum spanning tree of a connected weighted graph?','A) Dijkstra\'s Algorithm','B) Kruskal\'s Algorithm','C) Binary Search','D) Floyd-Warshall Algorithm','B',1,'2026-09-26 12:59:17'),(23,9,'Which algorithm is used to find the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights?','A) Prim\'s Algorithm','B) Dijkstra\'s Algorithm','C) Kruskal\'s Algorithm','D) Merge Sort','B',1,'2026-09-26 13:00:21'),(24,9,'Which algorithm follows the principle of selecting the locally optimal choice at each step?','A) Dynamic Programming','B) Greedy Algorithm','C) Divide and Conquer','D) Backtracking','B',1,'2026-09-26 13:01:22'),(25,9,'Which technique is used to solve a problem by storing the results of previously solved subproblems?','A) Greedy Method','B) Dynamic Programming','C) Divide and Conquer','D) Branch and Bound','B',1,'2026-09-26 13:02:11'),(26,10,'Which architecture uses a single memory space for both instructions and data?','A) Harvard Architecture','B) Von Neumann Architecture','C) RISC Architecture','D) Pipeline Architecture','B',1,'2026-09-26 13:08:16'),(27,10,'Which register holds the address of the next instruction to be executed?','A) Instruction Register','B) Memory Address Registerr','C) Program Counter','D) Accumulator','C',1,'2026-09-26 13:09:12'),(28,10,'Which component of the CPU performs arithmetic and logical operations?','A) Control Unit','B) ALU','C) Register Unit','D) Cache Memory','B',1,'2026-09-26 13:10:10'),(29,10,'Which type of memory is the fastest among the following?','A) RAM','B) Cache Memory','C) Hard Disk','D) Optical Disk','B',1,'2026-09-26 13:11:12'),(30,10,'Which register temporarily stores data that is being transferred to or from memory?','A) Memory Data Register','B) Program Counter','C) Instruction Register','D) Stack Pointer','A',1,'2026-09-26 13:12:38'),(31,10,'Which technique allows multiple instructions to be overlapped during execution?','A) Pipelining','B) Multiplexing','C) Paging','D) Segmentation','A',1,'2026-09-26 13:13:38'),(32,10,'Which cache mapping technique maps each block of main memory to exactly one possible cache line?','A) Associative Mapping','B) Direct Mapping','C) Set-Associative Mapping','D) Fully Associative Mapping','B',1,'2026-09-26 13:14:24'),(33,10,'Which instruction is used to transfer control to another location in a program?','A) ADD','B) LOAD','C) BRANCH','D) STORE','C',1,'2026-09-26 13:15:05'),(34,10,'Which unit of the CPU is responsible for directing and coordinating all operations?','A) ALU','B) Control Unit','C) Cache Unit','D) Memory Unit','B',1,'2026-09-26 13:15:52'),(35,10,'Which memory is used to store frequently accessed data and instructions to reduce the average memory access time?','A) Cache Memory','B) Secondary Memory','C) Virtual Memory','D) Optical Memory','A',1,'2026-09-26 13:16:44'),(36,11,'csd','BHAVESH','PRATHAMESH','SANTOSH','VIJAAY KA DOSTT','A',1,'2026-09-27 10:53:00'),(37,12,'vdf','fvf','fv','fvf','fdv','B',1,'2026-09-27 10:59:12'),(38,13,'gtdd','db','fd','db','bd','B',1,'2026-09-27 12:24:57'),(39,14,'How do i travel to my home everyday??','Train','Rickshaw','ECO','Celerio','D',1,'2026-09-27 22:32:00'),(40,15,'2+2 =?','3','5','4','6','C',1,'2026-09-30 18:29:54');
/*!40000 ALTER TABLE `exam_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_results`
--

DROP TABLE IF EXISTS `exam_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `score` int NOT NULL,
  `total_marks` int NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_results`
--

LOCK TABLES `exam_results` WRITE;
/*!40000 ALTER TABLE `exam_results` DISABLE KEYS */;
INSERT INTO `exam_results` VALUES (1,1,1,4,10,'2026-09-26 00:12:26'),(2,1,1,2,10,'2026-09-26 10:43:51'),(3,1,3,1,1,'2026-09-26 12:33:21'),(4,1,8,0,1,'2026-09-26 12:46:07'),(5,1,9,3,10,'2026-09-26 13:04:43'),(6,1,10,1,10,'2026-09-26 13:17:49'),(7,1,11,1,1,'2026-09-27 10:53:24'),(8,1,13,1,1,'2026-09-27 12:26:45'),(9,5,14,1,1,'2026-09-27 22:32:50');
/*!40000 ALTER TABLE `exam_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `exam_title` varchar(200) NOT NULL,
  `description` text,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int NOT NULL DEFAULT '60',
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_marks` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (1,1,2,'AOA 1',NULL,NULL,NULL,30,'published','2026-09-25 22:57:42','2026-09-25 23:32:10',10),(3,1,2,'EXAM 2',NULL,NULL,NULL,30,'published','2026-09-26 12:31:29','2026-09-26 12:32:18',1),(4,1,2,'exam 3',NULL,NULL,NULL,30,'published','2026-09-26 12:37:08','2026-09-26 12:41:06',1),(5,1,2,'exam 3',NULL,NULL,NULL,30,'draft','2026-09-26 12:41:25','2026-09-26 12:41:54',1),(8,1,2,'5',NULL,NULL,NULL,1,'published','2026-09-26 12:44:22','2026-09-26 12:44:35',1),(9,1,2,'AOA test 6',NULL,NULL,NULL,10,'published','2026-09-26 12:49:52','2026-09-26 13:02:38',10),(10,2,2,'COA exam 1',NULL,NULL,NULL,30,'published','2026-09-26 13:06:17','2026-09-26 13:16:48',10),(11,6,2,'1',NULL,NULL,NULL,30,'published','2026-09-27 10:52:44','2026-09-27 10:53:04',1),(12,5,2,'ddf',NULL,NULL,NULL,30,'draft','2026-09-27 10:58:59','2026-09-27 10:59:50',1),(13,3,4,'ckjabd',NULL,NULL,NULL,30,'published','2026-09-27 12:22:00','2026-09-27 12:25:05',1),(14,3,2,'SIDDHI',NULL,NULL,NULL,10,'draft','2026-09-27 22:30:42','2026-10-08 22:06:32',1),(15,5,2,'Math 2',NULL,NULL,NULL,30,'draft','2026-09-30 18:29:27','2026-09-30 18:31:09',1);
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_attempts`
--

DROP TABLE IF EXISTS `login_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `success` tinyint(1) DEFAULT '0',
  `attempted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_attempts`
--

LOCK TABLES `login_attempts` WRITE;
/*!40000 ALTER TABLE `login_attempts` DISABLE KEYS */;
INSERT INTO `login_attempts` VALUES (1,'afrajshaikh71@gmail.com','::1',0,'2026-09-24 21:42:59'),(2,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-24 21:43:14'),(3,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-24 21:43:18'),(4,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-24 21:44:29'),(5,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-24 22:06:56'),(6,'afrajshaikh71@gmail.com','::1',0,'2026-09-25 10:16:14'),(7,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-25 10:16:41'),(8,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-25 10:16:44'),(9,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-25 10:16:49'),(10,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-25 10:16:58'),(11,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:17:02'),(12,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:23:18'),(13,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:24:05'),(14,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:25:18'),(15,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:37:30'),(16,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:41:18'),(17,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 10:45:41'),(18,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 12:54:47'),(19,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 21:09:58'),(20,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 21:17:51'),(21,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 21:42:57'),(22,'neetakadam1076@gmail.com','::1',1,'2026-09-25 22:10:11'),(23,'neetakadam1076@gmail.com','::1',1,'2026-09-25 22:15:30'),(24,'neetakadam1076@gmail.com','::1',1,'2026-09-25 22:42:46'),(25,'neetakadam1076@gmail.com','::1',1,'2026-09-25 22:57:27'),(26,'neetakadam1076@gmail.com','::1',1,'2026-09-25 23:17:36'),(27,'neetakadam1076@gmail.com','::1',1,'2026-09-25 23:32:06'),(28,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 23:37:11'),(29,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 23:43:33'),(30,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 23:49:31'),(31,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-25 23:55:16'),(32,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 00:11:59'),(33,'prathameshgurgude033@gmail.com','::1',1,'2026-09-26 10:42:16'),(34,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-26 10:43:08'),(35,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 10:43:09'),(36,'neetakadam1076@gmail.com','::1',0,'2026-09-26 10:50:26'),(37,'neetakadam1076@gmail.com','::1',1,'2026-09-26 10:50:33'),(38,'prathameshgurgude033@gmail.com','::1',1,'2026-09-26 10:55:13'),(39,'neetakadam1076@gmail.com','::1',1,'2026-09-26 10:56:45'),(40,'neetakadam1076@gmail.com','::1',1,'2026-09-26 12:28:30'),(41,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-26 12:29:49'),(42,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 12:29:52'),(43,'neetakadam1076@gmail.com','::1',0,'2026-09-26 12:30:58'),(44,'neetakadam1076@gmail.com','::1',0,'2026-09-26 12:31:08'),(45,'neetakadam1076@gmail.com','::1',1,'2026-09-26 12:31:13'),(46,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 12:32:34'),(47,'neetakadam1076@gmail.com','::1',1,'2026-09-26 12:36:56'),(48,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 12:37:47'),(49,'neetakadam1076@gmail.com','::1',1,'2026-09-26 12:38:33'),(50,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 12:39:25'),(51,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-26 12:40:11'),(52,'neetakadam1076@gmail.com','::1',1,'2026-09-26 12:41:00'),(53,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 08:59:17'),(54,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 09:02:17'),(55,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 09:32:16'),(56,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 09:54:46'),(57,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 10:23:08'),(58,'neetakadam1076@gmail.com','::1',1,'2026-09-27 10:26:25'),(59,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 10:40:16'),(60,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 10:51:27'),(61,'neetakadam1076@gmail.com','::1',1,'2026-09-27 10:52:23'),(62,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:14:11'),(63,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:16:17'),(64,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 11:24:38'),(65,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:26:19'),(66,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-27 11:38:21'),(67,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:38:31'),(68,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:48:50'),(69,'prathameshgurgude0334@gmail.com','::1',1,'2026-09-27 11:50:56'),(70,'neetakadam1076@gmail.com','::1',1,'2026-09-27 11:51:12'),(71,'prathameshgurgude0334@gmail.com','::1',1,'2026-09-27 12:02:36'),(72,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 12:03:29'),(73,'prathameshgurgude0334@gmail.com','::1',0,'2026-09-27 12:10:15'),(74,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 12:10:44'),(75,'neetakadam1076@gmail.com','::1',1,'2026-09-27 12:11:42'),(76,'neetakadam1076@gmail.com','::1',1,'2026-09-27 12:16:16'),(77,'prathameshgurgude0334@gmail.com','::1',1,'2026-09-27 12:19:58'),(78,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 12:25:34'),(79,'neetakadam1076@gmail.com','::1',1,'2026-09-27 12:31:16'),(80,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 12:31:58'),(81,'neetakadam1076@gmail.com','::1',0,'2026-09-27 22:07:20'),(82,'neetakadam1076@gmail.com','::1',1,'2026-09-27 22:07:31'),(83,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 22:08:50'),(84,'bhaveshkadam150700@gmail.com','::1',0,'2026-09-27 22:21:54'),(85,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 22:21:58'),(86,'rajatmayur18@gmail.com','::1',1,'2026-09-27 22:24:48'),(87,'neetakadam1076@gmail.com','::1',1,'2026-09-27 22:26:34'),(88,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-27 22:56:09'),(89,'neetakadam1076@gmail.com','::1',1,'2026-09-27 22:56:53'),(90,'vedant220307@gmail.com','::1',1,'2026-09-28 09:14:25'),(91,'prathameshgurgude033@gmail.com','::1',1,'2026-09-28 16:30:18'),(92,'bhaveshkadam150700@gmail.com','::1',1,'2026-09-30 18:27:59'),(93,'neetakadam1076@gmail.com','::1',1,'2026-09-30 18:28:54'),(94,'vedant220307@gmail.com','::1',1,'2026-09-30 18:30:37'),(95,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:51'),(96,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:56'),(97,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:57'),(98,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:57'),(99,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:58'),(100,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:59'),(101,'shubham123@gmail.com','::1',0,'2026-10-01 09:14:59'),(102,'shubham123@gmail.com','::1',0,'2026-10-01 09:15:00'),(103,'shubham123@gmail.com','::1',0,'2026-10-01 09:15:12'),(104,'shubham123@gmail.com','::1',0,'2026-10-01 09:15:14'),(105,'shubham123@gmail.com','::1',0,'2026-10-01 09:15:14'),(106,'bhaveshkadam150700@gmail.com','::1',1,'2026-10-06 16:56:42'),(107,'neetakadam1076@gmail.com','::1',1,'2026-10-08 22:06:17'),(108,'bhaveshkadam150700@gmail.com','::1',0,'2026-10-08 22:07:16'),(109,'bhaveshkadam150700@gmail.com','::1',0,'2026-10-08 22:07:24'),(110,'bhaveshkadam150700@gmail.com','::1',1,'2026-10-08 22:07:28');
/*!40000 ALTER TABLE `login_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verifications`
--

DROP TABLE IF EXISTS `otp_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `purpose` enum('registration','login','forgot_password','change_email','change_phone') NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int DEFAULT '0',
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `otp_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verifications`
--

LOCK TABLES `otp_verifications` WRITE;
/*!40000 ALTER TABLE `otp_verifications` DISABLE KEYS */;
INSERT INTO `otp_verifications` VALUES (4,1,'bhaveshkadam150700@gmail.com','$2b$10$cXwJ0qyJ4jVpVeC2fVYuAuHfBF9v5AgrA0EitQcPcLbWyDAjypLBa','registration','2026-09-25 22:27:55',0,1,'2026-09-25 21:17:55'),(6,3,'prathameshgurgude033@gmail.com','$2b$10$auLonrZ.GBd4xqv2foaWeO1SoYaqIld5crPt1OIQmyiyzR33HdYou','registration','2026-09-26 12:05:25',0,1,'2026-09-26 10:55:24'),(7,5,'rajatmayur18@gmail.com','$2b$10$N970gzJhk.UVLFj1wsmTuuVcW5ravsT64JsplFgqkViNE6blfVpu6','registration','2026-09-27 23:34:52',0,1,'2026-09-27 22:24:52'),(9,6,'vedant220307@gmail.com','$2b$10$63g9XpMb8fNoKKbjy52I5OayLHFginJh9lHB3eolFop/S1kp7h1Xi','registration','2026-09-28 10:25:23',0,0,'2026-09-28 09:15:22');
/*!40000 ALTER TABLE `otp_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_reset_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_answer` enum('A','B','C','D') NOT NULL,
  `marks` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `student_id` int NOT NULL,
  `total_questions` int DEFAULT '0',
  `correct_answers` int DEFAULT '0',
  `wrong_answers` int DEFAULT '0',
  `unanswered` int DEFAULT '0',
  `total_marks` decimal(7,2) DEFAULT '0.00',
  `obtained_marks` decimal(7,2) DEFAULT '0.00',
  `percentage` decimal(5,2) DEFAULT '0.00',
  `submitted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_id` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `results_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_answers`
--

DROP TABLE IF EXISTS `student_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_id` int NOT NULL,
  `student_id` int NOT NULL,
  `selected_answer` enum('A','B','C','D') DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `marks_obtained` decimal(5,2) DEFAULT '0.00',
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_id` (`question_id`,`student_id`),
  KEY `exam_id` (`exam_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_answers_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_answers_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_answers`
--

LOCK TABLES `student_answers` WRITE;
/*!40000 ALTER TABLE `student_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `roll_number` varchar(50) DEFAULT NULL,
  `division` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (1,1,'2007-11-15','9321494004','S2','2026-09-24 21:41:28'),(2,3,'2005-10-27','32','S2','2026-09-26 10:41:59'),(3,5,'2007-05-22','11','s1','2026-09-27 22:24:36'),(4,6,'2007-03-22','40','S2','2026-09-28 09:14:19'),(5,7,'2006-12-28','26','A','2026-10-01 09:14:15');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subject_code` (`subject_code`),
  UNIQUE KEY `subject_name` (`subject_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'AOA','Analysis of Algorithms','2026-09-24 21:00:00'),(2,'COA','Computer Organization and Architecture','2026-09-24 21:00:00'),(3,'DSGT','Discrete Structures and Graph Theory','2026-09-24 21:00:00'),(4,'FSJP','Full Stack Java Programming','2026-09-24 21:00:00'),(5,'MATHS3','Mathematics 3','2026-09-24 21:00:00'),(6,'GENAI','Generative Artificial Intelligence','2026-09-24 21:00:00');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `email_verified` tinyint(1) DEFAULT '0',
  `phone_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_main_admin` tinyint(1) NOT NULL DEFAULT '0',
  `admin_status` enum('active','revoked') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Bhavesh kadam','bhaveshkadam150700@gmail.com','9321494004','$2b$12$/qKXqeBuqp0Z/cS1WyxBhe1Jdk7B8s/E5p19nAS7UQ2GaMp/cjZRq','student',1,0,'2026-09-24 21:41:28','2026-10-06 16:55:34',0,'active'),(2,'Project Java Admin','neetakadam1076@gmail.com','9999999999','$2b$12$eMws8Dtf5op5.aLubdGdjuLzvIieD18MccXcskxuxBuG0i5rPADFa','admin',1,1,'2026-09-25 21:54:27','2026-09-27 11:29:24',1,'active'),(3,'Prathamesh Mohan Gurgude','prathameshgurgude033@gmail.com','9834159731','$2b$12$x7zyWfb4DUEpUlaCjDKit.Zfp0n5sbIJdzb64Vq6EAZeuk.vI.y8W','student',1,0,'2026-09-26 10:41:58','2026-09-26 10:56:03',0,'active'),(4,'Prathamesh Mohan Gurgude','prathameshgurgude0334@gmail.com','9834159733','$2b$10$o8BX8aZjeuaZEXdXeXbpfOGIZHQl1FqCcwhn03wJwUbLWS9Zb.nv6','admin',0,0,'2026-09-27 11:50:48','2026-09-27 11:50:48',0,'active'),(5,'HARSHH GHARAT','rajatmayur18@gmail.com','9321808615','$2b$12$C6SIF0Mr1Ly15qSDIlW4Cu5oYMGyXU52xmgKiHd5d9p/c8XTD6W9e','student',1,0,'2026-09-27 22:24:36','2026-09-27 22:25:14',0,'active'),(6,'Vedant','vedant220307@gmail.com','9372603062','$2b$12$s0.5vzsYVeHmJl/q37NapuWnBskxRoUzW0vl/AF6G0vBvKLJ45yHC','student',0,0,'2026-09-28 09:14:19','2026-09-28 09:14:19',0,'active'),(7,'Shubham','shubham@123gmail.com','9321048935','$2b$12$4BnHIOnyT89TTnpPuvW/DOUUBq5fWatSZUii0TRCdZouuV9eitOxm','student',0,0,'2026-10-01 09:14:15','2026-10-01 09:14:15',0,'active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 23:13:37
