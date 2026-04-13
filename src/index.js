const express = require("express");
const cors = require("cors");
const { createHandler } = require("graphql-http/lib/use/express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { renderPlaygroundPage } = require("graphql-playground-html");

require("./db/seed");

const prospectsRouter = require("./routes/prospects");
const contactsRouter = require("./routes/contacts");
const opportunitiesRouter = require("./routes/opportunities");

const schema = require("./graphql/schema");
const { resolvers } = require("./graphql/resolvers");

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
      description: "REST API for Telecom CRM",
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

app.all("/graphql", createHandler({ schema, rootValue: resolvers }));

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
