SELECT
  `u`.`id` AS `id`,
  `u`.`name` AS `name`,
  `u`.`email` AS `email`,
  `u`.`ldap` AS `ldap`,
  `u`.`password` AS `password`,
  `u`.`deleted` AS `deleted`,
  GROUP_CONCAT(`r`.`id` SEPARATOR ', ') AS `roleId`,
  `ut`.`id` AS `unitId`
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
  `u`.`ldap`,
  `u`.`password`,
  `u`.`deleted`,
  `ut`.`id`
ORDER BY
  `u`.`created_at` DESC