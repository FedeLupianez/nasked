-- Tabla de Planes
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/plans.mock.csv'
INTO TABLE Nasked_Plans
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_plan,name,description,employees,active);

-- Tabla de Permisos
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/permissions.mock.csv'
INTO TABLE Nasked_Permissions
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_permission,permission);

-- Tabla de Roles
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/roles.mock.csv'
INTO TABLE Nasked_Roles
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_role, role);

INSERT INTO Roles_Permissions (id_role, id_permission)
VALUES
-- 1: SUDO
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
-- Admin
(2, 1),
(2, 4),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
-- Manager
(3, 10),
(3, 11),
(3, 12),
(3, 13),
(3, 14),
-- Member
(4, 8),
(4, 10),
-- Viewer
(5, 10);

-- Tabla Categorías
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/categories.mock.csv'
INTO TABLE Nasked_Categories
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_category,category);

-- Tabla Cuentas
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/accounts.mock.csv'
INTO TABLE Nasked_Accounts
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_account,name,lastname,email,password,profile_image,active,avatar_color);

-- Tabla Companies
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/companies.mock.csv'
INTO TABLE Nasked_Companies
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_company,name,logo,created_at,status,id_plan);

-- Tabla Accounts_Companies
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/accounts-companies.mock.csv'
INTO TABLE Accounts_Companies
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_account_company,id_account,id_company,id_role);

-- Tabla Bills
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/bills.mock.csv'
INTO TABLE Nasked_Bills
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_bill,id_company,invoice_num,price,status,detail,discount,issue_date,next_billing,period_start,period_end,currency);

-- Tabla Payments
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/payments.mock.csv'
INTO TABLE Nasked_Payments
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_payment,id_bill,paid_at,provider_txn_id,amount,currency,status);

-- Tabla Folders
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/folders.mock.csv'
INTO TABLE Nasked_Folders
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_folder,token,name,id_company,belong_id,created_at,description,color);

-- Tabla Cards
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/cards.mock.csv'
INTO TABLE Nasked_Cards
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_card,title,description,created_at,deadline,id_folder,active);


-- Tabla Fields
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/fields.mock.csv'
INTO TABLE Nasked_Fields
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_field,id_card,name,required,options,type);

-- Tabla FieldsValues
LOAD DATA LOCAL INFILE '/home/fede/work/nasked/mock/fields-values.mock.csv'
INTO TABLE Nasked_FieldsValues
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id_field_value,id_field,value);


