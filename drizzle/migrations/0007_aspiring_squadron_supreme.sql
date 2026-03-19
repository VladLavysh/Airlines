ALTER TABLE "ticket" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "aircraft" ADD COLUMN "price_multiplier" numeric(4, 2) DEFAULT '1.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "airline" ADD COLUMN "price_multiplier" numeric(4, 2) DEFAULT '1.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "route" ADD COLUMN "base_price" numeric(10, 2) NOT NULL DEFAULT '0.00';--> statement-breakpoint
UPDATE "route" SET "base_price" = '100.00' WHERE "base_price" = '0.00';--> statement-breakpoint
ALTER TABLE "route" ALTER COLUMN "base_price" DROP DEFAULT;