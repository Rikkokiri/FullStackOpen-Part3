/**
 * The application should work as follows.
 * Insert new phone numbers by passing three command-line arguments (the first is the password), e.g.:
 * > node mongo.js yourpassword name 040-1234556
 *
 * * Note: if the name contains whitespace characters, it must be enclosed in quotes:
 * > node mongo.js yourpassword "name with spaces" 040-1234556
 *
 * As a result, the application will print:
 * > added {name} number 040-1234556 to phonebook
 *
 * If the password is the only parameter given to the program, meaning that it is invoked like this:
 * > node mongo.js yourpassword
 * then the program should display all of the entries in the phonebook:
 * > phonebook:
 * > {name} {number}
 */

const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]
const dbUrl = `mongodb+srv://fullstackdatabase:${password}@cluster0.riu6l.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.connect(dbUrl)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

// Get name and number as command line parameters
const name = process.argv[3]
const number = process.argv[4]

if (name && number) {
  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then((result) => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}
