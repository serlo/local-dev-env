import sha1 from 'js-sha1'

function uniqid(prefix = '', random = false) {
  const sec = Date.now() * 1000 + Math.random() * 1000
  const id = sec.toString(16).replace(/\./g, '').padEnd(14, '0')
  return `${prefix}${id}${
    random ? `.${Math.trunc(Math.random() * 100000000)}` : ''
  }`
}

class HashService {
  salt_pattern = '1,3,5,9,14,15,20,21,28,30'

  constructor() {
    this.salt_pattern = this.salt_pattern.split(',')
  }

  hashPassword(password, salt = false) {
    if (salt === false) {
      salt = sha1(uniqid(null, true), this.salt_pattern)
    }

    let hash = sha1(salt + password)

    salt = salt.split('')

    password = ''

    let last_offset = 0

    for (const offset of this.salt_pattern) {
      const part = hash.substr(0, offset - last_offset)
      hash = hash.substr(offset - last_offset)

      password += part + salt.shift()

      last_offset = offset
    }

    return password + hash
  }

  findSalt(password) {
    let salt = ''
    for (const [index, offset] of this.salt_pattern.entries()) {
      salt += password.substr(parseInt(offset) + index, 1)
    }

    return salt
  }

  findSha(hashedPassword) {
    let sha = hashedPassword.split('')
    for (const offset of this.salt_pattern) {
      sha.splice(offset, 1)
    }

    return sha.join('')
  }

  convertToPHC(hashedPassword) {
    const passwordSaltBase64 = Buffer.from(
      this.findSalt(hashedPassword),
    ).toString('base64')
    const hashedPasswordBase64 = Buffer.from(
      this.findSha(hashedPassword),
      'hex',
    ).toString('base64')
    // [p]assword[f]ormat = {SALT}{PASSWORD}
    return `$sha1$pf=e1NBTFR9e1BBU1NXT1JEfQ==$${passwordSaltBase64}$${hashedPasswordBase64}`
  }
}

export const hashService = new HashService()

// TODO: put it in another file in order to make it executable
// if (require.main === module) {
//   switch (process.argv[2]) {
//     case 'hash':
//       console.log(hashService.hashPassword(process.argv[3], process.argv[4]))
//       break
//     case 'find':
//       console.log(hashService.findSalt(process.argv[3]))
//       break
//     case 'sha':
//       console.log(hashService.findSha(process.argv[3]))
//       break
//     case 'phc':
//       console.log(hashService.convertToPHC(process.argv[3]))
//       break
//     default:
//       console.log(
//         'use `hash [string] [optional salt] `, `find [hashed password]` or `phc [hashed password]`'
//       )
//   }
// }
