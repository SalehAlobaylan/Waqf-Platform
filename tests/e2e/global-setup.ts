import { execSync } from "node:child_process";
import path from "node:path";
import { config as loadEnv } from "dotenv";

export default function globalSetup() {
  loadEnv({ path: path.resolve(process.cwd(), ".env") });
  execSync("npm run db:seed", {
    stdio: "inherit",
    env: process.env,
  });
}
