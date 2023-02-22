export async function notes(user, _, { models }) {
  return await models.Note.find({ author: user._id }).sort({ _id: -1 })
}
export async function favorites(user, _, { models }) {
  // in our DB we defined the favoritedBy field as an array of users id
  // find all notes where its array field "favoritedBy" contains the "user._id" element
  // SEE: https://www.mongodb.com/docs/manual/reference/method/db.collection.find/#query-arrays
  return await models.Note.find({ favoritedBy: user._id }).sort({ _id: -1 })
}
