create table mar_user
(
  username varchar(20) not null
    primary key,
  password tinytext not null,
  authToken varchar(131) null,
  tokenTime datetime null,
  floppyData mediumblob null
);

create table mar_userdata
(
  username varchar(20) not null
    primary key,
  userCode text null,
  processed tinyint default '0' not null,
  constraint fk_mar_userdata_mar_user1
  foreign key (username) references mar_user (username)
);