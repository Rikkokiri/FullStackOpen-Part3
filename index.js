const { response } = require('express')
const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

// Configure middleware Morgan for logging
morgan.token('post-body', function getBody(req) {
  return JSON.stringify(req.body)
})

// app.use(morgan('tiny'))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post-body'
  )
)

let contacts = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
]

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${contacts.length} people</p>
		<p>${new Date()}</p>`
  )
})

app.get('/api/persons', (_req, res) => {
  res.json(contacts)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const contact = contacts.find((contact) => contact.id === id)
  if (contact) {
    res.json(contact)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  contacts = contacts.filter((contact) => contact.id !== id)
  res.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random() * 1000000000)
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  // The request is not allowed to succeed, if:
  // - The name or number is missing
  // - The name already exists in the phonebook
  if (!body.number) {
    return res.status(400).json({
      error: 'Number missing',
    })
  }

  if (!body.name) {
    return res.status(400).json({
      error: 'Name missing',
    })
  }

  // 409: Conflict (https://tools.ietf.org/html/rfc7231#section-6.5.8)
  if (!isNameUnique(body.name)) {
    return res.status(409).json({
      error: 'Name must be unique',
    })
  }

  const contact = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  contacts = contacts.concat(contact)
  res.json(contact)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const isNameUnique = (name) => {
  let matches = contacts.filter(
    (contact) => contact.name.toLowerCase() == name.toLowerCase()
  )
  return matches.length === 0
}

const PORT = 3001
app.listen(PORT)
