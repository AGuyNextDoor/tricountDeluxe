CREATE TABLE "public"."users" (
    "num_user" int4 DEFAULT nextval('users'::regclass),
    "nom_user" varchar DEFAULT ''::character varying,
    "pwd_user" varchar DEFAULT ''::character varying,
    PRIMARY KEY ("num_user")
);

CREATE TABLE "public"."join_activity_user" (
    "id" int4 DEFAULT nextval('join_activity_user'::regclass),
    "num_activity" int4,
    "num_user" int4,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."transaction_list" (
    "num_transaction" int4 DEFAULT nextval('transaction_list'::regclass),
    "name_transaction" varchar,
    "montant_transaction" int4,
    "date_transaction" date,
    PRIMARY KEY ("num_transaction")
);

CREATE TABLE "public"."transaction_detail" (
    "num_detail" int4 DEFAULT nextval('transaction_detail'::regclass),
    "num_transaction" int4,
    "num_activity" int4,
    "num_sender" int4,
    "num_receiver" int4,
    "part" int2,
    "amount" int4,
    PRIMARY KEY ("num_detail")
);

CREATE TABLE "public"."activity_list" (
    "num_activity" int4 DEFAULT nextval('activity_list'::regclass),
    "name_activity" varchar,
    "date_activity" date,
    "terminated" bool DEFAULT false,
    PRIMARY KEY ("num_activity")
);
