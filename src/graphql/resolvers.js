const db = require("../db/database");

const resolvers = {
  prospects: () => {
    const prospects = db.prepare("SELECT * FROM prospects ORDER BY name").all();
    return prospects.map((p) => ({
      ...p,
      contacts: () =>
        db.prepare("SELECT * FROM contacts WHERE prospect_id = ?").all(p.id),
      opportunities: () =>
        db
          .prepare("SELECT * FROM opportunities WHERE prospect_id = ?")
          .all(p.id),
    }));
  },

  prospect: ({ id }) => {
    const p = db.prepare("SELECT * FROM prospects WHERE id = ?").get(id);
    if (!p) return null;
    return {
      ...p,
      contacts: () =>
        db.prepare("SELECT * FROM contacts WHERE prospect_id = ?").all(p.id),
      opportunities: () =>
        db
          .prepare("SELECT * FROM opportunities WHERE prospect_id = ?")
          .all(p.id),
    };
  },

  contacts: () => {
    const contacts = db.prepare("SELECT * FROM contacts ORDER BY name").all();
    return contacts.map((c) => ({
      ...c,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(c.prospect_id),
    }));
  },

  contact: ({ id }) => {
    const c = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
    if (!c) return null;
    return {
      ...c,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(c.prospect_id),
    };
  },

  opportunities: () => {
    const opps = db.prepare("SELECT * FROM opportunities ORDER BY name").all();
    return opps.map((o) => ({
      ...o,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(o.prospect_id),
      keyContact: () =>
        o.key_contact_id
          ? db
              .prepare("SELECT * FROM contacts WHERE id = ?")
              .get(o.key_contact_id)
          : null,
    }));
  },

  opportunity: ({ id }) => {
    const o = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id);
    if (!o) return null;
    return {
      ...o,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(o.prospect_id),
      keyContact: () =>
        o.key_contact_id
          ? db
              .prepare("SELECT * FROM contacts WHERE id = ?")
              .get(o.key_contact_id)
          : null,
    };
  },

  createProspect: ({ name, segment, country, website }) => {
    const result = db
      .prepare(
        "INSERT INTO prospects (name, segment, country, website) VALUES (?, ?, ?, ?)",
      )
      .run(name, segment, country, website);
    const p = db
      .prepare("SELECT * FROM prospects WHERE id = ?")
      .get(result.lastInsertRowid);
    return {
      ...p,
      contacts: () => [],
      opportunities: () => [],
    };
  },

  createContact: ({ name, role, email, phone, prospect_id }) => {
    const result = db
      .prepare(
        "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES (?, ?, ?, ?, ?)",
      )
      .run(name, role, email, phone, prospect_id);
    const c = db
      .prepare("SELECT * FROM contacts WHERE id = ?")
      .get(result.lastInsertRowid);
    return {
      ...c,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(c.prospect_id),
    };
  },

  createOpportunity: ({ name, value, stage, prospect_id, key_contact_id }) => {
    const result = db
      .prepare(
        "INSERT INTO opportunities (name, value, stage, prospect_id, key_contact_id) VALUES (?, ?, ?, ?, ?)",
      )
      .run(name, value || 0, stage || "Lead", prospect_id, key_contact_id);
    const o = db
      .prepare("SELECT * FROM opportunities WHERE id = ?")
      .get(result.lastInsertRowid);
    return {
      ...o,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(o.prospect_id),
      keyContact: () =>
        o.key_contact_id
          ? db
              .prepare("SELECT * FROM contacts WHERE id = ?")
              .get(o.key_contact_id)
          : null,
    };
  },

  updateOpportunityStage: ({ id, stage }) => {
    db.prepare("UPDATE opportunities SET stage = ? WHERE id = ?").run(
      stage,
      id,
    );
    const o = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id);
    return {
      ...o,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(o.prospect_id),
      keyContact: () =>
        o.key_contact_id
          ? db
              .prepare("SELECT * FROM contacts WHERE id = ?")
              .get(o.key_contact_id)
          : null,
    };
  },

  saveOpportunityNotes: ({ id, notes }) => {
    db.prepare("UPDATE opportunities SET notes = ? WHERE id = ?").run(
      notes,
      id,
    );
    const o = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id);
    return {
      ...o,
      prospect: () =>
        db.prepare("SELECT * FROM prospects WHERE id = ?").get(o.prospect_id),
      keyContact: () =>
        o.key_contact_id
          ? db
              .prepare("SELECT * FROM contacts WHERE id = ?")
              .get(o.key_contact_id)
          : null,
    };
  },
};

module.exports = { resolvers };
