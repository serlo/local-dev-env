const { connection, kratos } = require('./import-users-config')
const hashService = require('./legacy-password-hash-service').hashService

connection.connect(async (error) => {
  if (error) throw error

  let allIdentities = []

  for (let page = 1; true; page++) {
    const data = await kratos
      .adminListIdentities(10, page)
      .then(({ data }) => data)
    if (!data.length) break
    allIdentities = [...allIdentities, ...data]
  }
  if (allIdentities) {
    await Promise.all(
      allIdentities.map(async (identity) => {
        await kratos.adminDeleteIdentity(identity.id)
        console.log(identity.traits.username + ' was deleted')
      })
    )
  }

  connection.query('SELECT * FROM user', async (error, result) => {
    if (error) throw error
    const usersWithValidUsername = result.filter((user) =>
      user.username.match(/^[\w\-]+$/g)
    )
    await importUsers(usersWithValidUsername)
    console.log('Successful Import of Users')
    process.exit(0)
  })
})

async function importUsers(users) {
  for (const legacyUser of users) {
    const user = {
      traits: {
        username: legacyUser.username,
        email: legacyUser.email,
        description: legacyUser.description || '',
        language: 'en',
      },
      credentials: {
        password: {
          config: {
            hashed_password: hashService.convertToPHC(legacyUser.password),
          },
        },
      },
      metadata_public: { legacy_id: legacyUser.id },
      verifiable_addresses: [
        {
          value: legacyUser.email,
          verified: true,
          via: 'email',
          status: 'completed',
        },
      ],
    }
    console.log('Importing user ' + legacyUser.username)
    await kratos.adminCreateIdentity(user)
  }
}
