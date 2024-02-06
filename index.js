//Requires
const express = require('express')
const bodyParser = require('body-parser')
const router = require('./src/rutas/rutas')
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/GestionEscolar', router)

app.listen(PORT, () => { console.log('Escucha en puerto :', PORT) })