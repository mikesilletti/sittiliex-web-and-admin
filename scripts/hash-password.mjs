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
// Next.js expands unescaped `$VAR` references in .env files, which corrupts
// bcrypt hashes (they're full of `$2b$10$...`). Escape every `$` as `\$` when
// writing to .env.local — Vercel's dashboard does NOT expand vars, so paste
// the unescaped hash (without backslashes) there instead.
console.log("\nAdd this to .env.local (backslashes escape Next.js's $VAR expansion):\n");
console.log(`ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}\n`);
console.log("For Vercel env vars, use the unescaped value instead:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
