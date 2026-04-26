const express = require("express");
const router = express.Router();
const { query, queryOne, execute } = require("../db/database");

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
router.get("/", async (req, res) => {
  try {
    const prospects = await query("SELECT * FROM prospects ORDER BY name");
    res.json(prospects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
router.get("/:id", async (req, res) => {
  try {
    const prospect = await queryOne("SELECT * FROM prospects WHERE id = $1", [
      req.params.id,
    ]);
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
router.post("/", async (req, res) => {
  try {
    const { name, segment, country, website } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const prospect = await queryOne(
      "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, segment, country, website],
    );
    res.status(201).json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
 *     responses:
 *       200:
 *         description: Prospect updated
 *       404:
 *         description: Prospect not found
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, segment, country, website } = req.body;
    const existing = await queryOne("SELECT * FROM prospects WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.status(404).json({ error: "Prospect not found" });
    const prospect = await queryOne(
      "UPDATE prospects SET name = $1, segment = $2, country = $3, website = $4 WHERE id = $5 RETURNING *",
      [name, segment, country, website, req.params.id],
    );
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
router.delete("/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT * FROM prospects WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.status(404).json({ error: "Prospect not found" });
    await execute("DELETE FROM prospects WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
