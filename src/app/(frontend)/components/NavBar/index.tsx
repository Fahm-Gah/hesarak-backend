import React from 'react'
import { cookies } from 'next/headers'
import { getMeUser } from '@/utils/getMeUser'
import { NavBarClient } from './index.client'

export const NavBar = async () => {
  // Force this component to be dynamic by accessing cookies
  await cookies()

  let user = null

  try {
    const result = await getMeUser()
    user = result?.user
  } catch (error) {
    // User is not authenticated
    console.log(error)
  }

  return <NavBarClient user={user} />
}
