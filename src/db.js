import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

export function connect(DB_HOST) {
  mongoose
    .connect(DB_HOST)
    .then(() => console.log('Connection successed'))
    .catch(e => {
      console.error(e)
      console.log(
        'Connection error occurs while connecting to MongoDB. Please make sure MongoDB is running.'
      )
    })

  // listen and handle connection errors after initially established connection
  mongoose.connection.on('error', err => {
    console.error(err)
    console.log(
      'MongoDB connection error. Please make sure MongoDB is running.'
    )
    process.exit()
  })
}
export function close() {
  mongoose.connection.close(true, () =>
    console.log('MongoDB connection closed.')
  )
}
