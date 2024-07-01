import axios from 'axios'
import server from '../../../src/network/server'
import { faker } from '@faker-js/faker'
import { IUser, TUser } from '../../../src/database/redis/models/user'
import { IOrder } from '../../../src/database/redis/models/order'
import { HydratedDocument } from 'mongoose'
import { IUserTransactions } from '../../../src/database/redis/models/userTransaction'

beforeAll(async () => {
  await server.start()
})

afterAll(async () => {
  await server.stop()
})

describe('E2E tests: Use cases for the API', () => {
  const newUsersNames = {
    customer: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    salesman: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  }
  const newUsers = {
    salesman: {
      firstName: newUsersNames.salesman.firstName,
      lastName: newUsersNames.salesman.lastName,
      email: faker.internet
        .email(
          newUsersNames.salesman.firstName,
          newUsersNames.salesman.lastName
        )
        .toLocaleLowerCase(),
      password: faker.internet.password(8),
      roleId: 1
    },
    customer: {
      firstName: newUsersNames.customer.firstName,
      lastName: newUsersNames.customer.lastName,
      email: faker.internet
        .email(
          newUsersNames.customer.firstName,
          newUsersNames.customer.lastName
        )
        .toLocaleLowerCase(),
      password: faker.internet.password(8),
      roleId: 2
    }
  }
  const newArticles = [
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: Number(faker.random.numeric(2)),
      unitPrice: Number(faker.commerce.price(1000, 10000))
    },
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: Number(faker.random.numeric(2)),
      unitPrice: Number(faker.commerce.price(1000, 10000))
    },
    {
      sku: `${faker.commerce.product().toLowerCase()}-${faker.random.numeric(
        3
      )}`,
      title: faker.commerce.productName(),
      shortDescription: faker.commerce.productDescription(),
      unity: 'ea',
      qtyStock: Number(faker.random.numeric(2)),
      unitPrice: Number(faker.commerce.price(1000, 10000))
    }
  ]
  const newAmountToDeposit = faker.commerce.price(100000, 1000000)

  const customerTokens = {
    accessToken: '',
    refreshToken: ''
  }
  const salesmanTokens = {
    accessToken: '',
    refreshToken: ''
  }
  const profiles: {
    customer?: HydratedDocument<TUser & IUser>
    salesman?: HydratedDocument<TUser & IUser>
  } = {}

  const balances = {
    customer: {
      initial: 0,
      final: 0
    },
    salesman: {
      initial: 0,
      final: 0
    }
  }

  const articles: {
    first?: any
    second?: any
    third?: any
  } = {}

  let customerOrder: HydratedDocument<IOrder> | null = null

  describe('User registration and authentication', () => {
    it('should be able to create (sign up) a new customer', async () => {
      const response = await axios.post('/user/signup', newUsers.customer)
      expect(response.status).toBe(201)
    }),
      it('should be able to login a customer and get an access tokens', async () => {
        const keys = ['accessToken', 'refreshToken']
        const {
          data: { message }
        } = await axios.post('/user/login', {
          email: newUsers.customer.email,
          password: newUsers.customer.password
        })
        expect(Object.keys(message)).toEqual(keys)
        customerTokens.accessToken = message.accessToken
        customerTokens.refreshToken = message.refreshToken
      }),
      it('should be able to create (sign up) a new salesman', async () => {
        const response = await axios.post('/user/signup', newUsers.salesman)
        expect(response.status).toBe(201)
      }),
      it('should be able to login a salesman and get an access tokens', async () => {
        const keys = ['accessToken', 'refreshToken']
        const {
          data: { message }
        } = await axios.post('/user/login', {
          email: newUsers.salesman.email,
          password: newUsers.salesman.password
        })
        expect(Object.keys(message)).toEqual(keys)
        salesmanTokens.accessToken = message.accessToken
        salesmanTokens.refreshToken = message.refreshToken
      })
  }),
    describe('Salesman article creation', () => {
      it('salesman should be able to save a first new article', async () => {
        const response = await axios.post('/article', newArticles[0], {
          headers: {
            Authorization: `Bearer ${salesmanTokens.accessToken}`
          }
        })
        expect(response.status).toBe(201)
        expect(response.data.message).toHaveProperty('_id')
        expect(response.data.message).toHaveProperty('id')
        expect(response.data.message).toHaveProperty('title')
        expect(response.data.message).toHaveProperty('shortDescription')
        expect(response.data.message).toHaveProperty('createdAt')
        expect(response.data.message).toHaveProperty('updatedAt')
        expect(response.data.message).toHaveProperty('currencyId')
        expect(response.data.message).toHaveProperty('isVirtual')
        expect(response.data.message).toHaveProperty('isAvailable')
        expect(response.data.message).toHaveProperty('isDeleted')
        expect(response.data.message).toHaveProperty('qtyStock')
        expect(response.data.message).toHaveProperty('unity')
        expect(response.data.message).toHaveProperty('unitPrice')
        expect(response.data.message.sku).toEqual(newArticles[0].sku)
        expect(response.data.message.title).toEqual(newArticles[0].title)
        expect(response.data.message.shortDescription).toEqual(
          newArticles[0].shortDescription
        )
        expect(response.data.message.qtyStock).toEqual(newArticles[0].qtyStock)
        expect(response.data.message.unity).toEqual(newArticles[0].unity)

        articles.first = response.data.message
      }),
        it('salesman should be able to save a second new article', async () => {
          const response = await axios.post('/article', newArticles[1], {
            headers: {
              Authorization: `Bearer ${salesmanTokens.accessToken}`
            }
          })
          expect(response.status).toBe(201)
          expect(response.data.message).toHaveProperty('_id')
          expect(response.data.message).toHaveProperty('id')
          expect(response.data.message).toHaveProperty('title')
          expect(response.data.message).toHaveProperty('shortDescription')
          expect(response.data.message).toHaveProperty('createdAt')
          expect(response.data.message).toHaveProperty('updatedAt')
          expect(response.data.message).toHaveProperty('currencyId')
          expect(response.data.message).toHaveProperty('isVirtual')
          expect(response.data.message).toHaveProperty('isAvailable')
          expect(response.data.message).toHaveProperty('isDeleted')
          expect(response.data.message).toHaveProperty('qtyStock')
          expect(response.data.message).toHaveProperty('unity')
          expect(response.data.message).toHaveProperty('unitPrice')
          expect(response.data.message.sku).toEqual(newArticles[1].sku)
          expect(response.data.message.title).toEqual(newArticles[1].title)
          expect(response.data.message.shortDescription).toEqual(
            newArticles[1].shortDescription
          )
          expect(response.data.message.qtyStock).toEqual(
            newArticles[1].qtyStock
          )
          expect(response.data.message.unity).toEqual(newArticles[1].unity)

          articles.second = response.data.message
        }),
        it('salesman should be able to save a third new article', async () => {
          const response = await axios.post('/article', newArticles[2], {
            headers: {
              Authorization: `Bearer ${salesmanTokens.accessToken}`
            }
          })
          expect(response.status).toBe(201)
          expect(response.data.message).toHaveProperty('_id')
          expect(response.data.message).toHaveProperty('id')
          expect(response.data.message).toHaveProperty('title')
          expect(response.data.message).toHaveProperty('shortDescription')
          expect(response.data.message).toHaveProperty('createdAt')
          expect(response.data.message).toHaveProperty('updatedAt')
          expect(response.data.message).toHaveProperty('currencyId')
          expect(response.data.message).toHaveProperty('isVirtual')
          expect(response.data.message).toHaveProperty('isAvailable')
          expect(response.data.message).toHaveProperty('isDeleted')
          expect(response.data.message).toHaveProperty('qtyStock')
          expect(response.data.message).toHaveProperty('unity')
          expect(response.data.message).toHaveProperty('unitPrice')
          expect(response.data.message.sku).toEqual(newArticles[2].sku)
          expect(response.data.message.title).toEqual(newArticles[2].title)
          expect(response.data.message.shortDescription).toEqual(
            newArticles[2].shortDescription
          )
          expect(response.data.message.qtyStock).toEqual(
            newArticles[2].qtyStock
          )
          expect(response.data.message.unity).toEqual(newArticles[2].unity)

          articles.third = response.data.message
        })
    }),
    describe('Users profiles', () => {
      it('should be able to get customer profile data with access token', async () => {
        const response = await axios.get<{
          message: HydratedDocument<IUser>
        }>('/user/profile', {
          headers: {
            Authorization: `Bearer ${customerTokens.accessToken}`
          }
        })

        expect(response.status).toBe(200)
        expect(response.data.message).toHaveProperty('id')
        expect(response.data.message).toHaveProperty('firstName')
        expect(response.data.message).toHaveProperty('lastName')
        expect(response.data.message).toHaveProperty('email')
        expect(response.data.message).toHaveProperty('roleId')
        expect(response.data.message).toHaveProperty('createdAt')
        expect(response.data.message).toHaveProperty('updatedAt')
        profiles.customer = response.data.message
      }),
        it('should be able to get salesman profile data with access token', async () => {
          const response = await axios.get('/user/profile', {
            headers: {
              Authorization: `Bearer ${salesmanTokens.accessToken}`
            }
          })
          expect(response.status).toBe(200)
          expect(response.data.message).toHaveProperty('id')
          expect(response.data.message).toHaveProperty('firstName')
          expect(response.data.message).toHaveProperty('lastName')
          expect(response.data.message).toHaveProperty('email')
          expect(response.data.message).toHaveProperty('roleId')
          expect(response.data.message).toHaveProperty('createdAt')
          expect(response.data.message).toHaveProperty('updatedAt')
          profiles.salesman = response.data.message
        })
    }),
    describe('Users orders and transactions', () => {
      test('customer tries to bought an article without money, should be rejected', async () => {
        if (!profiles.salesman) throw new Error('Customer profile not found')
        if (!articles.first) throw new Error('First article not found')
        if (!articles.second) throw new Error('Second article not found')
        if (!articles.third) throw new Error('Third article not found')

        const response = await axios
          .post(
            '/order',
            {
              receiverId: profiles.salesman.id,
              details: [
                {
                  articleId: articles.first.id,
                  quantity: faker.random.numeric(1)
                },
                {
                  articleId: articles.second.id,
                  quantity: faker.random.numeric(1)
                },
                {
                  articleId: articles.third.id,
                  quantity: faker.random.numeric(1)
                }
              ]
            },
            {
              headers: {
                Authorization: `Bearer ${customerTokens.accessToken}`
              }
            }
          )
          .then(() => {
            throw new Error('Order should be rejected')
          })
          .catch(error => {
            return error.response
          })

        expect(response.status).toBe(400)
        expect(
          String(response.data.message).includes(
            `You don't have enough money to make this purchase.`
          )
        ).toBeTruthy()
      }),
        it('the customer should be able to transfer cash to himself', async () => {
          if (!profiles.customer)
            throw new Error('Customer profile is not defined')

          const response = await axios.post<{
            message: HydratedDocument<IUserTransactions>
          }>(
            `/transfer/user/${profiles.customer.id}`,
            { amount: newAmountToDeposit, receiverId: profiles.customer.id },
            {
              headers: {
                authorization: `Bearer ${customerTokens.accessToken}`
              }
            }
          )
          expect(response.status).toBe(201)
          expect(response.data.message.userId).toBe(profiles.customer._id)
          expect(Number(response.data.message.amount)).toBe(
            Number(newAmountToDeposit)
          )
          expect(response.data.message.status).toBe('paid')
          expect(response.data.message.entry).toBe('debit') // accounting double entry. The ownership of the money is transferred from the customer to the customer so the ecommerce is holding the customer's money

          balances.customer.initial = Number(response.data.message.amount)
        }),
        test('now the customer should be able to make a purchase', async () => {
          if (!profiles.salesman) throw new Error('Customer profile not found')
          if (!articles.first) throw new Error('First article not found')
          if (!articles.second) throw new Error('Second article not found')
          if (!articles.third) throw new Error('Third article not found')

          const response = await axios
            .post(
              '/order',
              {
                receiverId: profiles.salesman.id,
                details: [
                  {
                    articleId: articles.first.id,
                    quantity: faker.random.numeric(1)
                  },
                  {
                    articleId: articles.second.id,
                    quantity: faker.random.numeric(1)
                  },
                  {
                    articleId: articles.third.id,
                    quantity: faker.random.numeric(1)
                  }
                ]
              },
              {
                headers: {
                  Authorization: `Bearer ${customerTokens.accessToken}`
                }
              }
            )
            .catch(error => {
              return error.response
            })

          expect(response.status).toBe(201)
          expect(response.data.message).toHaveProperty('trackingNumber')
          expect(response.data.message).toHaveProperty('userId')
          expect(response.data.message).toHaveProperty('details')
          expect(response.data.message).toHaveProperty('createdAt')
          expect(response.data.message).toHaveProperty('updatedAt')
          expect(response.data.message).toHaveProperty('status')
          expect(response.data.message).toHaveProperty('total')
          expect(response.data.message).toHaveProperty('userTransactionId')
          expect(response.data.message).toHaveProperty('status')
          expect(response.data.message.status).toBe('completed')
          if (response.status === 201) {
            customerOrder = response.data.message

            balances.customer.final =
              Number(balances.customer.initial) -
              Number(response.data.message.total)
          }
        }),
        it('the salesman should be able to approve transaction', async () => {
          if (!profiles.salesman)
            throw new Error('Salesman profile is not defined')
          if (customerOrder === null)
            throw new Error('Customer order is not defined')

          const response = await axios.patch(
            `/transfer/verify/${profiles.salesman.secureToken}`,
            { _id: customerOrder.userTransactionId },
            {
              headers: {
                authorization: `Bearer ${salesmanTokens.accessToken}`
              }
            }
          )

          expect(response.status).toBe(200)
          expect(response.data.message).toHaveProperty('amount')
          expect(response.data.message).toHaveProperty('status')
          expect(response.data.message).toHaveProperty('id')
          expect(response.data.message).toHaveProperty('userId')
          expect(response.data.message).toHaveProperty('createdAt')
          expect(response.data.message).toHaveProperty('updatedAt')
          expect(response.data.message).toHaveProperty('entry')
          expect(response.data.message.status).toBe('paid')

          balances.salesman.final = Number(response.data.message.amount)
        }),
        test('verify balances with user transactions and variables', async () => {
          if (!profiles.salesman)
            throw new Error('Salesman profile is not defined')
          if (!profiles.customer)
            throw new Error('Customer profile is not defined')

          const salesmanResponse = await axios('/user/balance', {
            headers: {
              authorization: `Bearer ${salesmanTokens.accessToken}`
            }
          })

          const customerResponse = await axios('/user/balance', {
            headers: {
              authorization: `Bearer ${customerTokens.accessToken}`
            }
          })

          expect(salesmanResponse.status).toBe(200)
          expect(Number(salesmanResponse.data.message)).toBe(
            Number(balances.salesman.final)
          )

          expect(customerResponse.status).toBe(200)
          expect(Number(customerResponse.data.message)).toBe(
            Number(balances.customer.final)
          )

          console.debug(
            `API Salesman balance: ${salesmanResponse.data.message} | Customer balance: ${customerResponse.data.message}`,
            `Vars Salesman balance: ${balances.salesman.final} | Customer balance: ${balances.customer.final}`
          )
        })
    })
})
