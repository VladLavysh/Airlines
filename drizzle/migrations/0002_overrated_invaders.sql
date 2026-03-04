CREATE TABLE "route" (
	"id" serial PRIMARY KEY NOT NULL,
	"departure_airport" varchar(32) NOT NULL,
	"arrival_airport" varchar(32) NOT NULL,
	"distance" integer NOT NULL
);
