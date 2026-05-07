const express = require("express");
const router = express.Router();
const { query, queryOne } = require("../db/database");

const VALID_TYPES = ["call", "email", "meeting", "note"];

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity log for opportunities
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities for an opportunity
 *     tags: [Activities]
 *     parameters:
 *       - in: query
 *         name: opportunity_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of activities
 *       400:
 *         description: opportunity_id query parameter is required
 */
router.get("/", async (req, res) => {
  try {
    const { opportunity_id } = req.query;
    if (!opportunity_id)
      return res.status(400).json({ error: "opportunity_id query parameter is required" });
    const activities = await query(
      "SELECT * FROM activities WHERE opportunity_id = $1 ORDER BY created_at DESC",
      [opportunity_id],
    );
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [opportunity_id, type, description]
 *             properties:
 *               opportunity_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [call, email, meeting, note]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity created
 *       400:
 *         description: Missing or invalid fields
 *       404:
 *         description: Opportunity not found
 */
router.post("/", async (req, res) => {
  try {
    const { opportunity_id, type, description } = req.body;
    if (!opportunity_id)
      return res.status(400).json({ error: "opportunity_id is required" });
    if (!type || !VALID_TYPES.includes(type))
      return res.status(400).json({ error: "type must be one of: call, email, meeting, note" });
    if (!description)
      return res.status(400).json({ error: "description is required" });
    const opportunity = await queryOne(
      "SELECT id FROM opportunities WHERE id = $1",
      [opportunity_id],
    );
    if (!opportunity)
      return res.status(404).json({ error: "Opportunity not found" });
    const activity = await queryOne(
      "INSERT INTO activities (opportunity_id, type, description) VALUES ($1, $2, $3) RETURNING *",
      [opportunity_id, type, description],
    );
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
