import { connection, kratos } from './import-users-config.js'

connection.connect(async (error) => {
  if (error) throw error

  console.log('Going through Kratos identities.')

  for (let page = 1; true; page++) {
    const { data } = await kratos.adminListIdentities(10, page)
    if (!data.length) break
    await Promise.all(
      data.map(async (identity) => {
        connection.query(
          'SELECT last_login FROM user WHERE id = ?',
          [identity.metadata_public.legacy_id],
          (error, result) => importLastLogin(result, error, identity)
        )
      })
    )
  }
  connection.end()
})

async function importLastLogin(result, error, identity) {
  const lastLogin = result[0]?.last_login

  if (lastLogin) {
    await kratos.adminUpdateIdentity(identity.id, {
      schema_id: 'default',
      metadata_public: {
        ...identity.metadata_public,
        // format in mysql is: 2020-06-16 14:48:29
        // format in kratos is ISO 8601: 2023-02-09T14:21:43.234Z
        lastLogin: new Date(lastLogin.toISOString()),
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      traits: identity.traits,
      state: identity.state,
    })
    console.log(`${identity.traits.username}'s last login was imported`)
  } else {
    console.log(
      `no last login imported for ${identity.traits.username} legacy ID  ${
        identity.metadata_public.legacy_id
      }, error: ${error}, result: ${JSON.stringify(result)}`
    )
  }
}
