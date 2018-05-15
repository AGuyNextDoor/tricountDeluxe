INSERT INTO "public"."user" ("num_user", "nom_user") VALUES ('1', 'Nico'),
('2', 'Martin'),
('3', 'Fred');

INSERT INTO "public"."join_activity_user" ("id", "num_activity", "num_user") VALUES ('1', '1', '1'),
('2', '1', '2'),
('3', '1', '3'),
('4', '2', '1'),
('5', '2', '3');

INSERT INTO "public"."transaction_list" ("num_transaction", "name_transaction", "montant_transaction", "date_transaction") VALUES ('1', 'BcpDeBieres', '1500', '2018-05-14'),
('2', 'MaBiere', '700', '2018-05-14'),
('3', 'BigMac', '2000', '2018-05-14'),
('4', 'Frites', '1000', '2018-05-14');

INSERT INTO "public"."transaction_detail" ("num_detail", "num_transaction", "num_activity", "num_sender", "num_receiver", "part", "amount") VALUES ('1', '1', '1', '2', '1', '1', '500'),
('2', '1', '1', '2', '3', '1', '500'),
('3', '1', '1', '2', '2', '1', '500'),
('4', '2', '1', '3', '2', '1', '700'),
('5', '3', '2', '1', '2', '1', '1000'),
('6', '3', '2', '1', '3', '1', '1000'),
('7', '4', '2', '1', '1', '1', '334'),
('8', '4', '2', '1', '2', '1', '333'),
('9', '4', '2', '1', '3', '1', '333');

INSERT INTO "public"."activity_list" ("num_activity", "name_activity", "date_activity", "terminated") VALUES ('1', 'BBQ', '2018-05-12', 'f'),
('2', 'MacDo', '2018-05-15', 'f');