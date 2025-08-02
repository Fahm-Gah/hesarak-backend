import type { Endpoint } from 'payload'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

interface RegisterRequest {
  email: string
  phone: string
  password: string
  fullName: string
  fatherName?: string
  gender?: 'male' | 'female'
}

export const registerUser: Endpoint = {
  path: '/auth/register',
  method: 'post',
  handler: async (req) => {
    const { payload } = req

    // Parse request body with proper error handling
    let body: RegisterRequest
    try {
      body = (await req.json?.()) || req.body
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { email, phone, password, fullName, fatherName, gender } = body

    // Validate required fields
    if (!email || !phone || !password || !fullName) {
      return Response.json(
        { error: 'Email, phone, password, and full name are required' },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      )
    }

    try {
      // Validate and normalize phone number
      const parsedPhone = parsePhoneNumberFromString(phone, 'AF')
      if (!parsedPhone || !parsedPhone.isValid()) {
        return Response.json(
          { error: 'Invalid phone number format for Afghanistan' },
          { status: 400 },
        )
      }

      const normalizedPhone = parsedPhone.format('E.164')

      // Check for existing users in parallel
      const [existingEmailUsers, existingPhoneUsers] = await Promise.all([
        payload.find({
          collection: 'users',
          where: { email: { equals: email } },
          limit: 1,
        }),
        payload.find({
          collection: 'users',
          where: {
            or: [
              { username: { equals: normalizedPhone } },
              { normalizedPhone: { equals: normalizedPhone } },
            ],
          },
          limit: 1,
        }),
      ])

      if (existingEmailUsers.docs.length > 0) {
        return Response.json({ error: 'Email already registered' }, { status: 409 })
      }

      if (existingPhoneUsers.docs.length > 0) {
        return Response.json({ error: 'Phone number already registered' }, { status: 409 })
      }

      // Create user first, then profile (better atomicity)
      // If user creation fails, no orphaned profile is created
      const user = await payload.create({
        collection: 'users',
        data: {
          email: email.toLowerCase().trim(), // Normalize email
          username: normalizedPhone,
          normalizedPhone,
          password,
          roles: ['customer'],
          isActive: true,
          // Profile will be created after user creation succeeds
        },
      })

      let profile
      try {
        // Create profile after user creation succeeds
        profile = await payload.create({
          collection: 'profiles',
          data: {
            fullName: fullName.trim(),
            fatherName: fatherName?.trim() || '',
            phoneNumber: phone.trim(),
            gender: gender || 'male',
          },
        })

        // Link profile to user
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            profile: profile.id,
          },
        })
      } catch (profileError) {
        // If profile creation fails, clean up the user
        try {
          await payload.delete({
            collection: 'users',
            id: user.id,
          })
        } catch (cleanupError) {
          console.error('Failed to cleanup user after profile creation error:', cleanupError)
        }

        console.error('Profile creation error:', profileError)
        return Response.json({ error: 'Failed to create user profile' }, { status: 500 })
      }

      // Generate authentication token
      let token
      try {
        const loginResult = await payload.login({
          collection: 'users',
          data: {
            email: user.email as string,
            password,
          },
          req,
        })
        token = loginResult.token
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError)
        // Don't fail registration if login fails - user can login manually
        token = null
      }

      return Response.json(
        {
          message: 'Registration successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            normalizedPhone: user.normalizedPhone,
            roles: user.roles,
            profile: {
              id: profile.id,
              fullName: profile.fullName,
              fatherName: profile.fatherName,
              phoneNumber: profile.phoneNumber,
              gender: profile.gender,
            },
            isActive: user.isActive,
          },
        },
        { status: 201 },
      )
    } catch (error: unknown) {
      console.error('Registration error:', error)

      // Handle specific PayloadCMS validation errors
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'ValidationError') {
          const validationError = error as any
          return Response.json(
            {
              error: 'Validation failed',
              details: validationError.data || validationError.message,
            },
            { status: 400 },
          )
        }

        if (error.name === 'MongoError' || error.name === 'BulkWriteError') {
          // Handle database constraint errors
          const dbError = error as any
          if (dbError.code === 11000) {
            // Duplicate key error
            return Response.json({ error: 'Email or phone number already exists' }, { status: 409 })
          }
        }
      }

      return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }
  },
}
