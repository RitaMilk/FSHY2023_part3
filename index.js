require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
morgan = require('morgan')
morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms  :type  :body'))

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

const Phone = require('./models/phone')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

//app.use(morgan('tiny'))

/* let persons = [
    { id:1, name: 'Arto Hellas', number: '040-123456' },
    { id:2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id:3, name: 'Dan Abramov', number: '12-43-234345' },
    { id:4, name: 'Mary Poppendieck', number: '39-23-6423122' },
    { id:5, name: 'Delete Abramov', number: '12-43-234345' },
  ] */
let total = 0
let now = new Date()
let info= () => {
  let s=`<p>Phonebook has info for ${total} people</p>`
  s=s.concat(`<p>${now}</p>`)
  //console.log('s=',s)
  return s
}
app.get('/api/phones', (request, response) => {
  console.log('reitti /api/phones')
  Phone.find({}).then(phones => {
    console.log('phonebook:')
    response.json(phones)
  })
})
app.get('/api/info', (request, response) => {
  //console.log('info=',info())
  Phone.find({}).then(phones => {
    total=phones.length
    console.log('phonebook:')
    response.json(info())
  })
})

app.get('/api/phones/:id', (request, response,next) => {
  Phone.findById(request.params.id)
    .then(phone => {
      if (phone) {
        response.json(phone)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  /* .catch(error => {
          console.log(error)
          response.status(400).send({ error: 'malformatted id' })
        }) */

})

app.delete('/api/phones/:id', (request, response,next) => {
  Phone.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
app.put('/api/phones/:id', (request, response,next) => {
  const { name, number } = request.body
  Phone.findByIdAndUpdate(
    request.params.id,
    { name,number },
    { new:true,runValidators: true,context: 'query' }
  )
    .then(returnedPhone => {
      console.log('kuku')
      console.log('send phone',request.body.number)
      console.log('updated phone',returnedPhone)
      returnedPhone.number=request.body.number
      response.json(returnedPhone)
    })
    .catch(error => next(error))
})

app.post('/api/phones', (request, response,next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  const phone = new Phone({
    name: body.name,
    number: body.number,
  })

  phone.save().then(savedPhone => {
    response.json(savedPhone)
  })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)//part3-5 virheiden käsittely middleware

//const PORT = 3001
//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})