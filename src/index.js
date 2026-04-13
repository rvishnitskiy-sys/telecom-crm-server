const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("./db/seed");

const prospectsRouter = require("./routes/prospects");
const contactsRouter = require("./routes/contacts");
const opportunitiesRouter = require("./routes/opportunities");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Telecom CRM API",
      version: "1.0.0",
      description:
        "REST API for Telecom CRM — manages prospects, contacts and opportunities",
    },
    servers: [{ url: "http://localhost:3001" }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/prospects", prospectsRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/opportunities", opportunitiesRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Telecom CRM server is running" });
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
  console.log("API docs available at http://localhost:3001/api/docs");
});
