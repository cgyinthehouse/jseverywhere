/* Helper file for seeding user data during testing or local development */

import models from '../../models/index.js'
import seedUsers from './users.js'
import seedNotes from './notes.js'
import { connect } from '../../db.js'
// import * as dotenv from 'dotenv'
// dotenv.config()

const DB_HOST = process.env.DB_HOST

const seed = async () => {
  console.log('Seeding data...')
  connect(DB_HOST)
  const users = await models.User.create(await seedUsers())
  await models.Note.create(await seedNotes(users))
  console.log('Data successfully seeded')
  process.exit(0)
}

seed()

// module.exports = seed;
