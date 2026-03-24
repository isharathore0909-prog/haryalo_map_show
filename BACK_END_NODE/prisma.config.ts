// @ts-nocheck
// Note: prisma.config.ts is a feature for Prisma 6+ (beta/rc).
// For Prisma 5.11, configuration is primarily handled in prisma/schema.prisma.
// Making this a valid TypeScript export if needed by custom tools.
import "dotenv/config";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
};
