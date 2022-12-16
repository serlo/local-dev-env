const hashService = require('./legacy-password-hash-service').hashService
const { connection, kratos } = require('./import-users-config')

connection.connect(async (error) => {
  if (error) throw error

  connection.query('SELECT * FROM user', async (error, result) => {
    if (error) throw error
    const usersWithValidUsername = result.filter(
      (user) => !user.username.match(/^[\w\-]+$/g)
    )
    await importUsersWithInvalidUsernames(usersWithValidUsername)
    console.log('Successful Import of Users')
    process.exit(0)
  })
})

async function importUsersWithInvalidUsernames(users) {
  for (const legacyUser of users) {
    const newUsername = legacyUser.username
      .replaceAll('.', '-')
      .replaceAll('Ã¼', 'ue')
      .replaceAll('Ã¶', 'oe')
      .replaceAll('Ã¤', 'ae')
      .replaceAll('Ãœ', 'Ue')
      .replaceAll('ÃŸ', 'ss')
      .replaceAll('@', '-')

    const user = {
      traits: {
        username: newUsername,
        email: legacyUser.email,
        description: legacyUser.description || '',
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
    console.log(
      'Importing user ' + newUsername + ' previously ' + legacyUser.username
    )
    await kratos.adminCreateIdentity(user).catch((error) => {
      throw new Error(error.message + ' while importing ' + legacyUser.id)
    })
  }
}
