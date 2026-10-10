# Scripts for admin and order management

This folder contains helper scripts to create admin/user accounts and to confirm orders (generate download tokens).

Usage:

1. Install dependencies (if not already):

```bash
npm install bcryptjs @prisma/client
```

2. Create admin user:

```bash
node scripts/create-user.js admin@example.com "Full Name" "StrongPassword" --admin
```

3. Confirm order and generate download tokens:

```bash
NODE_ENV=development DATABASE_URL="file:./prisma/dev.db" SITE_URL="http://localhost:3000" node scripts/confirm-order.js ORD-123456 --admin="admin@example.com"
```
