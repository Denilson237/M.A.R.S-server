CREATE
OR REPLACE VIEW v_workflows AS
SELECT 
w.id,
w.name, 
w.description,
w.isActive,
w.createdAt, 
w.createdBy,
w.updatedAt,
w.updatedBy
FROM 
    workflows w
WHERE 
    w.deleted=0
ORDER BY w.createdAt DESC