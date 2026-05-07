const express = require("express");
const router = express.Router();
const { query, queryOne } = require("../db/database");

const VALID_TYPES = ["call", "email", "meeting", "note"];

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
