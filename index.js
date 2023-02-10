require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const Person = require('./models/person')


let persons = [
  { 
    'id': 1,
    'name': 'Arto Hellas', 
    'number': '040-123456'
  },
  { 
    'id': 2,
    'name': 'Ada Lovelace', 
    'number': '39-44-5323523'
  },
  { 
    'id': 3,
    'name': 'Dan Abramov', 
    'number': '12-43-234345'
  },
  { 
    'id': 4,
    'name': 'Mary Poppendieck', 
    'number': '39-23-6423122'
  }
]

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

const generateId = () => {
  return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  //   if (persons.some(person=>person.name===body.name)){
  //     return response.status(400).json({ 
  //       error: 'name must be unique'
  //     })
  //   }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson=>{response.json(savedPerson)}).catch(error => next(error))
})

// 3.1
app.get('/api/persons', (req, res) => {
  Person.find({}).then(people=>
    res.json(people))
})

// 3.2
app.get('/info', (req, res) => {
  const p1= '<p>Phonebook has info for ' + persons.length + ' people</p>' 
  const p2= '<p>'+new Date()+'</p>'
  res.send(p1+p2)

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
  
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})