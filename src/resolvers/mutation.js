import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
const { sign } = jwt
import { GraphQLError } from 'graphql'
import dotenv from 'dotenv'
dotenv.config()
import gravatar from '../util/gravatar.js'
import mongoose from 'mongoose'

export async function newNote(parent, args, { models, user }) {
  if (!user) {
    throw new GraphQLError('You must be signed in to create a note.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    })
  }
  return await models.Note.create({
    content: args.content,
    author: mongoose.Types.ObjectId(user.id)
  })
}
export async function updateNote(parent, { id, content }, { models, user }) {
  const result = await models.Note.findOneAndUpdate(
    { $and: [{ _id: id }, { author: user.id }] },
    { content },
    { returnDocument: 'after' }
  )
  if (result) return result
  throw new GraphQLError("You don't have premission to update the note.", {
    extensions: {
      code: 'FORBIDDEN',
      http: { status: 403 }
    }
  })
}

export async function deleteNote(parent, { id }, { models, user }) {
  if (!user) {
    throw new GraphQLError('You must be signed in to delete a note.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    })
  }
  const result = await models.Note.findOneAndDelete({
    $and: [{ _id: id }, { author: user.id }]
  })

  if (result) {
    console.log(result)
    return true
  }
  throw new GraphQLError("You don't have premission to delete the note.", {
    extensions: {
      code: 'FORBIDDEN',
      http: { status: 403 }
    }
  })
}

export async function signUp(
  parent,
  { username, email, password },
  { models }
) {
  email = email.trim().toLowerCase()
  const avatar = gravatar(email)
  const encrypted = await hash(password, 10)
  try {
    const user = await models.User.create({
      username,
      email,
      avatar,
      password: encrypted
    })
    return sign({ id: user._id }, process.env.JWT_SECRET)
  } catch (e) {
    console.log(e)
    throw new Error('Error creating account.')
  }
}
export async function signIn(
  parent,
  { username, email, password },
  { models }
) {
  try {
    // first: find if the user exist
    const user = await models.User.findOne({
      $or: [{ email: email.trim().toLowerCase() }, { username }]
    })
    if (!user) {
      throw new GraphQLError('Error signing in.', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 }
        }
      })
    }
    // second: check if the password is correct
    const isValied = await compare(password, user.password)
    if (!isValied) {
      throw new GraphQLError('Error signing in.', {
        extensions: {
          code: 'UNAUTHENTICATED',
          http: { status: 401 }
        }
      })
    }
    return sign({ id: user._id }, process.env.JWT_SECRET)
  } catch (e) {
    console.log(e)
    throw new Error('Error signing in')
  }
}

export async function toggleFavorite(parent, { id }, { models, user }) {
  if (!user) {
    throw new GraphQLError('You must be signed in to like the notes.', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } }
    })
  }
  const noteCheck = await models.Note.findById(id)
  const hasUser = await noteCheck.favoritedBy.includes(user.id)
  if (hasUser) {
    return models.Note.findByIdAndUpdate(
      id,
      {
        $pull: { favoritedBy: mongoose.Types.ObjectId(user.id) },
        $inc: { favoriteCount: -1 }
      },
      { returnDocument: 'after' }
    )
  } else {
    return models.Note.findByIdAndUpdate(
      id,
      {
        $push: { favoritedBy: mongoose.Types.ObjectId(user.id) },
        $inc: { favoriteCount: 1 }
      },
      { returnDocument: 'after' }
    )
  }
}
