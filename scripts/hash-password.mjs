// Generates a bcrypt hash for the admin shared password. The plaintext is
// never stored — only the hash goes into ADMIN_PASSWORD_HASH.
//
// Usage: npm run hash-password -- "your-chosen-password"
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-chosen-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nAdd this to .env.local (and later, Vercel env vars):\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
