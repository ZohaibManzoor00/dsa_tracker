import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/neon-http/migrator";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations complete!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
