const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bancosolar',
  password: '1234',
  max: 12,
  min: 2,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000
})

async function agregarUsuario (nombre, balance) {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: `insert into usuarios (nombre, balance) values ($1, $2)
          returning *`,
    values: [nombre, balance]
  })
  client.release()
  return rows[0]
}
async function editUsuario (id, name, balance) {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: `update usuarios set nombre=$2, balance=$3 where id=$1
           returning *`,
    values: [id, name, balance]
  })
  client.release()
  return rows[0]
}
async function getUsuarios() {
  const client = await pool.connect()
  const { rows } = await client.query('select * from usuarios')
  client.release()
  return rows
}
async function getTransferencias() {
  const client = await pool.connect()
  const { rows } = await client.query({
    text:'select transferencias.fecha, usuarios.nombre, users.nombre, transferencias.monto from transferencias join usuarios on transferencias.emisor = usuarios.id join usuarios as users on transferencias.receptor = users.id',
    rowMode: 'array' 
  })
  client.release()
  return rows
}
async function actualizarTransferencia (emisor, receptor, monto) {
  const client = await pool.connect()
  if (emisor === receptor)
      throw new Error('El emisor y el receptor no pueden ser el mismo');
  if (monto <= 0){
    throw new Error('Monto no puede ser menor a 0');
  }
  const emisorFiltrado = await client.query({
    text: 'select * from usuarios where nombre = $1',
    values: [emisor]
  })
  const receptorFiltrado = await client.query({
    text: 'select * from usuarios where nombre = $1',
    values: [receptor]
  })
  if (monto > emisorFiltrado.rows[0].balance)
      throw new Error('Emisor no tiene suficiente saldo');
  await client.query({
    text: `insert into transferencias (emisor, receptor, monto) values ($1, $2, $3) returning *`,
    values: [emisorFiltrado.rows[0].id, receptorFiltrado.rows[0].id, monto]
  })
  await client.query({
    text: `update usuarios set balance = balance - $2 where nombre=$1
           returning *`,
    values: [emisor, monto]
  })
  await client.query({
    text: `update usuarios set balance = balance + $2 where nombre=$1
           returning *`,
    values: [receptor, monto]
  })
  // console.log(emisorFiltrado.rows[0].id)
  client.release()
  return 
}
async function eliminar (idd) {
  const id = parseInt(idd)
  const client = await pool.connect()
  await client.query({
    text: `delete from transferencias where emisor=$1 or receptor=$1`,
    values: [id]
  })
  await client.query({
    text: `delete from usuarios where id=$1`,
    values: [id]
  })
  client.release()
  return
}

module.exports = {
  agregarUsuario, getUsuarios, editUsuario, eliminar, actualizarTransferencia,
  getTransferencias
}