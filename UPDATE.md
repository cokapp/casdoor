

-- 修改 organization 表
ALTER TABLE organization MODIFY COLUMN nav_items MEDIUMTEXT;
ALTER TABLE organization MODIFY COLUMN widget_items MEDIUMTEXT;
ALTER TABLE organization MODIFY COLUMN account_items MEDIUMTEXT;

-- 修改 user 表
ALTER TABLE `user` MODIFY COLUMN recovery_codes MEDIUMTEXT;
-- avatar 已经在日志中显示成功修改为 TEXT，如果没成功也可以手动改
ALTER TABLE `user` MODIFY COLUMN avatar TEXT; 