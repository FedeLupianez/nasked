import { MigrationInterface, QueryRunner } from "typeorm";

export class AccountIdBinary1790864230817 implements MigrationInterface {
    name = 'AccountIdBinary1790864230817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` DROP FOREIGN KEY \`FK_de9994edc6f300c3d36373d8a99\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Accounts\` MODIFY \`id_account\` binary(16) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` MODIFY \`id_account\` binary(16) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` ADD CONSTRAINT \`FK_de9994edc6f300c3d36373d8a99\` FOREIGN KEY (\`id_account\`) REFERENCES \`Nasked_Accounts\`(\`id_account\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    /**
     * Revertir el tipo es destructivo: los ids uuid(16) no tienen representacion
     * en int UNSIGNED, solo los ids heredados (int -&gt; binary con padding) se recuperan.
     */
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` DROP FOREIGN KEY \`FK_de9994edc6f300c3d36373d8a99\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Accounts\` MODIFY \`id_account\` int UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` MODIFY \`id_account\` int UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`Accounts_Companies\` ADD CONSTRAINT \`FK_de9994edc6f300c3d36373d8a99\` FOREIGN KEY (\`id_account\`) REFERENCES \`Nasked_Accounts\`(\`id_account\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}