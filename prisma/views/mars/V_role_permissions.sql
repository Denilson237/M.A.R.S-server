SELECT
  `r`.`id` AS `id`,
  `r`.`name` AS `role`,
  GROUP_CONCAT(`p`.`name` SEPARATOR ', ') AS `permissions`
FROM
  (
    (
      `mars`.`roles` `r`
      LEFT JOIN `mars`.`role_permissions` `rp` ON((`r`.`id` = `rp`.`roleId`))
    )
    LEFT JOIN `mars`.`permissions` `p` ON((`p`.`id` = `rp`.`permissionId`))
  )
GROUP BY
  `r`.`id`,
  `r`.`name`
ORDER BY
  `r`.`created_at` DESC