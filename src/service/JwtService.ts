import { User } from '@/model/User'
import { TokenType } from '@/utils/enums'
import fs from 'fs'
import path from 'path'
import envConfig from '@/config/envConfig'
import { Algorithm, sign, verify } from 'jsonwebtoken'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { logError, logInfo } from '@/utils/log'
import { Response } from 'express'
import ms from 'ms'
import { Injectable } from '@/decorators/inject'

export type PayloadJwtToken = {
  id: string
  role: string[]
  deviceId: string
}

export type DecodedJwtToken = {
  payload: PayloadJwtToken
  iat: number
  exp: number
  sub: string
}

@Injectable()
export class JwtService {
  static readonly publicKey = fs.readFileSync(path.resolve(__dirname, '..', '..', 'public_key.pem'), 'utf8')
  static readonly privateKey = fs.readFileSync(path.resolve(__dirname, '..', '..', 'private_key.pem'), 'utf8')

  async generateToken(user: User | DecodedJwtToken, tokenType: TokenType, deviceId: string): Promise<string> {
    // Claims for the JWT token
    let payload: PayloadJwtToken
    let email: string

    if (user instanceof User) {
      payload = {
        id: user.id,
        role: user.roles.map((role) => role.name),
        deviceId
      }
      email = user.email
    } else {
      payload = user.payload
      email = user.sub
    }

    // Token options
    const ALGORITHM: Algorithm = 'RS256'
    switch (tokenType) {
      case TokenType.ACCESS_TOKEN: {
        logInfo('Generating: ' + TokenType.ACCESS_TOKEN)
        const token = sign({ payload }, JwtService.privateKey, {
          expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
          subject: email,
          algorithm: ALGORITHM
        })
        logInfo('Token generated - [' + TokenType.ACCESS_TOKEN.toUpperCase() + ']: ' + token.slice(0, 15) + '...')
        return token
      }
      case TokenType.REFRESH_TOKEN: {
        logInfo('Generating: ' + TokenType.REFRESH_TOKEN)
        const token = sign({ payload }, JwtService.privateKey, {
          expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
          subject: email,
          algorithm: ALGORITHM
        })
        logInfo('Token generated - [' + TokenType.REFRESH_TOKEN.toUpperCase() + ']: ' + token.slice(0, 15) + '...')
        return token
      }
    }
  }

  static async verifyToken(token: string, tokenType: TokenType): Promise<DecodedJwtToken> {
    return new Promise((resolve, reject) => {
      verify(token, JwtService.publicKey, (err, decoded) => {
        if (err) {
          logError('Invalid Token', err)
          return reject(new UnauthorizedError())
        }
        logInfo('Token verified: ' + tokenType)
        return resolve(decoded as DecodedJwtToken)
      })
    })
  }

  setTokenToCookie(res: Response, token: string, tokenType: TokenType) {
    switch (tokenType) {
      case TokenType.ACCESS_TOKEN:
        res.cookie(tokenType, token, {
          httpOnly: true,
          secure: true,
          sameSite: true,
          expires: new Date(Date.now() + ms(envConfig.ACCESS_TOKEN_EXPIRES_IN))
        })
        break
      case TokenType.REFRESH_TOKEN:
        res.cookie(tokenType, token, {
          httpOnly: true,
          secure: true,
          sameSite: true,
          path: '/api/v1/refresh',
          expires: new Date(Date.now() + ms(envConfig.REFRESH_TOKEN_EXPIRES_IN))
        })
        break
    }
  }
}
