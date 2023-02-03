import mysql from 'mysql'
import { Configuration } from '@ory/client'
import { V0alpha2Api } from '@ory/client'

export const config = {
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

export const kratos = new V0alpha2Api(
  new Configuration({
    basePath: config.kratosHost,
  })
)

export const connection = mysql.createConnection({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
})
