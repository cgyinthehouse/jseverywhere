import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { GraphQLError } from 'graphql'
import depthLimit from 'graphql-depth-limit'
import { createComplexityLimitRule } from 'graphql-validation-complexity'
import bodyparser from 'body-parser'
const { json } = bodyparser
import cors from 'cors'
import http from 'http'
import helmet from 'helmet'
// import * as dotenv from 'dotenv'
// dotenv.config()
import { connect } from './db.js'
import models from './models/index.js'
import typeDefs from './schema.js'
import resolvers from './resolvers/index.js'
import jwt from 'jsonwebtoken'
const { verify } = jwt

// 在 .env文件指定的端口或4000端口上運行服務器
const port = process.env.PORT || 4000
const DB_HOST = process.env.DB_HOST

connect(DB_HOST)

// jwt verification ; get the user info from JWT
function getUser(token) {
  if (token) {
    try {
      return verify(token, process.env.JWT_SECRET)
    } catch (e) {
      throw new GraphQLError('Session Invalid', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 }
        }
      })
    }
  }
}

const app = express()
app.use(helmet())
app.use(cors())

// http server handles incoming request to our express app
const httpServer = http.createServer(app)

//設置Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

await server.start()

//應用Apollo GraphQL 中間件， 把路徑設爲/api
app.use(
  '/api',
  json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      let user
      const token = req.headers.authorization
      user = getUser(token)
      if (user) {
        console.log(user)
      }
      // contextValue: accessible to resolvers and plugins
      return { models, user }
    }
  })
)

app.listen({ port }, () => {
  console.log(`GraphQL server running at http://localhost:${port}/api`)
})
