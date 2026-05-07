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
    activities: [Activity]
    created_at: String
  }

  type Activity {
    id: ID!
    opportunity_id: Int
    type: String!
    description: String!
    opportunity: Opportunity
    created_at: String
  }

  type Query {
    prospects: [Prospect]
    prospect(id: ID!): Prospect
    contacts: [Contact]
    contact(id: ID!): Contact
    opportunities: [Opportunity]
    opportunity(id: ID!): Opportunity
    activities(opportunity_id: ID!): [Activity]
    activity(id: ID!): Activity
  }

  type Mutation {
    createProspect(name: String!, segment: String, country: String, website: String): Prospect
    createContact(name: String!, role: String, email: String, phone: String, prospect_id: Int): Contact
    createOpportunity(name: String!, value: Int, stage: String, prospect_id: Int, key_contact_id: Int): Opportunity
    updateOpportunityStage(id: ID!, stage: String!): Opportunity
    saveOpportunityNotes(id: ID!, notes: String!): Opportunity
    createActivity(opportunity_id: ID!, type: String!, description: String!): Activity
  }
`);

module.exports = schema;
