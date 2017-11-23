create table mar_user
(
  username varchar(20) not null
    primary key,
  password tinytext not null,
  authToken varchar(131) null,
  tokenTime datetime null,
  floppyData mediumblob null
);
