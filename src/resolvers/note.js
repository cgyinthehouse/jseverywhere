// resolves user's info by note's AUTHOR key(stored as user's id)
export async function author(note, _, { models }) {
  return await models.User.findById(note.author)
}

// resolves users info from the note's favorited-by list
export async function favoritedBy(note, _, { models }) {
  return await models.User.find({ _id: { $in: note.favoritedBy } })
}
