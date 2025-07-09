-- CreateTable
CREATE TABLE `people` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `delcomId` CHAR(36) NULL,
    `agencyId` CHAR(36) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `people_email_key`(`email`),
    INDEX `people_name_idx`(`name`),
    INDEX `people_email_idx`(`email`),
    INDEX `people_email_deleted_idx`(`email`, `deleted`),
    INDEX `people_agencyId_idx`(`agencyId`),
    INDEX `people_delcomId_idx`(`delcomId`),
    INDEX `people_createdBy_idx`(`createdBy`),
    INDEX `people_updatedBy_idx`(`updatedBy`),
    INDEX `people_deletedBy_idx`(`deletedBy`),
    INDEX `people_deleted_idx`(`deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agencies` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `delcomId` CHAR(36) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `agencies_name_key`(`name`),
    INDEX `agencies_delcomId_idx`(`delcomId`),
    INDEX `agencies_name_idx`(`name`),
    INDEX `agencies_createdBy_idx`(`createdBy`),
    INDEX `agencies_updatedBy_idx`(`updatedBy`),
    INDEX `agencies_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delcoms` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `regionId` CHAR(36) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `delcoms_name_key`(`name`),
    INDEX `delcoms_regionId_idx`(`regionId`),
    INDEX `delcoms_name_idx`(`name`),
    INDEX `delcoms_createdBy_idx`(`createdBy`),
    INDEX `delcoms_updatedBy_idx`(`updatedBy`),
    INDEX `delcoms_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `regions_name_key`(`name`),
    INDEX `regions_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_import_clients_cms` (
    `SERVICE_NUMBER` INTEGER NOT NULL,
    `SUPPLY_POINT` INTEGER NULL,
    `CODE_CLIENT` INTEGER NULL,
    `NOM_CLIENT` VARCHAR(110) NULL,
    `NO_COMPTEUR` VARCHAR(35) NULL,
    `ADRESSE_CLIENT` VARCHAR(85) NULL,
    `CONTACT_CLIENT` VARCHAR(65) NULL,
    `CODE_TARIF_CLIENT` VARCHAR(4) NULL,
    `LIBELLE_TARIF_CLIENT` VARCHAR(30) NULL,
    `CODE_STATUT_CONTRAT` VARCHAR(5) NULL,
    `LIBELLE_STATUT_CONTRAT` TEXT NULL,
    `CODE_TYPE_PHASE` VARCHAR(5) NULL,
    `LIBELLE_TYPE_PHASE` VARCHAR(9) NULL,
    `VOLTAGE_CLIENT` VARCHAR(2) NULL,
    `CODE_REGROUPEMENT` VARCHAR(35) NULL,
    `NOM_REGROUPEMENT` VARCHAR(110) NULL,
    `CENTRE_DE_REVE` INTEGER NULL,
    `TYPE_COMPTEUR` VARCHAR(17) NULL,
    `TYPE_CLIENT` VARCHAR(8) NULL,
    `CATEGORIE_CLIENT` VARCHAR(9) NULL,
    `REGION` VARCHAR(15) NULL,
    `DIVISION` VARCHAR(25) NULL,
    `CODE_AGENCE` INTEGER NULL,
    `AGENCE` VARCHAR(35) NULL,

    INDEX `t_import_clients_cms_SERVICE_NUMBER_idx`(`SERVICE_NUMBER`),
    INDEX `t_import_clients_cms_CODE_CLIENT_idx`(`CODE_CLIENT`),
    INDEX `t_import_clients_cms_NO_COMPTEUR_idx`(`NO_COMPTEUR`),
    PRIMARY KEY (`SERVICE_NUMBER`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_import_factures_cms` (
    `NUMERO_FACTURE` INTEGER NOT NULL,
    `SERVICE_NUMBER` INTEGER NULL,
    `MONTANT_HT` DOUBLE NULL,
    `MONTANT_TAXE` DOUBLE NULL,
    `MONTANT_TTC` DOUBLE NULL,
    `MONTANT_IMPAYE_TTC` DOUBLE NULL,
    `CODE_STATUT_FACTURE` VARCHAR(5) NULL,
    `LIBELLE_STATUT_FACTURE` TEXT NULL,
    `CODE_TYPE_FACTURE` VARCHAR(5) NULL,
    `LIBELLE_TYPE_FACTURE` TEXT NULL,
    `DATE_MAJ_STATUT_FACTURE` VARCHAR(19) NULL,
    `DATE_FACTURATION` VARCHAR(19) NULL,
    `DATE_DISPO_FACTURE` VARCHAR(19) NULL,
    `DATE_LIMITE_PAIEMENT_FACTURE` VARCHAR(19) NULL,

    INDEX `t_import_factures_cms_NUMERO_FACTURE_idx`(`NUMERO_FACTURE`),
    INDEX `t_import_factures_cms_SERVICE_NUMBER_idx`(`SERVICE_NUMBER`),
    PRIMARY KEY (`NUMERO_FACTURE`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers_reference` (
    `id` CHAR(36) NOT NULL,
    `region` CHAR(50) NOT NULL,
    `agency` CHAR(50) NOT NULL,
    `service_no` VARCHAR(191) NOT NULL,
    `client_code` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `client` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `supply_ref` VARCHAR(191) NOT NULL,
    `meter_no` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `customers_reference_region_idx`(`region`),
    INDEX `customers_reference_service_no_idx`(`service_no`),
    INDEX `customers_reference_client_code_idx`(`client_code`),
    INDEX `customers_reference_supply_ref_idx`(`supply_ref`),
    INDEX `customers_reference_meter_no_idx`(`meter_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers_mms_not_readable` (
    `service_number` INTEGER NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `customers_mms_not_readable_service_number_idx`(`service_number`),
    PRIMARY KEY (`service_number`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers_mms_meter_reading` (
    `id` CHAR(36) NOT NULL,
    `METER_NUMBER` VARCHAR(191) NOT NULL,
    `DATE_B` VARCHAR(191) NULL,
    `HEURE_B` VARCHAR(191) NULL,
    `ACTIF_IM_B` VARCHAR(191) NULL,
    `ACTIF_EX_B` VARCHAR(191) NULL,
    `REACTIF_IM_B` VARCHAR(191) NULL,
    `P_MAX_B` VARCHAR(191) NULL,
    `ALARM` VARCHAR(191) NULL,
    `DATE_I` VARCHAR(191) NULL,
    `HEURE_I` VARCHAR(191) NULL,
    `ACTIF_IM_I` VARCHAR(191) NULL,
    `ACTIF_EX_I` VARCHAR(191) NULL,
    `REACTIF_IM_I` VARCHAR(191) NULL,
    `P_MAX_I` VARCHAR(191) NULL,
    `CHECK_METER` VARCHAR(191) NULL,
    `RELAY_STATUS` VARCHAR(191) NULL,
    `READING_DATE` VARCHAR(191) NULL,

    INDEX `customers_mms_meter_reading_METER_NUMBER_idx`(`METER_NUMBER`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `ldap` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NOT NULL,
    `passwordExpiredAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isInActiveAt` DATETIME(3) NULL,
    `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lastFailedLoginAt` DATETIME(3) NULL,
    `peopleId` CHAR(36) NOT NULL,
    `customE_ViewScope` ENUM('AGENCY', 'DELCOM', 'REGION', 'NATIONAL') NULL,
    `isCustomE_ViewScope` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_username_idx`(`username`),
    INDEX `users_peopleId_idx`(`peopleId`),
    INDEX `users_createdBy_idx`(`createdBy`),
    INDEX `users_updatedBy_idx`(`updatedBy`),
    INDEX `users_deletedBy_idx`(`deletedBy`),
    INDEX `users_username_deleted_idx`(`username`, `deleted`),
    INDEX `users_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_scopes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resourceType` ENUM('TICKET', 'CUSTOMER', 'INVOICE', 'METER', 'JOB') NOT NULL,
    `scope` ENUM('AGENCY', 'DELCOM', 'REGION', 'NATIONAL') NOT NULL,
    `targetIds` JSON NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `user_scopes_resourceType_idx`(`resourceType`),
    INDEX `user_scopes_createdBy_idx`(`createdBy`),
    INDEX `user_scopes_updatedBy_idx`(`updatedBy`),
    INDEX `user_scopes_deletedBy_idx`(`deletedBy`),
    UNIQUE INDEX `user_scopes_userId_resourceType_key`(`userId`, `resourceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_password_histories` (
    `id` VARCHAR(191) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_password_histories_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_mfas` (
    `id` VARCHAR(191) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `method` ENUM('TOTP', 'SMS', 'EMAIL', 'RECOVERY_CODE') NOT NULL,
    `secret` VARCHAR(191) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `user_mfas_userId_idx`(`userId`),
    INDEX `user_mfas_method_idx`(`method`),
    INDEX `user_mfas_createdBy_idx`(`createdBy`),
    INDEX `user_mfas_updatedBy_idx`(`updatedBy`),
    INDEX `user_mfas_deletedBy_idx`(`deletedBy`),
    UNIQUE INDEX `user_mfas_userId_method_key`(`userId`, `method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `viewScope` ENUM('AGENCY', 'DELCOM', 'REGION', 'NATIONAL') NOT NULL DEFAULT 'AGENCY',
    `isCustomE_ViewScope` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    INDEX `roles_name_idx`(`name`),
    INDEX `roles_viewScope_idx`(`viewScope`),
    INDEX `roles_isCustomE_ViewScope_idx`(`isCustomE_ViewScope`),
    INDEX `roles_createdBy_idx`(`createdBy`),
    INDEX `roles_updatedBy_idx`(`updatedBy`),
    INDEX `roles_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_scopes` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `resourceType` ENUM('TICKET', 'CUSTOMER', 'INVOICE', 'METER', 'JOB') NOT NULL,
    `scope` ENUM('AGENCY', 'DELCOM', 'REGION', 'NATIONAL') NOT NULL,
    `targetIds` JSON NULL,
    `isOverride` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `role_scopes_roleId_resourceType_idx`(`roleId`, `resourceType`),
    INDEX `role_scopes_roleId_idx`(`roleId`),
    INDEX `role_scopes_createdBy_idx`(`createdBy`),
    INDEX `role_scopes_updatedBy_idx`(`updatedBy`),
    INDEX `role_scopes_deletedBy_idx`(`deletedBy`),
    UNIQUE INDEX `role_scopes_roleId_resourceType_key`(`roleId`, `resourceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `user_roles_userId_idx`(`userId`),
    INDEX `user_roles_roleId_idx`(`roleId`),
    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `permissions_name_key`(`name`),
    INDEX `permissions_name_idx`(`name`),
    INDEX `permissions_createdBy_idx`(`createdBy`),
    INDEX `permissions_updatedBy_idx`(`updatedBy`),
    INDEX `permissions_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `role_permissions_permissionId_idx`(`permissionId`),
    INDEX `role_permissions_roleId_idx`(`roleId`),
    INDEX `role_permissions_createdBy_idx`(`createdBy`),
    INDEX `role_permissions_updatedBy_idx`(`updatedBy`),
    INDEX `role_permissions_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflows` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `workflows_name_key`(`name`),
    INDEX `workflows_name_idx`(`name`),
    INDEX `workflows_isActive_idx`(`isActive`),
    INDEX `workflows_name_isActive_idx`(`name`, `isActive`),
    INDEX `workflows_name_isActive_isDefault_idx`(`name`, `isActive`, `isDefault`),
    INDEX `workflows_createdBy_idx`(`createdBy`),
    INDEX `workflows_updatedBy_idx`(`updatedBy`),
    INDEX `workflows_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_steps` (
    `id` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `workflow_steps_name_idx`(`name`),
    INDEX `workflow_steps_workflowId_idx`(`workflowId`),
    INDEX `workflow_steps_createdBy_idx`(`createdBy`),
    INDEX `workflow_steps_updatedBy_idx`(`updatedBy`),
    INDEX `workflow_steps_deletedBy_idx`(`deletedBy`),
    UNIQUE INDEX `workflow_steps_workflowId_order_key`(`workflowId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_steps_transition` (
    `id` VARCHAR(191) NOT NULL,
    `fromStepId` VARCHAR(191) NOT NULL,
    `toStepId` VARCHAR(191) NOT NULL,
    `conditionType` ENUM('EXPRESSION', 'JSON_SCHEMA') NULL,
    `conditionValue` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `workflow_steps_transition_fromStepId_toStepId_idx`(`fromStepId`, `toStepId`),
    INDEX `workflow_steps_transition_fromStepId_idx`(`fromStepId`),
    INDEX `workflow_steps_transition_createdBy_idx`(`createdBy`),
    INDEX `workflow_steps_transition_updatedBy_idx`(`updatedBy`),
    INDEX `workflow_steps_transition_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_validations` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('ROLE', 'USER', 'AUTO') NOT NULL,
    `stepId` VARCHAR(191) NOT NULL,
    `timeoutHours` INTEGER NULL,
    `timeoutStepId` VARCHAR(191) NULL,
    `requiredApprovals` INTEGER NOT NULL DEFAULT 1,
    `approvalPolicy` ENUM('ANY', 'ALL') NOT NULL DEFAULT 'ANY',
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `workflow_validations_stepId_idx`(`stepId`),
    INDEX `workflow_validations_createdBy_idx`(`createdBy`),
    INDEX `workflow_validations_updatedBy_idx`(`updatedBy`),
    INDEX `workflow_validations_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_validation_roles` (
    `workflowValidationId` CHAR(36) NOT NULL,
    `roleId` CHAR(36) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `workflow_validation_roles_workflowValidationId_idx`(`workflowValidationId`),
    INDEX `workflow_validation_roles_roleId_idx`(`roleId`),
    INDEX `workflow_validation_roles_createdBy_idx`(`createdBy`),
    INDEX `workflow_validation_roles_updatedBy_idx`(`updatedBy`),
    INDEX `workflow_validation_roles_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`workflowValidationId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_validation_users` (
    `workflowValidationId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `workflow_validation_users_workflowValidationId_idx`(`workflowValidationId`),
    INDEX `workflow_validation_users_userId_idx`(`userId`),
    INDEX `workflow_validation_users_createdBy_idx`(`createdBy`),
    INDEX `workflow_validation_users_updatedBy_idx`(`updatedBy`),
    INDEX `workflow_validation_users_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`workflowValidationId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `ticket_types_name_key`(`name`),
    INDEX `ticket_types_name_idx`(`name`),
    INDEX `ticket_types_createdBy_idx`(`createdBy`),
    INDEX `ticket_types_updatedBy_idx`(`updatedBy`),
    INDEX `ticket_types_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_type_reasons` (
    `id` VARCHAR(191) NOT NULL,
    `TicketTypeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `ticket_type_reasons_name_key`(`name`),
    INDEX `ticket_type_reasons_name_idx`(`name`),
    INDEX `ticket_type_reasons_TicketTypeId_idx`(`TicketTypeId`),
    INDEX `ticket_type_reasons_createdBy_idx`(`createdBy`),
    INDEX `ticket_type_reasons_updatedBy_idx`(`updatedBy`),
    INDEX `ticket_type_reasons_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `typeId` CHAR(36) NOT NULL,
    `reasonId` CHAR(36) NOT NULL,
    `unpaidCount` INTEGER NULL DEFAULT 0,
    `unpaidAmount` DOUBLE NULL DEFAULT 0,
    `comment` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'NEW', 'PENDING_WORKFLOW_VALIDATION', 'APPROVED', 'REJECTED', 'IN_PROCESSING', 'COMPLETED', 'BLOCKED', 'CANCELLED') NOT NULL,
    `userId` CHAR(36) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `tickets_reference_idx`(`reference`),
    INDEX `tickets_reasonId_idx`(`reasonId`),
    INDEX `tickets_typeId_idx`(`typeId`),
    INDEX `tickets_status_idx`(`status`),
    INDEX `tickets_createdBy_idx`(`createdBy`),
    INDEX `tickets_updatedBy_idx`(`updatedBy`),
    INDEX `tickets_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_workflow` (
    `ticketId` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `workflowCurrentStepId` VARCHAR(191) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    INDEX `ticket_workflow_ticketId_idx`(`ticketId`),
    INDEX `ticket_workflow_workflowId_idx`(`workflowId`),
    INDEX `ticket_workflow_workflowCurrentStepId_idx`(`workflowCurrentStepId`),
    INDEX `ticket_workflow_createdBy_idx`(`createdBy`),
    INDEX `ticket_workflow_updatedBy_idx`(`updatedBy`),
    INDEX `ticket_workflow_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`ticketId`, `workflowId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_workflow_validation_actions` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` CHAR(36) NOT NULL,
    `workflowStepId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `validatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('APPROVED', 'REJECTED') NOT NULL,
    `comment` VARCHAR(191) NULL,

    INDEX `ticket_workflow_validation_actions_ticketId_idx`(`ticketId`),
    INDEX `ticket_workflow_validation_actions_workflowStepId_idx`(`workflowStepId`),
    INDEX `ticket_workflow_validation_actions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_histories` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` CHAR(36) NOT NULL,
    `fromStepId` CHAR(36) NULL,
    `toStepId` VARCHAR(191) NULL,
    `actionById` VARCHAR(191) NOT NULL,
    `actionAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `comment` VARCHAR(191) NULL,
    `workflowStepId` VARCHAR(191) NULL,

    INDEX `ticket_histories_fromStepId_toStepId_idx`(`fromStepId`, `toStepId`),
    INDEX `ticket_histories_fromStepId_idx`(`fromStepId`),
    INDEX `ticket_histories_ticketId_idx`(`ticketId`),
    INDEX `ticket_histories_actionAt_idx`(`actionAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_locks` (
    `job_name` VARCHAR(191) NOT NULL,
    `is_running` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `job_locks_is_running_idx`(`is_running`),
    PRIMARY KEY (`job_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `ressource` VARCHAR(191) NOT NULL,
    `action` ENUM('DISCONNECT', 'RECONNECT', 'CREATE', 'READ', 'UPDATE', 'DELETE') NOT NULL,
    `app` ENUM('MMS', 'CMS', 'SAP') NOT NULL,
    `appJobId` VARCHAR(191) NULL,
    `error` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `jobs_ressource_idx`(`ressource`),
    INDEX `jobs_app_idx`(`app`),
    INDEX `jobs_appJobId_idx`(`appJobId`),
    INDEX `jobs_action_idx`(`action`),
    INDEX `jobs_status_idx`(`status`),
    INDEX `jobs_userId_idx`(`userId`),
    INDEX `jobs_ticketId_idx`(`ticketId`),
    INDEX `jobs_app_status_idx`(`app`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` CHAR(36) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` VARCHAR(5000) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `source` ENUM('USER', 'SYSTEM') NOT NULL,

    INDEX `audits_userId_idx`(`userId`),
    INDEX `audits_action_idx`(`action`),
    INDEX `audits_source_idx`(`source`),
    INDEX `audits_endpoint_idx`(`endpoint`),
    INDEX `audits_ipAddress_idx`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `method` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'INTERN', 'AVAILABLE') NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(5000) NOT NULL,
    `template` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unread',
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_email_idx`(`email`),
    INDEX `notifications_phone_idx`(`phone`),
    INDEX `notifications_method_idx`(`method`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_sent_idx`(`sent`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banks` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(191) NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `banks_name_key`(`name`),
    INDEX `banks_name_idx`(`name`),
    INDEX `banks_code_idx`(`code`),
    INDEX `banks_createdBy_idx`(`createdBy`),
    INDEX `banks_updatedBy_idx`(`updatedBy`),
    INDEX `banks_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_agencies` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `account_number` VARCHAR(191) NULL,
    `bankId` CHAR(36) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `bank_agencies_name_key`(`name`),
    INDEX `bank_agencies_bankId_idx`(`bankId`),
    INDEX `bank_agencies_name_idx`(`name`),
    INDEX `bank_agencies_code_idx`(`code`),
    INDEX `bank_agencies_town_idx`(`town`),
    INDEX `bank_agencies_account_number_idx`(`account_number`),
    INDEX `bank_agencies_createdBy_idx`(`createdBy`),
    INDEX `bank_agencies_updatedBy_idx`(`updatedBy`),
    INDEX `bank_agencies_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_modes` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `payment_modes_name_key`(`name`),
    INDEX `payment_modes_name_idx`(`name`),
    INDEX `payment_modes_createdBy_idx`(`createdBy`),
    INDEX `payment_modes_updatedBy_idx`(`updatedBy`),
    INDEX `payment_modes_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `createdBy` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` CHAR(36) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` CHAR(36) NULL,

    UNIQUE INDEX `status_name_key`(`name`),
    INDEX `status_name_idx`(`name`),
    INDEX `status_createdBy_idx`(`createdBy`),
    INDEX `status_updatedBy_idx`(`updatedBy`),
    INDEX `status_deletedBy_idx`(`deletedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_delcomId_fkey` FOREIGN KEY (`delcomId`) REFERENCES `delcoms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_agencyId_fkey` FOREIGN KEY (`agencyId`) REFERENCES `agencies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agencies` ADD CONSTRAINT `agencies_delcomId_fkey` FOREIGN KEY (`delcomId`) REFERENCES `delcoms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agencies` ADD CONSTRAINT `agencies_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agencies` ADD CONSTRAINT `agencies_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agencies` ADD CONSTRAINT `agencies_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delcoms` ADD CONSTRAINT `delcoms_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delcoms` ADD CONSTRAINT `delcoms_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delcoms` ADD CONSTRAINT `delcoms_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delcoms` ADD CONSTRAINT `delcoms_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regions` ADD CONSTRAINT `regions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regions` ADD CONSTRAINT `regions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regions` ADD CONSTRAINT `regions_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_reference` ADD CONSTRAINT `customers_reference_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_reference` ADD CONSTRAINT `customers_reference_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_reference` ADD CONSTRAINT `customers_reference_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_mms_not_readable` ADD CONSTRAINT `customers_mms_not_readable_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_mms_not_readable` ADD CONSTRAINT `customers_mms_not_readable_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers_mms_not_readable` ADD CONSTRAINT `customers_mms_not_readable_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_peopleId_fkey` FOREIGN KEY (`peopleId`) REFERENCES `people`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_scopes` ADD CONSTRAINT `user_scope_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_scopes` ADD CONSTRAINT `user_scopes_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_scopes` ADD CONSTRAINT `user_scopes_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_scopes` ADD CONSTRAINT `user_scopes_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_password_histories` ADD CONSTRAINT `user_password_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mfas` ADD CONSTRAINT `user_mfas_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mfas` ADD CONSTRAINT `user_mfas_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mfas` ADD CONSTRAINT `user_mfas_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mfas` ADD CONSTRAINT `user_mfas_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_scopes` ADD CONSTRAINT `role_scopes_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_scopes` ADD CONSTRAINT `role_scopes_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_scopes` ADD CONSTRAINT `role_scopes_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_scopes` ADD CONSTRAINT `role_scopes_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflows` ADD CONSTRAINT `workflows_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflows` ADD CONSTRAINT `workflows_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflows` ADD CONSTRAINT `workflows_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps_transition` ADD CONSTRAINT `workflow_steps_transition_fromStepId_fkey` FOREIGN KEY (`fromStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps_transition` ADD CONSTRAINT `workflow_steps_transition_toStepId_fkey` FOREIGN KEY (`toStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps_transition` ADD CONSTRAINT `workflow_steps_transition_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps_transition` ADD CONSTRAINT `workflow_steps_transition_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps_transition` ADD CONSTRAINT `workflow_steps_transition_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validations` ADD CONSTRAINT `workflow_validations_stepId_fkey` FOREIGN KEY (`stepId`) REFERENCES `workflow_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validations` ADD CONSTRAINT `workflow_validations_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validations` ADD CONSTRAINT `workflow_validations_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validations` ADD CONSTRAINT `workflow_validations_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_roles` ADD CONSTRAINT `workflow_validation_roles_workflowValidationId_fkey` FOREIGN KEY (`workflowValidationId`) REFERENCES `workflow_validations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_roles` ADD CONSTRAINT `workflow_validation_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_roles` ADD CONSTRAINT `workflow_validation_roles_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_roles` ADD CONSTRAINT `workflow_validation_roles_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_roles` ADD CONSTRAINT `workflow_validation_roles_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_users` ADD CONSTRAINT `workflow_validation_users_workflowValidationId_fkey` FOREIGN KEY (`workflowValidationId`) REFERENCES `workflow_validations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_users` ADD CONSTRAINT `workflow_validation_users_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_users` ADD CONSTRAINT `workflow_validation_users_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_users` ADD CONSTRAINT `workflow_validation_users_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_validation_users` ADD CONSTRAINT `workflow_validation_users_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_types` ADD CONSTRAINT `ticket_types_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_types` ADD CONSTRAINT `ticket_types_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_types` ADD CONSTRAINT `ticket_types_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_type_reasons` ADD CONSTRAINT `ticket_type_reasons_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_type_reasons` ADD CONSTRAINT `ticket_type_reasons_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_type_reasons` ADD CONSTRAINT `ticket_type_reasons_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_type_reasons` ADD CONSTRAINT `ticket_type_reasons_TicketTypeId_fkey` FOREIGN KEY (`TicketTypeId`) REFERENCES `ticket_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `ticket_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_reasonId_fkey` FOREIGN KEY (`reasonId`) REFERENCES `ticket_type_reasons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_workflowCurrentStepId_fkey` FOREIGN KEY (`workflowCurrentStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow` ADD CONSTRAINT `ticket_workflow_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow_validation_actions` ADD CONSTRAINT `ticket_workflow_validation_actions_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow_validation_actions` ADD CONSTRAINT `ticket_workflow_validation_actions_workflowStepId_fkey` FOREIGN KEY (`workflowStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_workflow_validation_actions` ADD CONSTRAINT `ticket_workflow_validation_actions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_histories` ADD CONSTRAINT `ticket_histories_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_histories` ADD CONSTRAINT `ticket_histories_fromStepId_fkey` FOREIGN KEY (`fromStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_histories` ADD CONSTRAINT `ticket_histories_toStepId_fkey` FOREIGN KEY (`toStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_histories` ADD CONSTRAINT `ticket_histories_actionById_fkey` FOREIGN KEY (`actionById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_histories` ADD CONSTRAINT `ticket_histories_workflowStepId_fkey` FOREIGN KEY (`workflowStepId`) REFERENCES `workflow_steps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audits` ADD CONSTRAINT `audits_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banks` ADD CONSTRAINT `banks_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banks` ADD CONSTRAINT `banks_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banks` ADD CONSTRAINT `banks_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_agencies` ADD CONSTRAINT `bank_agencies_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `banks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_agencies` ADD CONSTRAINT `bank_agencies_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_agencies` ADD CONSTRAINT `bank_agencies_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_agencies` ADD CONSTRAINT `bank_agencies_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_modes` ADD CONSTRAINT `payment_modes_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_modes` ADD CONSTRAINT `payment_modes_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_modes` ADD CONSTRAINT `payment_modes_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status` ADD CONSTRAINT `status_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status` ADD CONSTRAINT `status_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status` ADD CONSTRAINT `status_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
