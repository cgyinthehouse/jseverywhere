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
