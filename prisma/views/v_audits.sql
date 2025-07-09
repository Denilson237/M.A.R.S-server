CREATE
OR REPLACE VIEW v_audits AS
SELECT 
a.id,
a.createdAt,
DATE_FORMAT(a.createdAt, '%d/%m/%Y %H:%i:%s') as createdAtFormated,
a.`action` ,
a.source,
a.userId ,
p.name as userName,
p.email as userEmail, 
a.ipAddress, 
a.details ,
a.endpoint 
FROM 
    audits a 
    LEFT JOIN users u on a.userId = u.id 
    LEFT JOIN people p on u.peopleId = p.id
ORDER BY a.createdAt DESC