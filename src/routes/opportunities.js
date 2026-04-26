const express = require("express");
const router = express.Router();
const { query, queryOne, execute } = require("../db/database");

router.get("/", async (req, res) => {
  try {
    const opportunities = await query(
      "SELECT * FROM opportunities ORDER BY name",
    );
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const opportunity = await queryOne(
      "SELECT * FROM opportunities WHERE id = $1",
      [req.params.id],
    );
    if (!opportunity)
      return res.status(404).json({ error: "Opportunity not found" });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, value, stage, notes, prospect_id, key_contact_id } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const opportunity = await queryOne(
      "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, value, stage, notes || "", prospect_id, key_contact_id],
    );
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, value, stage, notes, prospect_id, key_contact_id } = req.body;
    const existing = await queryOne(
      "SELECT * FROM opportunities WHERE id = $1",
      [req.params.id],
    );
    if (!existing)
      return res.status(404).json({ error: "Opportunity not found" });
    const opportunity = await queryOne(
      "UPDATE opportunities SET name = $1, value = $2, stage = $3, notes = $4, prospect_id = $5, key_contact_id = $6 WHERE id = $7 RETURNING *",
      [name, value, stage, notes, prospect_id, key_contact_id, req.params.id],
    );
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await queryOne(
      "SELECT * FROM opportunities WHERE id = $1",
      [req.params.id],
    );
    if (!existing)
      return res.status(404).json({ error: "Opportunity not found" });
    await execute("DELETE FROM opportunities WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
