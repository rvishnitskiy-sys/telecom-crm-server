require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createHandler } = require("graphql-http/lib/use/express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { renderPlaygroundPage } = require("graphql-playground-html");

const seed = require("./db/seed");
seed().catch(console.error);

const prospectsRouter = require("./routes/prospects");
const contactsRouter = require("./routes/contacts");
const opportunitiesRouter = require("./routes/opportunities");
const activitiesRouter = require("./routes/activities");
const authRouter = require("./auth/authRouter");
const { requireAuth } = require("./auth/middleware");

const schema = require("./graphql/schema");
const { resolvers } = require("./graphql/resolvers");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Telecom CRM API",
      version: "1.0.0",
      description: "REST API for Telecom CRM",
    },
    servers: [{ url: "http://localhost:3001" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);

app.use("/api/prospects", requireAuth, prospectsRouter);
app.use("/api/contacts", requireAuth, contactsRouter);
app.use("/api/opportunities", requireAuth, opportunitiesRouter);
app.use("/api/activities", requireAuth, activitiesRouter);

app.all(
  "/graphql",
  requireAuth,
  createHandler({ schema, rootValue: resolvers }),
);

app.get("/graphiql", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(renderPlaygroundPage({ endpoint: "/graphql" }));
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Telecom CRM server is running" });
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
  console.log("REST API docs: http://localhost:3001/api/docs");
  console.log("GraphQL playground: http://localhost:3001/graphiql");
});
