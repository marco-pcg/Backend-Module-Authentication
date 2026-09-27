import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableUnique,
} from 'typeorm';

export class CreateUsersTable1710000000000 implements MigrationInterface {
  name = 'CreateUsersTable1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
          },
          {
            name: 'name',
            type: 'character varying',
          },
          {
            name: 'email',
            type: 'character varying',
          },
          {
            name: 'password',
            type: 'character varying',
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'users',
      new TableUnique({
        name: 'UQ_users_email',
        columnNames: ['email'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
