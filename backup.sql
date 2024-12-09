-- Backup hele databasen
mysqldump -u [username] -p CBZHotels > CBZHotels_Def.sql

-- Eller specifik backup af konference data
mysqldump -u [username] -p CBZHotels konference_bookinger > konference_backup.sql