import { createContext } from 'react'

export const defaultUser = {
  name: '',
  isSuperAdmin: null,
  services: [],
}

export const UserContext = createContext({
  user: defaultUser,
  setUserData: () => {},
})
