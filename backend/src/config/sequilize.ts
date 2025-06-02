import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "root",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: true,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully!", sequelize.getDatabaseName(), sequelize.getDialect(), sequelize.config.host))
  .catch((err) => console.error("❌ Database connection error:", err, sequelize.getDatabaseName(), sequelize.getDialect(), sequelize.config.host, sequelize.config.database));

export default sequelize;
