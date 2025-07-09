SELECT
  `u`.`id` AS `id`,
  `u`.`name` AS `name`,
  `u`.`email` AS `email`,
  `u`.`phone` AS `phone`,
  `u`.`ldap` AS `ldap`,
(
    CASE
      WHEN (`u`.`deleted` = 1) THEN 'inactive'
      ELSE 'active'
    END
  ) AS `status`,
  `u`.`deleted` AS `deleted`,
  `u`.`deletedAt` AS `deletedAt`,
  GROUP_CONCAT(`r`.`name` SEPARATOR ', ') AS `roles`,
  `ut`.`name` AS `unit`,
  `u`.`created_at` AS `createdAt`,
  `u`.`updated_at` AS `updatedAt`
FROM
  (
    (
      (
        `mars`.`users` `u`
        LEFT JOIN `mars`.`user_roles` `ur` ON((`u`.`id` = `ur`.`userId`))
      )
      LEFT JOIN `mars`.`roles` `r` ON((`r`.`id` = `ur`.`roleId`))
    )
    LEFT JOIN `mars`.`units` `ut` ON((`ut`.`id` = `u`.`unitId`))
  )
GROUP BY
  `u`.`id`,
  `u`.`name`,
  `u`.`email`,
  `u`.`phone`,
  `u`.`ldap`,
  `ut`.`name`
ORDER BY
  `u`.`created_at` DESC