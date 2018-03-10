-- make sure it exists
create database if not exists mar;

-- create user (will be created if not exists) and grant privileges
grant all privileges on `mar`.* to `mar`@`localhost` identified by 'mar';
flush privileges;

-- switch to use the database
use mar;

-- create tables
create table mar_user (

  username varchar(20) not null
    primary key,
  password tinytext not null,
  authToken varchar(131) null,
  tokenTime datetime null,
  floppyData mediumblob null
);

create table mar_vault_clear (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  clear_time INTEGER NOT NULL,
  vault_id VARCHAR(20),

  FOREIGN KEY (username) REFERENCES mar_user(username),
  CONSTRAINT mar_vault_clear_uc_1 UNIQUE (username, vault_id)
)
