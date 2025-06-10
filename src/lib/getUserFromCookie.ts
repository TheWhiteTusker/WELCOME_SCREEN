// lib/getUserFromCookie.ts
import jwt from "jsonwebtoken"

export function getUserFromToken(token: string | undefined) {
  if (!token) return null
  try {
    const decoded = jwt.decode(token)
    return decoded
  } catch {
    return null
  }
}
