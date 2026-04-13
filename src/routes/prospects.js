const express = require("express");
const router = express.Router();
const db = require("../db/database");

/**
 * @swagger
 * tags:
 *   name: Prospects
 *   description: Manage prospect organizations
 */

/**
 * @swagger
 * /api/prospects:
 *   get:
 *     summary: Get all prospects
 *     tags: [Prospects]
 *     responses:
 *       200:
 *         description: List of all prospects
 */
router.get("/", (req, res) => {
  const prospects = db.prepare("SELECT * FROM prospects ORDER BY name").all();
  res.json(prospects);
});

/**
 * @swagger
 * /api/prospects/{id}:
 *   get:
 *     summary: Get a prospect by ID
 *     tags: [Prospects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prospect found
 *       404:
 *         description: Prospect not found
 */
router.get("/:id", (req, res) => {
  const prospect = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(req.params.id);
  if (!prospect) return res.status(404).json({ error: "Prospect not found" });
  res.json(prospect);
});

/**
 * @swagger
 * /api/prospects:
 *   post:
 *     summary: Create a new prospect
 *     tags: [Prospects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               segment:
 *                 type: string
 *               country:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prospect created
 *       400:
 *         description: Name is required
 */
router.post("/", (req, res) => {
  const { name, segment, country, website } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const result = db
    .prepare(
      "INSERT INTO prospects (name, segment, country, website) VALUES (?, ?, ?, ?)",
    )
    .run(name, segment, country, website);
  const prospect = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(prospect);
});

/**
 * @swagger
 * /api/prospects/{id}:
 *   put:
 *     summary: Update a prospect
 *     tags: [Prospects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               segment:
 *                 type: string
 *               country:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prospect updated
 *       404:
 *         description: Prospect not found
 */
router.put("/:id", (req, res) => {
  const { name, segment, country, website } = req.body;
  const existing = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Prospect not found" });
  db.prepare(
    "UPDATE prospects SET name = ?, segment = ?, country = ?, website = ? WHERE id = ?",
  ).run(name, segment, country, website, req.params.id);
  const prospect = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(req.params.id);
  res.json(prospect);
});

/**
 * @swagger
 * /api/prospects/{id}:
 *   delete:
 *     summary: Delete a prospect
 *     tags: [Prospects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prospect deleted
 *       404:
 *         description: Prospect not found
 */
router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM prospects WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Prospect not found" });
  db.prepare("DELETE FROM prospects WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
