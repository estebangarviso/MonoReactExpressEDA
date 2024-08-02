import server from '../../../network/server.js'
import axios from 'axios'
import { faker } from '@faker-js/faker'
import { nanoid } from 'nanoid'
import { ROLES, ROLES_LIST } from '../../../constants/role.js'
import '../../../config/axios.js'

const fakeAdmin = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  // ISO 8601 date format (YYYY-MM-DD)
  birthDate: faker.date
    .past({ years: 18, refDate: new Date() })
    .toISOString()
    .split('T')[0],
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password({
    length: 8,
    memorable: true,
    pattern: /[a-zA-Z0-9]/,
    prefix: ''
  }),
  roleId: ROLES.ADMIN,
  secureToken: nanoid(33)
}
let accessToken = ''
let userId = ''

// const seedCurrencies = async () => {
//   for (const currency of currencies) {
//     const response = await axios.post('/v1/currency', currency)
//     if (response.status !== 201)
//       console.error(`Error importing currency ${currency.name}`)
//     else console.log(`Currency ${currency.name} imported`)
//   }
// }

const seedRoles = async () => {
  try {
    for (const role of ROLES_LIST) {
      const response = await axios.post('/v1/role', role)
      if (response.status !== 201)
        console.error(`Error importing role ${role.name}`)
      else console.log(`Role ${role.name} imported`)
    }
  } catch (error) {
    console.error(error)
  }
}

const createFakeAdmin = async () => {
  const response = await axios.post('/v1/user/signup', fakeAdmin)
  if (response.status !== 201) console.error(`Error importing salesman`)
  else console.log(`User ${fakeAdmin.email} imported`)
}

const createFakeCustomers = async () => {
  const customers = Array.from({ length: 10 }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    birthDate: faker.date
      .past({ years: 18, refDate: new Date() })
      .toISOString()
      .split('T')[0],
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({
      length: 8,
      memorable: true,
      pattern: /[a-zA-Z0-9]/,
      prefix: ''
    }),
    roleId: 2,
    secureToken: nanoid(33)
  }))
  const promises = customers.map(customer =>
    axios.post('/v1/user/signup', customer)
  )
  const responses = await Promise.all(promises)

  responses.forEach((response, index) => {
    if (response.status !== 201)
      console.error(`Error importing customer ${customers[index].email}`)
    else console.log(`User ${customers[index].email} imported`)
  })
}

const login = async () => {
  const { email, password } = fakeAdmin
  const response = await axios.post('/v1/user/login', {
    email,
    password
  })
  if (response.status === 200) {
    console.log(`Logged in`)
    accessToken = response.data.accessToken

    const profileResponse = await axios.get('/v1/user/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const {
      data: { id }
    } = profileResponse

    console.log(`Profile fetched`)
    userId = id
  } else console.error(`Error logging in`)
}

// const seedArticles = async () => {
//   for (const article of articles) {
//     const response = await axios.post('/v1/article', article, {
//       headers: {
//         authorization: `Bearer ${accessToken}`
//       }
//     })
//     if (response.status !== 201)
//       console.error(`Error importing article ${article.sku}`)
//     else console.log(`Article ${article.sku} imported`)
//   }
// }

const deleteFakeAdmin = async () => {
  const response = await axios.delete(`/v1/user/${userId}`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  if (response.status !== 200) console.error(`Error deleting salesman`)
  else console.log(`Admin deleted`)
}

export const seed = async () => {
  // await seedCurrencies()
  await seedRoles()
  await createFakeAdmin()
  await login()
  await createFakeCustomers()
  // await seedArticles()
  await deleteFakeAdmin()
}

const main = async () => {
  try {
    await server.start()
    await seed()
    await server.stop()
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}

// Call a function if this file was run directly. This allows the file
// to be runnable without running on import.
import { fileURLToPath } from 'url'
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
