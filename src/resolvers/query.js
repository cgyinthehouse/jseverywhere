export async function notes(_, __, { models }) {
  return await models.Note.find()
}
export async function note(_, args, { models }) {
  return await models.Note.findById(args.id)
}
export async function user(_, { username }, { models }) {
  return await models.User.findOne({ username })
}
export async function users(_, __, { models }) {
  return await models.User.find()
}
export async function me(_, __, { models, user }) {
  return await models.User.findById(user.id)
}
export async function noteFeed(_, { cursor }, { models }) {
  // specifies the max number of documents the query returns
  const limit = 7
  let hasNextPage = false
  let cursorQuery = {}
  let newCursor = ''

  if (cursor) {
    cursorQuery = { _id: { $lt: cursor } }
  }

  // search limit + 1 numbers of notes from the cursor if it was specified
  // otherwise the query will return the lastest set of limit + 1 numbers of notes
  // because the the query argument(the cursorQuery) is an empty object
  let notes = await models.Note.find(cursorQuery)
    .sort({ _id: -1 }) // descending
    .limit(limit + 1)

  // when the queried notes amount has exceed the limit
  if (notes.length > limit) {
    hasNextPage = true
    // because we qeury one more element than the limit ,
    // we need to slice out the last element in the array to the match the limit
    notes = notes.slice(0, -1)

    // newcursor is the last element in the array
    newCursor = notes[note.length - 1]._id
  }

  return { notes, hasNextPage, cursor: newCursor }
}
