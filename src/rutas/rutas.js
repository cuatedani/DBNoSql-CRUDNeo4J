const { json } = require('body-parser')
const express = require('express')
const router = express.Router()
const redis = require('redis')
const neoclient = require('../../connections/neo4jcon')

const redisclient = redis.createClient({
    host: "localhost",
    port: "6379"
})

redisclient.on('error', (err) => console.log('Redis Client Error', err))
redisclient.connect()

var hoy = new Date()
var fecha = hoy.getFullYear() + ":" + (hoy.getMonth() + 1) + ':' + hoy.getDate()
var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds()
var key = fecha + ':' + hora

router.get('/Escuela', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Escuela) RETURN n')
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }

})

router.get('/Escuela/:clave', async (req, res) => {
    try {
        const datos = await neoclient.run('MATCH (n:Escuela{clave:$clave}) RETURN n',
            {
                clave: req.params.clave.replace(":", "")
            }
        )
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }

})

router.post('/Escuela', async (req, res) => {
    try {
        await neoclient.run(
            'CREATE (n:Escuela{clave:$clave, nombre:$nombre, direccion:$direccion, ciudad:$ciudad}) RETURN n',
            {
                clave: req.body.clave,
                nombre: req.body.nombre,
                direccion: req.body.direccion,
                ciudad: req.body.ciudad
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo guardado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.put('/Escuela/:clave', async (req, res) => {
    try {
        await neoclient.run(
            'MATCH (n:Escuela{clave:$clave}) SET n.nombre=$nombre, n.direccion=$direccion, n.ciudad=$ciudad',
            {
                clave: req.params.clave.replace(":", ""),
                nombre: req.body.nombre,
                direccion: req.body.direccion,
                ciudad: req.body.ciudad
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo actualizado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.get('/Docente', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Docente) RETURN n')
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.get('/Docente/:curp', async (req, res) => {
    try {
        const datos = await neoclient.run('MATCH (n:Docente{curp:$curp}) RETURN n',
            {
                curp: req.params.curp.replace(":", "")
            }
        )
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.post('/Docente', async (req, res) => {
    try {
        await neoclient.run(
            'CREATE (n:Docente{curp:$curp, clave:$clave, nombre:$nombre, telefono:$telefono, cuenta:$cuenta, oficina:$oficina, especialidad:$especialidad, grado:$grado})',
            {
                curp: req.body.curp,
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                oficina: req.body.oficina,
                especialidad: req.body.especialidad,
                grado: req.body.grado
            }
        )
        await neoclient.run(
            'MATCH (n1:Docente{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"docente"}]->(n2)',
            {
                curp: req.body.curp,
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo guardado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.put('/Docente/:curp', async (req, res) => {
    try {
        await neoclient.run(
            'MATCH (n:Docente{curp:$curp}) SET n.clave=$clave, n.nombre=$nombre, n.telefono=$telefono, n.cuenta=$cuenta, n.oficina=$oficina, n.especialidad=$especialidad, n.grado=$grado',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                oficina: req.body.oficina,
                especialidad: req.body.especialidad,
                grado: req.body.grado
            }
        )
        await neoclient.run(
            'MATCH (e{curp:$curp})-[p:Trabaja]->()  DELETE p',
            {
                curp: req.params.curp.replace(":", ""),
            }
        )
        await neoclient.run(
            'MATCH (n1:Docente{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"docente"}]->(n2)',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo actualizado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.get('/Administrativo', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Administrativo) RETURN n')
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.get('/Administrativo/:curp', async (req, res) => {
    try {
        const datos = await neoclient.run('MATCH (n:Administrativo{curp:$curp}) RETURN n',
            {
                curp: req.params.curp.replace(":", "")
            }
        )
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.post('/Administrativo', async (req, res) => {
    try {

        await neoclient.run(
            'CREATE (n:Administrativo{curp:$curp, clave:$clave, nombre:$nombre, telefono:$telefono, cuenta:$cuenta, funcion:$funcion, horaentrada:$horaentrada, horasalida:$horasalida, extensiontelefonica:$extensiontelefonica, correo:$correo})',
            {
                curp: req.body.curp,
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                funcion: req.body.funcion,
                horaentrada: req.body.horaentrada,
                horasalida: req.body.horasalida,
                extensiontelefonica: req.body.extensiontelefonica,
                correo: req.body.correo
            }
        )
        await neoclient.run(
            'MATCH (n1:Administrativo{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"admin"}]->(n2)',
            {
                curp: req.body.curp,
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo guardado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.put('/Administrativo/:curp', async (req, res) => {
    try {

        await neoclient.run(
            'MATCH (n:Administrativo{curp:$curp}) SET n.clave=$clave, n.nombre=$nombre, n.telefono=$telefono, n.cuenta=$cuenta, n.funcion=$funcion, n.horaentrada=$horaentrada, n.horasalida=$horasalida, n.extensiontelefonica=$extensiontelefonica, n.correo=$correo',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                funcion: req.body.funcion,
                horaentrada: req.body.horaentrada,
                horasalida: req.body.horasalida,
                extensiontelefonica: req.body.extensiontelefonica,
                correo: req.body.correo
            }
        )
        await neoclient.run(
            'MATCH (e{curp:$curp})-[p:Trabaja]->()  DELETE p',
            {
                curp: req.params.curp.replace(":", ""),
            }
        )
        await neoclient.run(
            'MATCH (n1:Administrativo{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"admin"}]->(n2)',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo actualizado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.get('/Mantenimiento', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Mantenimiento) RETURN n')
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.get('/Mantenimiento/:curp', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Mantenimiento{curp:$curp}) RETURN n',
            {
                curp: req.params.curp.replace(":", "")
            }
        )
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.post('/Mantenimiento', async (req, res) => {
    try {

        await neoclient.run(
            'CREATE (n:Mantenimiento{curp:$curp, clave:$clave, nombre:$nombre, telefono:$telefono, cuenta:$cuenta, telefonoinst:$telefonoinst, area:$area})',
            {
                curp: req.body.curp,
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                telefonoinst: req.body.telefonoinst,
                area: req.body.area
            }
        )
        await neoclient.run(
            'MATCH (n1:Mantenimiento{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"mant"}]->(n2)',
            {
                curp: req.body.curp,
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo guardado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.put('/Mantenimiento/:curp', async (req, res) => {
    try {

        await neoclient.run(
            'MATCH (n:Mantenimiento{curp:$curp}) SET n.clave=$clave, n.nombre=$nombre, n.telefono=$telefono, n.cuenta=$cuenta, n.telefonoinst=$telefonoinst, n.area=$area',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
                nombre: req.body.nombre,
                telefono: req.body.telefono,
                cuenta: req.body.cuenta,
                telefonoinst: req.body.telefonoinst,
                area: req.body.area
            }
        )
        await neoclient.run(
            'MATCH (e{curp:$curp})-[p:Trabaja]->()  DELETE p',
            {
                curp: req.params.curp.replace(":", ""),
            }
        )
        await neoclient.run(
            'MATCH (n1:Mantenimiento{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Trabaja{rol:"mant"}]->(n2)',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo actualizado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.get('/Alumno', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (n:Alumno) RETURN n')
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.get('/Alumno/:curp', async (req, res) => {
    try {
        const datos = await neoclient.run('MATCH (n:Alumno{curp:$curp}) RETURN n',
            {
                curp: req.params.curp.replace(":", "")
            }
        )
        res.json(datos.records.map(i => i.get('n').properties))

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.post('/Alumno', async (req, res) => {
    try {

        await neoclient.run(
            'CREATE (n:Alumno{curp:$curp, tutor:$tutor, nombre:$nombre, fechanac:$fechanac})',
            {
                curp: req.body.curp,
                tutor: req.body.tutor,
                nombre: req.body.nombre,
                fechanac: req.body.fechanac
            }
        )

        await neoclient.run(
            'MATCH (n1:Alumno{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Inscrito{escuela:$clave,fecha:$fecha}]->(n2)',
            {
                curp: req.body.curp,
                clave: req.body.clave,
                fecha: req.body.fechainscripcion
            }
        )
        await neoclient.run(
            'MATCH (n1:Alumno{curp:$curp}),(n2:Docente{curp:$tutor}) CREATE (n2)-[:Tutora]->(n1)',
            {
                curp: req.body.curp,
                tutor: req.body.tutor
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo guardado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.put('/Alumno/:curp', async (req, res) => {
    try {

        await neoclient.run(
            'MATCH (n:Alumno{curp:$curp}) SET n.tutor=$tutor, n.nombre=$nombre, n.fechanac=$fechanac',
            {
                curp: req.params.curp.replace(":", ""),
                tutor: req.body.tutor,
                nombre: req.body.nombre,
                fechanac: req.body.fechanac
            }
        )
        await neoclient.run(
            'MATCH (a{curp:$curp})-[r:Inscrito]->()  DELETE r',
            {
                curp: req.params.curp.replace(":", ""),
            }
        )
        await neoclient.run(
            'MATCH (n1:Alumno{curp:$curp}),(n2:Escuela{clave:$clave}) CREATE (n1)-[:Inscrito{clave:$clave,fecha:$fecha}]->(n2)',
            {
                curp: req.params.curp.replace(":", ""),
                clave: req.body.clave,
                fecha: req.body.fechainscripcion
            }
        )
        await neoclient.run(
            'MATCH (d{curp:$tutor})-[r:Tutora]->(a{curp:$curp})  DELETE r',
            {
                curp: req.params.curp.replace(":", ""),
                tutor: req.body.tutor
            }
        )
        await neoclient.run(
            'MATCH (n1:Alumno{curp:$curp}),(n2:Docente{curp:$tutor}) CREATE (n2)-[:Tutora]->(n1)',
            {
                curp: req.params.curp.replace(":", ""),
                tutor: req.body.tutor
            }
        )

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

        res.json({ message: "Nodo actualizado exitosamente" })
    } catch (err) {
        console.error(err)
    }
})

router.get('/PersonalDocente', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (e)-[p:Trabaja{rol:"docente"}]->(d) RETURN e,d')
        res.json(datos.records)

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)
    } catch (err) {
        console.error(err)
    }
})

router.get('/Tutorados/:curp', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (d{curp:$curp})-[:Tutora]->(a) RETURN d,a',
            {
                curp: req.params.curp.replace(":", "")
            }
        )
        res.json(datos.records)

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

    } catch (err) {
        console.error(err)
    }
})

router.get('/PersonalAdministrativo', async (req, res) => {
    try {

        const datos = await neoclient.run('MATCH (e)-[:Trabaja{rol:"admin"}]->(a) RETURN e,a;')
        res.json(datos.records)

        const ope = req.method + " en " + req.url
        await redisclient.set(key, ope)

    } catch (err) {
        console.error(err)
    }
})

module.exports = router;