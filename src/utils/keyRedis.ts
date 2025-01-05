export const sessionKey = (...args: string[]) => {
  return `session:${args.join(':')}`
}

export const lockKey = (...args: string[]) => {
  return `lock:${args.join(':')}`
}

export const verificationKey = (email: string) => {
  return `verification:${email}`
}

export const forgotPasswordKey = (email: string) => {
  return `forgot-password:${email}`
}

export const deleteUnverifiedUserQueueKey = (email: string) => {
  return `delete-unverified-user-${email}`
}
