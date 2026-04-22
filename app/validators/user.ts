import vine from '@vinejs/vine'

/**
 * Validator for login
 */
export const loginValidator = vine.create({
  username: vine.string().trim(),
  password: vine.string(),
})

/**
 * Validator for creating a user (admin)
 */
export const createUserValidator = vine.create({
  username: vine.string().trim().minLength(2).maxLength(50),
  password: vine.string().minLength(4).maxLength(32),
  displayName: vine.string().trim().minLength(1).maxLength(100),
  role: vine.enum(['admin', 'server', 'bar']),
})
