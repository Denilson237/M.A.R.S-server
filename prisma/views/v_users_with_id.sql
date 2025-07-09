   
CREATE OR REPLACE VIEW v_users_id AS
SELECT
    u.id,
    p.name,
    p.email,
    u.username,
    u.ldap,
    u.password,
    u.isActive,
    u.deleted,
    GROUP_CONCAT(r.id SEPARATOR ', ') AS roleId,
    d.id AS delcomId
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
     u.username,
    u.ldap,
    u.password,
    u.deleted,
    d.id
ORDER BY
    u.createdAt DESC;
   
   