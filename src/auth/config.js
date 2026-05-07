module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "telecom-crm-dev-secret",
  JWT_EXPIRES_IN: "24h",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || null,
};
