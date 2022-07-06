import { buildSchema } from "graphql";

export const schema = buildSchema(` 
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }
    type User {
        _id: ID!
        email: String!
        password: String!
        status: String!
        name: String!
        posts: [Post]
    }
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
   type RootMutation {
        createUser(userInput: UserInputData): User
   }    
    type RootQuery {
        hello: String
    }

    schema {
        query: RootQuery
       mutation: RootMutation
    }
`);
