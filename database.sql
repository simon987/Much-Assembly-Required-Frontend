-- make sure it exists
create database if not exists mar;

-- create user (will be created if not exists) and grant privileges
grant all privileges on `mar`.* to `mar`@`localhost` identified by 'mar';
flush privileges;

-- switch to use the database
use mar;

-- create tables
create table mar_user
(
  username varchar(20) not null
    primary key,
  password tinytext not null,
  authToken varchar(131) null,
  tokenTime datetime null,
  floppyData mediumblob null
);
