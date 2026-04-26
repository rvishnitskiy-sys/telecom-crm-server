const express = require("express");
const router = express.Router();
const { query, queryOne, execute } = require("../db/database");

router.get("/", async (req, res) => {
  try {
    const contacts = await query("SELECT * FROM contacts ORDER BY name");
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const contact = await queryOne("SELECT * FROM contacts WHERE id = $1", [
      req.params.id,
    ]);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, role, email, phone, prospect_id } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const contact = await queryOne(
      "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, role, email, phone, prospect_id],
    );
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, role, email, phone, prospect_id } = req.body;
    const existing = await queryOne("SELECT * FROM contacts WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.status(404).json({ error: "Contact not found" });
    const contact = await queryOne(
      "UPDATE contacts SET name = $1, role = $2, email = $3, phone = $4, prospect_id = $5 WHERE id = $6 RETURNING *",
      [name, role, email, phone, prospect_id, req.params.id],
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await queryOne("SELECT * FROM contacts WHERE id = $1", [
      req.params.id,
    ]);
    if (!existing) return res.status(404).json({ error: "Contact not found" });
    await execute("DELETE FROM contacts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
