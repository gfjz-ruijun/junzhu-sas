CREATE TABLE `examRecords` (
	`id` varchar(64) NOT NULL,
	`subjectId` varchar(64) NOT NULL,
	`examDate` varchar(10) NOT NULL,
	`examType` enum('小测','周测','月考','期中考','期末考','模拟考','中考','高考','其他') NOT NULL,
	`totalScore` int NOT NULL,
	`actualScore` int NOT NULL,
	`scoreRatio` decimal(5,4) NOT NULL,
	`difficulty` enum('简单','中等','困难') NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `examRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
