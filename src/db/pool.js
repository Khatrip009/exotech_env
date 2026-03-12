import pkg from "pg";
import { env } from "../config/env.js";

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});
