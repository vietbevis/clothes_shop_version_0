// eslint-disable-next-line no-undef,@typescript-eslint/no-require-imports
const crypto = require('crypto')
// eslint-disable-next-line no-undef,@typescript-eslint/no-require-imports
const fs = require('fs')

function generateKeyPair() {
  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  // Save private key
  fs.writeFileSync('private_key.pem', privateKey)
  console.log('Private key saved to private_key.pem')

  // Save public key
  fs.writeFileSync('public_key.pem', publicKey)
  console.log('Public key saved to public_key.pem')
}

generateKeyPair()
