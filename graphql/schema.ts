import { buildSchema } from "graphql";

export const schema = buildSchema(`
    type TestData {
        Id: ID!
        text: String!
        views: Float!
    }
    type RootQuery {
        hello: TestData!
    }
  
    schema {
        query: RootQuery
    }
`);
