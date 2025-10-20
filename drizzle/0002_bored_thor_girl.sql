CREATE TABLE `examRankings` (
	`id` varchar(64) NOT NULL,
	`examRecordId` varchar(64) NOT NULL,
	`ranking` int NOT NULL,
	`totalStudents` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `examRankings_id` PRIMARY KEY(`id`)
);
