const db = require("./database");

const prospects = db.prepare("SELECT COUNT(*) as count FROM prospects").get();

if (prospects.count === 0) {
  console.log("Seeding database with sample data...");

  const insertProspect = db.prepare(
    "INSERT INTO prospects (name, segment, country, website) VALUES (?, ?, ?, ?)",
  );

  const p1 = insertProspect.run("MTS", "Mobile Operator", "Russia", "mts.ru");
  const p2 = insertProspect.run(
    "Beeline",
    "Mobile Operator",
    "Russia",
    "beeline.ru",
  );
  const p3 = insertProspect.run(
    "Megafon",
    "Mobile Operator",
    "Russia",
    "megafon.ru",
  );
  const p4 = insertProspect.run(
    "Tele2 Russia",
    "Mobile Operator",
    "Russia",
    "tele2.ru",
  );

  const insertContact = db.prepare(
    "INSERT INTO contacts (name, role, email, phone, prospect_id) VALUES (?, ?, ?, ?, ?)",
  );

  const c1 = insertContact.run(
    "Andrei Volkov",
    "CTO",
    "a.volkov@mts.ru",
    "+7 495 111 2233",
    p1.lastInsertRowid,
  );
  const c2 = insertContact.run(
    "Elena Petrova",
    "IT Director",
    "e.petrova@beeline.ru",
    "+7 495 222 3344",
    p2.lastInsertRowid,
  );
  const c3 = insertContact.run(
    "Dmitri Smirnov",
    "Procurement Manager",
    "d.smirnov@megafon.ru",
    "+7 495 333 4455",
    p3.lastInsertRowid,
  );
  const c4 = insertContact.run(
    "Irina Kozlova",
    "VP Technology",
    "i.kozlova@tele2.ru",
    "+7 495 444 5566",
    p4.lastInsertRowid,
  );
  const c5 = insertContact.run(
    "Sergei Morozov",
    "Head of BSS",
    "s.morozov@mts.ru",
    "+7 495 111 3344",
    p1.lastInsertRowid,
  );

  const insertOpp = db.prepare(
    "INSERT INTO opportunities (name, value, stage, notes, prospect_id, key_contact_id) VALUES (?, ?, ?, ?, ?, ?)",
  );

  insertOpp.run(
    "BSS Modernization",
    250000,
    "Qualified",
    "",
    p1.lastInsertRowid,
    c1.lastInsertRowid,
  );
  insertOpp.run(
    "OSS Platform Upgrade",
    180000,
    "Proposal",
    "",
    p2.lastInsertRowid,
    c2.lastInsertRowid,
  );
  insertOpp.run(
    "CRM Implementation",
    95000,
    "Lead",
    "",
    p3.lastInsertRowid,
    c3.lastInsertRowid,
  );
  insertOpp.run(
    "Billing System",
    320000,
    "Won",
    "Contract signed Q1 2025.",
    p4.lastInsertRowid,
    c4.lastInsertRowid,
  );
  insertOpp.run(
    "Network Analytics",
    140000,
    "Negotiation",
    "Follow up on pricing proposal sent last week.",
    p1.lastInsertRowid,
    c5.lastInsertRowid,
  );

  console.log("Database seeded successfully");
} else {
  console.log("Database already has data, skipping seed");
}

module.exports = db;
