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


     type AuthData {
        userId: ID!
        token: String!
   }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!

    }

    type PostsData {
        posts: [Post]!
        totalPosts: Int!
    }

   type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
   } 
   
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts: PostsData!
      
    }

    schema {
       query: RootQuery
       mutation: RootMutation
    }
`);
