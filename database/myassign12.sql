-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 08, 2025 at 01:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myassign12`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `id` int(11) NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `status` enum('accept','decline') DEFAULT NULL,
  `action_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`id`, `user`, `post_id`, `status`, `action_time`) VALUES
(58, 'aaa', 10, 'accept', '2025-12-07 13:50:00'),
(59, 'aaa', 9, 'accept', '2025-12-07 13:50:02'),
(60, 'aaa', 5, 'accept', '2025-12-07 13:50:20'),
(61, 'fff', 10, 'accept', '2025-12-07 13:51:51'),
(62, 'fff', 9, 'decline', '2025-12-07 13:51:54'),
(63, 'jj', 11, 'accept', '2025-12-07 14:01:03'),
(65, 'jj', 9, 'decline', '2025-12-07 14:01:09'),
(67, 'luigi', 11, 'decline', '2025-12-07 14:04:18'),
(68, 'sss', 11, 'accept', '2025-12-07 14:16:03'),
(69, 'xoxo', 11, 'accept', '2025-12-07 14:31:22'),
(70, 'xoxo', 10, 'decline', '2025-12-07 14:31:26'),
(71, 'sss', 14, 'accept', '2025-12-07 14:32:53'),
(72, 'sss', 14, 'accept', '2025-12-07 16:48:53'),
(73, 'sss', 11, 'decline', '2025-12-07 16:48:55'),
(74, 'sss', 14, 'accept', '2025-12-07 16:53:27'),
(75, 'sss', 14, 'accept', '2025-12-07 18:21:24'),
(76, 'sss', 14, 'accept', '2025-12-08 11:34:12'),
(77, 'sss', 11, 'decline', '2025-12-08 11:34:14'),
(78, 'sss', 10, 'accept', '2025-12-08 11:34:15'),
(79, 'sss', 9, 'decline', '2025-12-08 11:34:16'),
(80, 'sss', 5, 'accept', '2025-12-08 11:34:18');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user` varchar(50) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `comment_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user`, `post_id`, `comment`, `comment_time`) VALUES
(2, 'sss', 5, 'wow', '2025-12-05 20:20:30'),
(4, 'aaa', 5, 'cool!', '2025-12-07 13:50:15'),
(5, 'aaa', 10, 'Good', '2025-12-07 13:50:50'),
(6, 'fff', 5, 'good', '2025-12-07 13:52:25'),
(7, 'sss', 11, 'เยี่ยมเลย!', '2025-12-07 13:54:04'),
(8, 'jj', 11, 'cool!', '2025-12-07 14:01:01'),
(9, 'luigi', 12, 'cool!', '2025-12-07 14:04:13'),
(10, 'xoxo', 11, 'น่าสนใจมาก', '2025-12-07 14:31:20');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `post_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `event_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user`, `title`, `message`, `img`, `post_date`, `event_date`) VALUES
(5, 'Earth', 'NEW', 'เก็บขยะริมหาด', '1764958823090-beach.jpg', '2025-12-05 18:20:23', NULL),
(9, 'sss', 'Cleaning city', 'เก็บขยะภายในเมือง', '[\"1765114823598-Volunteer.jpg\"]', '2025-12-07 13:32:21', '2025-12-24'),
(10, 'keroro', 'Reforstation', 'ร่วมกันรักษาธรรมชาติ', '[\"1765114656973-Forest.jpg\"]', '2025-12-07 13:36:22', '2025-12-19'),
(11, 'kero123', 'forest Bag', 'เก็บขยะที่ป่า', '[\"1765115616977-Test2.png\"]', '2025-12-07 13:53:36', '2025-12-17'),
(14, 'xoxo', 'Beach Cleaning', 'เก็บขยะที่ชายทะเล จังหวัดชลบุรี', '[\"1765117956809-1765116328623-test3.jpg\"]', '2025-12-07 14:32:36', '2025-12-20'),
(15, 'Mari', 'Planting Replacement Trees', 'ร่วมกันปลูกป่า', '[\"1765197751929-Forest2.png\"]', '2025-12-08 12:42:31', '2025-12-30'),
(16, 'Mari', 'We Are Volunteers', 'อาสาออกแบบโปสเตอร์ให้มูลนิธิ', '[\"1765197999044-Team2.png\"]', '2025-12-08 12:46:39', '2026-01-17'),
(17, 'mario', 'Reforestation in Wetlands', 'ปลูกป่าชายเลนเพื่อรักษาสิ่งแวดล้อม', '[\"1765198250758-Forest1.png\"]', '2025-12-08 12:50:50', '2026-01-10'),
(18, 'mario', 'CleanTeam', 'ร่วมกันเก็บขยะตามพื้นที่ต่างๆภายในเมือง', '[\"1765198332577-Team1.png\"]', '2025-12-08 12:52:12', '2026-01-20'),
(19, 'luigi', 'Cleaning Park', 'เก็บขยะที่สวนสาธารณะ', '[\"1765198545176-clean.png\"]', '2025-12-08 12:55:45', '2025-12-21'),
(20, 'luigi', 'Elderly Care', 'กิจกรรมร่วมดูเเลผู้สูงอายุ', '[\"1765198688712-Care1.png\"]', '2025-12-08 12:58:08', '2025-12-13');

-- --------------------------------------------------------

--
-- Table structure for table `userinfo`
--

CREATE TABLE `userinfo` (
  `id` int(11) NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `img` varchar(100) DEFAULT NULL,
  `firstname` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL,
  `newsletter` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userinfo`
--

INSERT INTO `userinfo` (`id`, `reg_date`, `username`, `email`, `password`, `img`, `firstname`, `lastname`, `newsletter`) VALUES
(1, '2025-12-05 18:19:46', 'Earth', 'aa@gmail.com', 'aaa', 'avatar-1764958738721.jpg', NULL, NULL, 0),
(3, '2025-12-05 14:04:56', 'keroro', 'kc@gmail.com', '555', 'avatar-1764943488039.jpg', 'KMUTT', 'Chorus', 1),
(5, '2025-12-07 14:27:17', 'sss', 'chatwara.12@gmail.com', '111', 'avatar-1765114364303.jpg', 'gogo', 'wentgone', 0),
(6, '2025-12-07 06:49:44', 'aaa', 'cc@gmail.com', '333', 'avatar.png', 'Natthatida', 'Chatwaraporn', 0),
(7, '2025-12-07 13:52:48', 'kero123', 'ff@gmail.com', 'fff', 'avatar-1765115557780.jpg', 'fish', 'bone', 0),
(8, '2025-12-07 14:02:00', 'jj', 'jj@gmail.com', '456', 'avatar-1765116085117.jpg', 'host', 'wentgone', 0),
(10, '2025-12-07 14:31:37', 'xoxo', 'mavrobkroppvcw6@outlook.com', '111222', 'avatar-1765117897342.jpg', 'Natthatida', 'Chatwaraporn', 0),
(11, '2025-12-08 12:47:30', 'mario', 'chatwara.12@gmail.com', 'sss', 'avatar-1765198050422.jpg', 'gogo', 'wentgone', 0),
(12, '2025-12-08 12:41:02', 'Mari', 'a@gmail.com', 'Mo123', 'avatar-1765197662133.jpg', 'deja', 'mala', 0),
(13, '2025-12-08 12:54:42', 'luigi', 'gg@gmail.com', 'mario123', 'avatar-1765198482346.png', 'luigi', 'gg', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `userinfo`
--
ALTER TABLE `userinfo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `userinfo`
--
ALTER TABLE `userinfo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
