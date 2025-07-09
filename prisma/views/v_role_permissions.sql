CREATE OR REPLACE VIEW v_role_permissions AS
SELECT
    r.id,
    r.name AS role,
    r.description,
    GROUP_CONCAT(p.name SEPARATOR ', ') AS permissions
FROM
    roles r
    LEFT JOIN role_permissions rp ON r.id = rp.roleId
    LEFT JOIN permissions p ON p.id = rp.permissionId
WHERE r.deleted=0
GROUP BY
    r.id, r.name
ORDER BY
    r.createdAt DESC;