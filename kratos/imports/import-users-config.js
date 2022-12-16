const mysql = require('mysql')
const Configuration = require('@ory/client').Configuration
const V0alpha2Api = require('@ory/client').V0alpha2Api

const config = {
  kratosHost: process.env.RUN_IN_DOCKER
    ? 'http://kratos:4434'
    : 'http://localhost:4433',
  db: {
    host: process.env.RUN_IN_DOCKER ? 'host.docker.internal' : 'localhost',
    user: 'root',
    password: 'secret',
    database: 'serlo',
  },
}

const kratos = new V0alpha2Api(
  new Configuration({
    basePath: config.kratosHost,
  })
)

const connection = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
})

module.exports = {
  kratos,
  connection,
}
