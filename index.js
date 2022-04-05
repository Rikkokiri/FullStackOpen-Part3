require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
  })
);

// Serve frontend
app.use(express.static('build'));
app.use(express.json());

// Configure middleware Morgan for logging
morgan.token('post-body', function getBody(req) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post-body'
  )
);

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
];

app.get('/', (_req, res) => {
  res.send('Hello world');
});

app.get('/info', (_req, res) => {
  Person.find({}).then((people) => {
    res.send(
      `<p>Phonebook has info for ${people.length} people</p>
      <p>${new Date()}</p>`
    );
  });
});

app.get('/api/persons', (_req, res) => {
  Person.find({}).then((people) => {
    res.json(people);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((_result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  // The request is not allowed to succeed, if:
  // - The name or number is missing
  // - The name already exists in the phonebook
  if (!body.number) {
    return res.status(400).json({
      error: 'Number missing',
    });
  }

  if (!body.name) {
    return res.status(400).json({
      error: 'Name missing',
    });
  }

  // 409: Conflict (https://tools.ietf.org/html/rfc7231#section-6.5.8)
  Person.findOne({ name: body.name })
    .then((result) => {
      console.log('Find result: ', result);

      if (result) {
        res
          .status(409)
          .json({
            error: 'Name must be unique',
          })
          .end();
      } else {
        const person = new Person({
          name: body.name,
          number: body.number,
        });

        return person
          .save()
          .then((savedPerson) => {
            res.json(savedPerson);
          })
          .catch((error) => next(error));
      }
    })
    .catch((err) => next(err));
});

const unknownEndpoint = (_req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, _req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted id' });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
