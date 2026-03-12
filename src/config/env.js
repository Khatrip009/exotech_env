import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRES
};
