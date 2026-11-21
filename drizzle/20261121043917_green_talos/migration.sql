CREATE TABLE "akun" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "akun_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(50) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
