// Creates the practice_trades table. Run with `npm run db:setup`.
import { createTable } from "../lib/db/practiceTrades";

createTable().then(() => console.log("practice_trades table is ready"));
