import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Permissions } from '../access/permissions.entity';
import { Roles } from '../access/roles.entity';
import { AccountsCompanies } from '../accounts/accounts-companies.entity';
import { Accounts } from '../accounts/accounts.entity';
import { Bills } from '../business/bills.entity';
import { Payments } from '../business/payments.entity';
import { Plans } from '../business/plans.entity';
import { Categories } from '../companies/categories.entity';
import { Companies } from '../companies/companies.entity';
import { Cards } from '../elements/cards.entity';
import { Fields } from '../elements/fields.entity';
import { FieldsValues } from '../elements/fieldsValues.entity';
import { Folders } from '../elements/folders.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Permissions,
    Roles,
    AccountsCompanies,
    Accounts,
    Bills,
    Payments,
    Plans,
    Categories,
    Companies,
    Cards,
    Fields,
    FieldsValues,
    Folders,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
