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

//app.use(morgan('tiny'))

let persons = [
    { id:1, name: 'Arto Hellas', number: '040-123456' },
    { id:2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id:3, name: 'Dan Abramov', number: '12-43-234345' },
    { id:4, name: 'Mary Poppendieck', number: '39-23-6423122' },
    { id:5, name: 'Delete Abramov', number: '12-43-234345' },
  ]
  let total = persons.length
  let now = new Date()
  let info= () =>{
    let s=`<p>Phonebook has info for ${total} people</p>`
    s=s.concat(`<p>${now}</p>`)
    //console.log('s=',s)
    return s
}
  app.get('/api/persons', (req, res) => {
    res.json(persons)
  })
  app.get('/api/info', (req, res) => {
    //console.log('info=',info())
    res.send(info())
  })
  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(id)
    const persone = persons.find(p => {
      console.log(p.id, typeof p.id, id, typeof id, p.id === id)
      return p.id === id
    })
    if (persone) {
      response.json(persone)
    } else {
      response.status(404).end()
    }
    
  })
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
  
    response.status(204).end()
  })
  const generateId = () => {
    return Math.floor(Math.random() * 1000)
  }
  app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log('body',body)

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name of person missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number of person missing' 
    })
  }

  const persons1 = persons.filter(p => p.name === body.name)
  console.log('filtered by post name=',persons1)
  if (persons1.length>0) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const p = {
    id: generateId(),
    name: body.name,
    mumber: body.number
  }
  console.log('p.id',p.id)
    response.json(p)
  }) 

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

//const PORT = 3001
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})