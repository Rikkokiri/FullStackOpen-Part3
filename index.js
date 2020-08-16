const express = require('express')
const app = express()

app.use(express.json())

let contacts = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
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

app.get('/api/persons', (req, res) => {
    res.json(contacts)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const contact = contacts.find(contact => contact.id === id)
    if (contact) {
        res.json(contact)
    } else {
        res.status(404).end()
    }
})

const PORT = 3001
app.listen(PORT)