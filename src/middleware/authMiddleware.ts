import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { TokenType } from '@/utils/enums'
import jwtService from '@/service/JwtService'

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Extract JWT token from header
    const jwtToken = getJwtTokenFromHeaderOrCookies(req)

    // Verify JWT token
    const decoded = await jwtService.verifyToken(jwtToken, TokenType.ACCESS_TOKEN)

    // Get device info
    const { deviceId } = decoded.payload

    req.user = decoded
    req.deviceId = deviceId

    next()
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return next(e)
    }
    next(new UnauthorizedError('Token is invalid'))
  }
}

const getJwtTokenFromHeaderOrCookies = (req: Request): string => {
  const authHeader = req.headers.authorization
  const authCookie = req.cookies?.[TokenType.ACCESS_TOKEN]

  // Kiểm tra nếu cả hai đều không tồn tại
  if (!authHeader && !authCookie) {
    throw new UnauthorizedError('No token provided')
  }

  // Lấy token từ header nếu có
  if (authHeader) {
    const tokenParts = authHeader.trim().split(' ')
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format')
    }
    return tokenParts[1]
  }

  // Lấy token từ cookie nếu có
  if (typeof authCookie !== 'string' || !authCookie.trim()) {
    throw new UnauthorizedError('Invalid token in cookies')
  }

  return authCookie
}
