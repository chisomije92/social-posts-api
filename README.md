
# Socials-Posts-API

[![NODEJS](https://img.shields.io/badge/Node-%20JS-blue)](https://nodejs.org/en/) [![Typescript](https://img.shields.io/badge/Typescript-%20JS-red)](https://www.typescriptlang.org/) [![Express](https://img.shields.io/badge/express-framework-orange)](https://expressjs.com/)



A GraphQL API that enables the creation, updating and deletion of posts. This project also guarantees authentication.


## QUERY

Endpoint: [Social-Posts-API](https://social-posts-api.herokuapp.com/graphql)

### Sign Up

```
{
query: `
mutation {
  createUser(userInput:{email: "test@test.com", name: "Test", password: "00000"}){
    _id
    email
  }
}
}`
```

The above GraphQL mutation will produce the following JSON response:

```
{
     "data": {
         "createUser": {
             "_id": "62c56e724e726f6caba3e7fa"
             "email": "test@test.com",
             "name": "Test",
             "password": "$5a$12$RI/OdeKGQwULedCFCHV13uM9a60fNpSxATuCKSPTsD3nNIyE33TY",
             "posts": "[]",
             "status": "I am new"
         }
     }
}
```
N.B: The password is a secured hashed password. The above password is for sample purposes only and is likely invalid now.


### Login

```
{
  query: `
  login(email: "test@test.com", password:"00000"){
    token
    userId
  }`
}
```

The above GraphQL query will produce the following JSON response:

```
{
     "data": {
         "login": {
             "token": "eyJhbGciOiJIUzI1...",
             "userId": "62c56e724e726f6caba3e7fa",

         }
     }
}
```

### Creating posts

```
{
    query: `
mutation{
    createPost(postInput: {title: "Dummy Title", content: "Dummy Content", imageUrl:"Dummy-Image-URL.png"}){
     _id
    content
    title
}`
    
}
```
The above GraphQL mutation will produce the following JSON response:

```
{
    "data": {
        "createPost": {
            "_id": "62c56e724e726f6caba3e7fa",
            "content": "Dummy content"
            title: "Dummy Title"
        }
    }
}
```

### Updating posts

```
{
     query: `
        mutation {
          updatePost(postId: "62c56e724e726f6caba3e7fa", postInput: {title: "Updated Title", content: "Updated Content", imageUrl: "updated-Image-URL.png"} ) {
            _id
            title
            content
            imageUrl
          }
        }
      `
}
```

The above GraphQL mutation will produce the following JSON response:
```
{
    "data": {
        "updatePost" :
            {    
                "_id": "62c56e724e726f6caba3e7fa",
                "content": "Updated Content"
                "title": "Updated Title",
                "imageUrl": "updated-Image-URL.png"
            } 
        }
}
```

### Deleting posts

```
{
  query: `
      mutation {
    deletePost(postId: "62c56e724e726f6caba3e7fa")
  }
  `  
}
      
```
## Support

For support, email chisomije92@gmail.com.

