import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790693218971 implements MigrationInterface {
    name = 'InitialSchema1790693218971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Nasked_Accounts\` (\`id_account\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`lastname\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`profile_image\` varchar(2048) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id_account\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Categories\` (\`id_category\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`category\` varchar(255) NOT NULL, PRIMARY KEY (\`id_category\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Plans\` (\`id_plan\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`employees\` int UNSIGNED NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id_plan\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_FieldsValues\` (\`id_field_value\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`value\` varchar(255) NOT NULL DEFAULT '', \`id_field\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_field_value\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Fields\` (\`id_field\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`required\` tinyint NOT NULL DEFAULT 0, \`options\` json NOT NULL, \`type\` enum ('0', '1', '2', '3', '4') NOT NULL DEFAULT '1', \`id_card\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_field\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Cards\` (\`id_card\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`deadline\` timestamp NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`id_folder\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_card\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Folders\` (\`id_folder\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`token\` varchar(6) NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`id_company\` int UNSIGNED NOT NULL, \`belong_id\` int UNSIGNED NULL, PRIMARY KEY (\`id_folder\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Payments\` (\`id_payment\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`paid_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`provider_txn_id\` varchar(255) NOT NULL, \`amount\` decimal(8,2) NOT NULL, \`currency\` char(3) NOT NULL, \`status\` enum ('0', '1', '2') NOT NULL DEFAULT '0', \`id_bill\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_payment\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Bills\` (\`id_bill\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`invoice_num\` varchar(6) NOT NULL, \`price\` decimal(8,2) NOT NULL, \`status\` enum ('0', '1', '2', '3') NOT NULL DEFAULT '0', \`detail\` varchar(255) NOT NULL, \`discount\` float NOT NULL DEFAULT '0', \`issue_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`next_billing\` timestamp NULL, \`period_start\` timestamp NOT NULL, \`period_end\` timestamp NOT NULL, \`currency\` char(3) NOT NULL, \`id_company\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_bill\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Companies\` (\`id_company\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`logo\` varchar(2048) NULL, \`created_at\` date NOT NULL DEFAULT CURRENT_DATE, \`status\` enum ('0', '1', '2') NOT NULL DEFAULT '0', \`id_plan\` int UNSIGNED NOT NULL, PRIMARY KEY (\`id_company\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Accounts_Companies\` (\`id_account_company\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`id_account\` int UNSIGNED NOT NULL, \`id_company\` int UNSIGNED NOT NULL, \`id_role\` int UNSIGNED NOT NULL, UNIQUE INDEX \`UQ_Accounts_Companies\` (\`id_account\`, \`id_company\`), PRIMARY KEY (\`id_account_company\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Roles\` (\`id_role\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`role\` varchar(255) NOT NULL, PRIMARY KEY (\`id_role\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Nasked_Permissions\` (\`id_permission\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`permission\` varchar(255) NOT NULL, PRIMARY KEY (\`id_permission\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Companies_Categories\` (\`id_company\` int UNSIGNED NOT NULL, \`id_category\` int UNSIGNED NOT NULL, INDEX \`IDX_7ce232341cbfec544a1e2473e9\` (\`id_company\`), INDEX \`IDX_037c047675edb6fdac89c6e3d5\` (\`id_category\`), PRIMARY KEY (\`id_company\`, \`id_category\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Roles_Permissions\` (\`id_role\` int UNSIGNED NOT NULL, \`id_permission\` int UNSIGNED NOT NULL, INDEX \`IDX_f804b01e2090f9bab2197dfab2\` (\`id_role\`), INDEX \`IDX_d9956b5b30e937126fe942027d\` (\`id_permission\`), PRIMARY KEY (\`id_role\`, \`id_permission\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Nasked_FieldsValues\` ADD CONSTRAINT \`FK_d3307230d42697c533315460d3d\` FOREIGN KEY (\`id_field\`) REFERENCES \`Nasked_Fields\`(\`id_field\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Fields\` ADD CONSTRAINT \`FK_85f89c0476a811af1da3bb6bcbb\` FOREIGN KEY (\`id_card\`) REFERENCES \`Nasked_Cards\`(\`id_card\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Cards\` ADD CONSTRAINT \`FK_f2fda5460bc22863164c68613b9\` FOREIGN KEY (\`id_folder\`) REFERENCES \`Nasked_Folders\`(\`id_folder\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Folders\` ADD CONSTRAINT \`FK_e607b7af888546cc957ee57eb93\` FOREIGN KEY (\`id_company\`) REFERENCES \`Nasked_Companies\`(\`id_company\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Folders\` ADD CONSTRAINT \`FK_537a9fbfba30e17365be5be39f2\` FOREIGN KEY (\`belong_id\`) REFERENCES \`Nasked_Folders\`(\`id_folder\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Payments\` ADD CONSTRAINT \`FK_8d35a49c954aa15b1fb13cdf00e\` FOREIGN KEY (\`id_bill\`) REFERENCES \`Nasked_Bills\`(\`id_bill\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Bills\` ADD CONSTRAINT \`FK_912a9eeb29296ea746405b966b1\` FOREIGN KEY (\`id_company\`) REFERENCES \`Nasked_Companies\`(\`id_company\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Companies\` ADD CONSTRAINT \`FK_1e601ac24aaf3833ab1d6c4be0c\` FOREIGN KEY (\`id_plan\`) REFERENCES \`Nasked_Plans\`(\`id_plan\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` ADD CONSTRAINT \`FK_de9994edc6f300c3d36373d8a99\` FOREIGN KEY (\`id_account\`) REFERENCES \`Nasked_Accounts\`(\`id_account\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` ADD CONSTRAINT \`FK_5db2d3ae97a48762e3643387add\` FOREIGN KEY (\`id_company\`) REFERENCES \`Nasked_Companies\`(\`id_company\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` ADD CONSTRAINT \`FK_370dac260c366d8fe4b62c5840c\` FOREIGN KEY (\`id_role\`) REFERENCES \`Nasked_Roles\`(\`id_role\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Companies_Categories\` ADD CONSTRAINT \`FK_7ce232341cbfec544a1e2473e9c\` FOREIGN KEY (\`id_company\`) REFERENCES \`Nasked_Companies\`(\`id_company\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`Companies_Categories\` ADD CONSTRAINT \`FK_037c047675edb6fdac89c6e3d56\` FOREIGN KEY (\`id_category\`) REFERENCES \`Nasked_Categories\`(\`id_category\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`Roles_Permissions\` ADD CONSTRAINT \`FK_f804b01e2090f9bab2197dfab29\` FOREIGN KEY (\`id_role\`) REFERENCES \`Nasked_Roles\`(\`id_role\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`Roles_Permissions\` ADD CONSTRAINT \`FK_d9956b5b30e937126fe942027d5\` FOREIGN KEY (\`id_permission\`) REFERENCES \`Nasked_Permissions\`(\`id_permission\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Roles_Permissions\` DROP FOREIGN KEY \`FK_d9956b5b30e937126fe942027d5\``);
        await queryRunner.query(`ALTER TABLE \`Roles_Permissions\` DROP FOREIGN KEY \`FK_f804b01e2090f9bab2197dfab29\``);
        await queryRunner.query(`ALTER TABLE \`Companies_Categories\` DROP FOREIGN KEY \`FK_037c047675edb6fdac89c6e3d56\``);
        await queryRunner.query(`ALTER TABLE \`Companies_Categories\` DROP FOREIGN KEY \`FK_7ce232341cbfec544a1e2473e9c\``);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` DROP FOREIGN KEY \`FK_370dac260c366d8fe4b62c5840c\``);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` DROP FOREIGN KEY \`FK_5db2d3ae97a48762e3643387add\``);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` DROP FOREIGN KEY \`FK_de9994edc6f300c3d36373d8a99\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Companies\` DROP FOREIGN KEY \`FK_1e601ac24aaf3833ab1d6c4be0c\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Bills\` DROP FOREIGN KEY \`FK_912a9eeb29296ea746405b966b1\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Payments\` DROP FOREIGN KEY \`FK_8d35a49c954aa15b1fb13cdf00e\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Folders\` DROP FOREIGN KEY \`FK_537a9fbfba30e17365be5be39f2\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Folders\` DROP FOREIGN KEY \`FK_e607b7af888546cc957ee57eb93\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Cards\` DROP FOREIGN KEY \`FK_f2fda5460bc22863164c68613b9\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Fields\` DROP FOREIGN KEY \`FK_85f89c0476a811af1da3bb6bcbb\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_FieldsValues\` DROP FOREIGN KEY \`FK_d3307230d42697c533315460d3d\``);
        await queryRunner.query(`DROP INDEX \`IDX_d9956b5b30e937126fe942027d\` ON \`Roles_Permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_f804b01e2090f9bab2197dfab2\` ON \`Roles_Permissions\``);
        await queryRunner.query(`DROP TABLE \`Roles_Permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_037c047675edb6fdac89c6e3d5\` ON \`Companies_Categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_7ce232341cbfec544a1e2473e9\` ON \`Companies_Categories\``);
        await queryRunner.query(`DROP TABLE \`Companies_Categories\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Permissions\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Roles\``);
        await queryRunner.query(`DROP INDEX \`UQ_Accounts_Companies\` ON \`Accounts_Companies\``);
        await queryRunner.query(`DROP TABLE \`Accounts_Companies\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Companies\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Bills\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Payments\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Folders\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Cards\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Fields\``);
        await queryRunner.query(`DROP TABLE \`Nasked_FieldsValues\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Plans\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Categories\``);
        await queryRunner.query(`DROP TABLE \`Nasked_Accounts\``);
    }

}
