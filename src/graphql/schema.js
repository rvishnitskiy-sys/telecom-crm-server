const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Prospect {
    id: ID!
    name: String!
    segment: String
    country: String
    website: String
    contacts: [Contact]
    opportunities: [Opportunity]
    created_at: String
  }

  type Contact {
    id: ID!
    name: String!
    role: String
    email: String
    phone: String
    prospect_id: Int
    prospect: Prospect
    created_at: String
  }

  type Opportunity {
    id: ID!
    name: String!
    value: Int
    stage: String
    notes: String
    prospect_id: Int
    key_contact_id: Int
    prospect: Prospect
    keyContact: Contact
    created_at: String
  }

  type Query {
    prospects: [Prospect]
    prospect(id: ID!): Prospect
    contacts: [Contact]
    contact(id: ID!): Contact
    opportunities: [Opportunity]
    opportunity(id: ID!): Opportunity
  }

  type Mutation {
    createProspect(name: String!, segment: String, country: String, website: String): Prospect
    createContact(name: String!, role: String, email: String, phone: String, prospect_id: Int): Contact
    createOpportunity(name: String!, value: Int, stage: String, prospect_id: Int, key_contact_id: Int): Opportunity
    updateOpportunityStage(id: ID!, stage: String!): Opportunity
    saveOpportunityNotes(id: ID!, notes: String!): Opportunity
  }
`);

module.exports = schema;
