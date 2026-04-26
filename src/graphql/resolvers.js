const { query, queryOne, execute } = require("../db/database");

const resolvers = {
  prospects: async () => {
    const prospects = await query("SELECT * FROM prospects ORDER BY name");
    return prospects.map((p) => ({
      ...p,
      contacts: () =>
        query("SELECT * FROM contacts WHERE prospect_id = $1", [p.id]),
      opportunities: () =>
        query("SELECT * FROM opportunities WHERE prospect_id = $1", [p.id]),
    }));
  },

  prospect: async ({ id }) => {
    const p = await queryOne("SELECT * FROM prospects WHERE id = $1", [id]);
    if (!p) return null;
    return {
      ...p,
      contacts: () =>
        query("SELECT * FROM contacts WHERE prospect_id = $1", [p.id]),
      opportunities: () =>
        query("SELECT * FROM opportunities WHERE prospect_id = $1", [p.id]),
    };
  },

  contacts: async () => {
    const contacts = await query("SELECT * FROM contacts ORDER BY name");
    return contacts.map((c) => ({
      ...c,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [c.prospect_id]),
    }));
  },

  contact: async ({ id }) => {
    const c = await queryOne("SELECT * FROM contacts WHERE id = $1", [id]);
    if (!c) return null;
    return {
      ...c,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [c.prospect_id]),
    };
  },

  opportunities: async () => {
    const opps = await query("SELECT * FROM opportunities ORDER BY name");
    return opps.map((o) => ({
      ...o,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [o.prospect_id]),
      keyContact: () =>
        o.key_contact_id
          ? queryOne("SELECT * FROM contacts WHERE id = $1", [o.key_contact_id])
          : null,
    }));
  },

  opportunity: async ({ id }) => {
    const o = await queryOne("SELECT * FROM opportunities WHERE id = $1", [id]);
    if (!o) return null;
    return {
      ...o,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [o.prospect_id]),
      keyContact: () =>
        o.key_contact_id
          ? queryOne("SELECT * FROM contacts WHERE id = $1", [o.key_contact_id])
          : null,
    };
  },

  createProspect: async ({ name, segment, country, website }) => {
    const p = await queryOne(
      "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, segment, country, website],
    );
    return { ...p, contacts: () => [], opportunities: () => [] };
  },

  createContact: async ({ name, role, email, phone, prospect_id }) => {
    const c = await queryOne(
      "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, role, email, phone, prospect_id],
    );
    return {
      ...c,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [c.prospect_id]),
    };
  },

  createOpportunity: async ({
    name,
    value,
    stage,
    prospect_id,
    key_contact_id,
  }) => {
    const o = await queryOne(
      "INSERT INTO opportunities (name, value, stage, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, value || 0, stage || "Lead", prospect_id, key_contact_id],
    );
    return {
      ...o,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [o.prospect_id]),
      keyContact: () =>
        o.key_contact_id
          ? queryOne("SELECT * FROM contacts WHERE id = $1", [o.key_contact_id])
          : null,
    };
  },

  updateOpportunityStage: async ({ id, stage }) => {
    const o = await queryOne(
      "UPDATE opportunities SET stage = $1 WHERE id = $2 RETURNING *",
      [stage, id],
    );
    return {
      ...o,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [o.prospect_id]),
      keyContact: () =>
        o.key_contact_id
          ? queryOne("SELECT * FROM contacts WHERE id = $1", [o.key_contact_id])
          : null,
    };
  },

  saveOpportunityNotes: async ({ id, notes }) => {
    const o = await queryOne(
      "UPDATE opportunities SET notes = $1 WHERE id = $2 RETURNING *",
      [notes, id],
    );
    return {
      ...o,
      prospect: () =>
        queryOne("SELECT * FROM prospects WHERE id = $1", [o.prospect_id]),
      keyContact: () =>
        o.key_contact_id
          ? queryOne("SELECT * FROM contacts WHERE id = $1", [o.key_contact_id])
          : null,
    };
  },
};

module.exports = { resolvers };
