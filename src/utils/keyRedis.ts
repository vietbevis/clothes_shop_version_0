export const sessionKey = (...args: string[]) => {
  return `session:${args.join(':')}`
}

export const lockKey = (...args: string[]) => {
  return `lock:${args.join(':')}`
}

export const verificationKey = (email: string, otp: string) => {
  return `verification:${email}-${otp}`
}

export const resendOTPKey = (email: string, otp: string) => {
  return `resend-otp:${email}-${otp}`
}

export const forgotPasswordKey = (email: string, otp: string) => {
  return `forgot-password:${email}-${otp}`
}

export const deleteUnverifiedUserQueueKey = (email: string) => {
  return `delete-unverified-user-${email}`
}
