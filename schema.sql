CREATE TABLE "public"."user" (
    "num_user" int4 DEFAULT nextval('untitled_table_189_id_seq'::regclass),
    "nom_user" varchar,
    PRIMARY KEY ("num_user")
);

CREATE TABLE "public"."join_activity_user" (
    "id" int4 DEFAULT nextval('untitled_table_191_id_seq'::regclass),
    "num_activity" int4,
    "num_user" int4,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."transaction_list" (
    "num_transaction" int4 DEFAULT nextval('untitled_table_192_id_seq'::regclass),
    "name_transaction" varchar,
    "montant_transaction" int4,
    "date_transaction" date,
    PRIMARY KEY ("num_transaction")
);

CREATE TABLE "public"."transaction_detail" (
    "num_detail" int4 DEFAULT nextval('untitled_table_193_id_seq'::regclass),
    "num_transaction" int4,
    "num_activity" int4,
    "num_sender" int4,
    "num_receiver" int4,
    "part" int2,
    "amount" int4,
    PRIMARY KEY ("num_detail")
);

CREATE TABLE "public"."activity_list" (
    "num_activity" int4 DEFAULT nextval('untitled_table_190_id_seq'::regclass),
    "name_activity" varchar,
    "date_activity" date,
    "terminated" bool DEFAULT false,
    PRIMARY KEY ("num_activity")
);