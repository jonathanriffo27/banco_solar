const express = require('express')
const {
	agregarUsuario, getUsuarios, editUsuario, eliminar, actualizarTransferencia,
	getTransferencias
} = require('./db.js')

const app = express()
app.use(express.static('public'))

app.post('/usuario', async (req, res) => {
	let body = ''
	req.on('data', (data) => body += data)
	req.on('end', async () => {
		body = JSON.parse(body)
		try{
			await agregarUsuario(body.nombre, body.balance)
		}
		catch(error){
			if (error.code == '23505') {
        		return res.status(400).send({mensaje: 'Este nombre de usuario ya existe'})
      		}
      		return res.status(400).send({ mensaje: error.message });
		}
		res.status(200).send({todo: 'ok'})
	})
})
app.get('/usuarios', async (req, res) => {
	try{
	const usuarios = await getUsuarios()
	res.status(200).json(usuarios)		
	}
	catch(error){
		console.log(error);
		return res.status(400).send({ error });
	}
	
})
app.put('/usuario', async (req, res) => {
	let body = ''
	req.on('data', (data) => body += data)
	req.on('end', async () => {
		body = JSON.parse(body)
		try{
			await editUsuario(req.query.id, body.name, body.balance)		
		}
		catch(error){
			console.log(error);
			return res.status(400).send({ error });
		}
		res.status(200).send({todo: 'ok'})
	})
})
app.delete('/usuario', async (req, res) => {
	try{
		const id = req.query.id
	  	await eliminar(id)	
	}
	catch(error){
		console.log(error);
		return res.status(400).send({ error });
	}
	res.status(200).send({todo: 'ok'})	
})
app.post('/transferencia', async (req, res) => {
	let body = ''
	req.on('data', (data) => body += data)
	req.on('end', async () => {
		try{
			body = JSON.parse(body)
			await actualizarTransferencia(body.emisor, body.receptor, body.monto)	
			res.status(200).send({todo: 'ok'})		
		}
		catch(error){
			console.log(error);
    		return res.status(400).send({ mensaje: error.message });
		}
		
	})
})
app.get('/transferencias', async (req, res) => {
	try{
		const transferencias = await getTransferencias()
		res.status(200).send(transferencias)		
	}
	catch(error){
		console.log(error);
		return res.status(400).send({ error });
	}
	
})

app.listen(3000, () => console.log('Servidor ejecutado en puerto 3000'))