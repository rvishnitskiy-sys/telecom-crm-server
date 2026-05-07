const { query, queryOne, execute } = require("./database");

async function seed() {
  await execute(`
    CREATE TABLE IF NOT EXISTS prospects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      segment TEXT,
      country TEXT,
      website TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      phone TEXT,
      prospect_id INTEGER REFERENCES prospects(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      value INTEGER DEFAULT 0,
      stage TEXT DEFAULT 'Lead',
      notes TEXT DEFAULT '',
      prospect_id INTEGER REFERENCES prospects(id),
      key_contact_id INTEGER REFERENCES contacts(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await queryOne("SELECT COUNT(*) as count FROM prospects");
  if (parseInt(existing.count) > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Seeding database with sample data...");

  const p1 = await queryOne(
    "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
    ["MTS", "Mobile Operator", "Russia", "mts.ru"],
  );
  const p2 = await queryOne(
    "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
    ["Beeline", "Mobile Operator", "Russia", "beeline.ru"],
  );
  const p3 = await queryOne(
    "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
    ["Megafon", "Mobile Operator", "Russia", "megafon.ru"],
  );
  const p4 = await queryOne(
    "INSERT INTO prospects (name, segment, country, website) VALUES ($1, $2, $3, $4) RETURNING *",
    ["Tele2 Russia", "Mobile Operator", "Russia", "tele2.ru"],
  );

  const c1 = await queryOne(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    ["Andrei Volkov", "CTO", "a.volkov@mts.ru", "+7 495 111 2233", p1.id],
  );
  const c2 = await queryOne(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      "Elena Petrova",
      "IT Director",
      "e.petrova@beeline.ru",
      "+7 495 222 3344",
      p2.id,
    ],
  );
  const c3 = await queryOne(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      "Dmitri Smirnov",
      "Procurement Manager",
      "d.smirnov@megafon.ru",
      "+7 495 333 4455",
      p3.id,
    ],
  );
  const c4 = await queryOne(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      "Irina Kozlova",
      "VP Technology",
      "i.kozlova@tele2.ru",
      "+7 495 444 5566",
      p4.id,
    ],
  );
  const c5 = await queryOne(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [
      "Sergei Morozov",
      "Head of BSS",
      "s.morozov@mts.ru",
      "+7 495 111 3344",
      p1.id,
    ],
  );

  await execute(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6)",
    ["BSS Modernization", 250000, "Qualified", "", p1.id, c1.id],
  );
  await execute(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6)",
    ["OSS Platform Upgrade", 180000, "Proposal", "", p2.id, c2.id],
  );
  await execute(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6)",
    ["CRM Implementation", 95000, "Lead", "", p3.id, c3.id],
  );
  await execute(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6)",
    ["Billing System", 320000, "Won", "Contract signed Q1 2025.", p4.id, c4.id],
  );
  await execute(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      "Network Analytics",
      140000,
      "Negotiation",
      "Follow up on pricing proposal sent last week.",
      p1.id,
      c5.id,
    ],
  );

  console.log("Database seeded successfully");
}

module.exports = seed;
