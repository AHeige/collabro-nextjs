// signAccessJwt.ts
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET!

export function signAccessJwt(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' })
}
