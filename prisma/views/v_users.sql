CREATE OR REPLACE VIEW v_users AS
SELECT
    u.id,
    p.name,
    p.email,
    p.phone,
    u.username,
    u.ldap,
    CASE
        WHEN u.isActive = 0 THEN 'inactive'
        ELSE 'active'
    END AS status,
    u.isActive,
    u.deleted,
    u.deletedAt,
    GROUP_CONCAT(r.name SEPARATOR ', ') AS roles,
    d.name AS delcom,
    u.createdAt,
    u.updatedAt
FROM
    users u
    LEFT JOIN people p ON p.id = u.peopleId
    LEFT JOIN user_roles ur ON u.id = ur.userId
    LEFT JOIN roles r ON r.id = ur.roleId
    LEFT JOIN delcoms d ON d.id = p.delcomId
WHERE u.deleted = 0
GROUP BY
    u.id,
    p.name,
    p.email,
    p.phone,
    u.username,
    u.ldap,
    d.name
ORDER BY
    u.createdAt DESC;