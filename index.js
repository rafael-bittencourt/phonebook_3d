require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')
const cors = require('cors')


app.use(express.static('dist'))
app.use(express.json())
app.use(cors())


/* home */
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

/* get all persons */
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

/* get person by id */
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

/* add one person */
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

/* delete person */
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* update person number*/
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

/* info */
app.get('/info', (request, response) => {
  const requestTime = new Date(Date.now())
  const info = `
    <p>Phonebook has info for ${Person.length} people</p>
    <p>${requestTime}</p>
  `
  response.send(info)
})


/* error handling */
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})