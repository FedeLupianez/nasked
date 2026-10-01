import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokens1790862793214 implements MigrationInterface {
    name = 'RefreshTokens1790862793214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Nasked_RefreshTokens\` (\`id_token\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`tokenHashed\` binary(32) NOT NULL, \`email\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`limit_date\` timestamp NULL, INDEX \`IDX_85568b1cb8cd56b2aedb86bff6\` (\`tokenHashed\`), INDEX \`IDX_11a3434b3fccc53caa50e755a4\` (\`email\`), PRIMARY KEY (\`id_token\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Nasked_Companies\` CHANGE \`created_at\` \`created_at\` date NOT NULL DEFAULT CURRENT_DATE`);
        await queryRunner.query(`CREATE INDEX \`IDX_06ebc843d5a4c8fc5165e834c5\` ON \`Nasked_Accounts\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`Nasked_RefreshTokens\` ADD CONSTRAINT \`FK_11a3434b3fccc53caa50e755a42\` FOREIGN KEY (\`email\`) REFERENCES \`Nasked_Accounts\`(\`email\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Nasked_RefreshTokens\` DROP FOREIGN KEY \`FK_11a3434b3fccc53caa50e755a42\``);
        await queryRunner.query(`DROP INDEX \`IDX_06ebc843d5a4c8fc5165e834c5\` ON \`Nasked_Accounts\``);
        await queryRunner.query(`ALTER TABLE \`Nasked_Companies\` CHANGE \`created_at\` \`created_at\` date NOT NULL DEFAULT curdate()`);
        await queryRunner.query(`DROP INDEX \`IDX_11a3434b3fccc53caa50e755a4\` ON \`Nasked_RefreshTokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_85568b1cb8cd56b2aedb86bff6\` ON \`Nasked_RefreshTokens\``);
        await queryRunner.query(`DROP TABLE \`Nasked_RefreshTokens\``);
    }

}
