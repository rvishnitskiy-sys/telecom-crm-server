const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const opportunities = db
    .prepare("SELECT * FROM opportunities ORDER BY name")
    .all();
  res.json(opportunities);
});

router.get("/:id", (req, res) => {
  const opportunity = db
    .prepare("SELECT * FROM opportunities WHERE id = ?")
    .get(req.params.id);
  if (!opportunity)
    return res.status(404).json({ error: "Opportunity not found" });
  res.json(opportunity);
});

router.post("/", (req, res) => {
  const { name, value, stage, notes, prospect_id, key_contact_id } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const result = db
    .prepare(
      "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(name, value, stage, notes || "", prospect_id, key_contact_id);
  const opportunity = db
    .prepare("SELECT * FROM opportunities WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(opportunity);
});

router.put("/:id", (req, res) => {
  const { name, value, stage, notes, prospect_id, key_contact_id } = req.body;
  const existing = db
    .prepare("SELECT * FROM opportunities WHERE id = ?")
    .get(req.params.id);
  if (!existing)
    return res.status(404).json({ error: "Opportunity not found" });
  db.prepare(
    "UPDATE opportunities SET name = ?, value = ?, stage = ?, notes = ?, prospect_id = ?, key_contact_id = ? WHERE id = ?",
  ).run(name, value, stage, notes, prospect_id, key_contact_id, req.params.id);
  const opportunity = db
    .prepare("SELECT * FROM opportunities WHERE id = ?")
    .get(req.params.id);
  res.json(opportunity);
});

router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM opportunities WHERE id = ?")
    .get(req.params.id);
  if (!existing)
    return res.status(404).json({ error: "Opportunity not found" });
  db.prepare("DELETE FROM opportunities WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
