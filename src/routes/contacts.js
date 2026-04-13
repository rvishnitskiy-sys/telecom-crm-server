const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const contacts = db.prepare("SELECT * FROM contacts ORDER BY name").all();
  res.json(contacts);
});

router.get("/:id", (req, res) => {
  const contact = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(req.params.id);
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json(contact);
});

router.post("/", (req, res) => {
  const { name, role, email, phone, prospect_id } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const result = db
    .prepare(
      "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES (?, ?, ?, ?, ?)",
    )
    .run(name, role, email, phone, prospect_id);
  const contact = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(contact);
});

router.put("/:id", (req, res) => {
  const { name, role, email, phone, prospect_id } = req.body;
  const existing = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Contact not found" });
  db.prepare(
    "UPDATE contacts SET name = ?, role = ?, email = ?, phone = ?, prospect_id = ? WHERE id = ?",
  ).run(name, role, email, phone, prospect_id, req.params.id);
  const contact = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(req.params.id);
  res.json(contact);
});

router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM contacts WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Contact not found" });
  db.prepare("DELETE FROM contacts WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
