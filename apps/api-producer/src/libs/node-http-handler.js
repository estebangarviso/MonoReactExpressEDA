import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { inspect } from 'util'

export class RequestHandler extends NodeHttpHandler {
  async handle(request, { abortSignal }) {
    const promise = super.handle(request, { abortSignal })

    return promise.then(response => {
      const body = response.response.body
      ;(async () => {
        const bodyType = typeof body
        const resolved = await Promise.resolve(body)
        console.info(`AWS Request Inspection: ${inspect(resolved)}`)
      })()

      return response
    })
  }
}
