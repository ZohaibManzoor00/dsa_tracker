CREATE TABLE "attempt_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_problem_id" integer NOT NULL,
	"date" timestamp DEFAULT now(),
	"duration" integer,
	"status" text NOT NULL,
	"approach" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "code_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_problem_id" integer NOT NULL,
	"caption" text,
	"code" text NOT NULL,
	"time_complexity" text,
	"space_complexity" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"topic" varchar(100) NOT NULL,
	"url" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"examples" json NOT NULL,
	"constraints" json NOT NULL,
	"starter_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"problem_id" integer NOT NULL,
	"status" text NOT NULL,
	"rating" integer,
	"notes" text,
	"last_attempt" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_problems_user_id_problem_id_unique" UNIQUE("user_id","problem_id")
);
--> statement-breakpoint
ALTER TABLE "attempt_history" ADD CONSTRAINT "attempt_history_user_problem_id_user_problems_id_fk" FOREIGN KEY ("user_problem_id") REFERENCES "public"."user_problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snippets" ADD CONSTRAINT "code_snippets_user_problem_id_user_problems_id_fk" FOREIGN KEY ("user_problem_id") REFERENCES "public"."user_problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_problems" ADD CONSTRAINT "user_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;