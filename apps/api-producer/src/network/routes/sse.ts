// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response, Router } from 'express'
import SocketEventRepository from '../../database/redis/repositories/socket-event'
import { PDF_CHANNEL } from '@demo/common'
import { HttpStatusCode } from 'axios'
// import { ALLOWED_ORIGINS } from 'config'

const SSERouter: Router = Router()

SSERouter.route(`/v1/sse/pdf`).get(
  async (req, res): Promise<void | Response> => {
    if (req.headers.accept !== 'text/event-stream')
      return res.sendStatus(HttpStatusCode.NotFound)
    // if (ALLOWED_ORIGINS && !ALLOWED_ORIGINS.includes(req.headers.origin ?? ''))
    //   return res.sendStatus(HttpStatusCode.Forbidden)

    // disable timeout
    req.socket.setTimeout(0)

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      // 'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Origin': '*',
      Connection: 'keep-alive'
    })
    // client reconnect interval 5s if the connection drops
    res.write(`retry: 5000\n`)
    res.flushHeaders()

    const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
      eventName: 'message'
    })
    const channelNumber = (await socketEventRepository.sub()) as number

    console.log(`Subscribed to channel: ${channelNumber}`)

    socketEventRepository.consume((channel, message) => {
      console.log(`Consume GET sse/pdf: ${message} from channel: ${channel}`)

      res.write('retry: 5000\n')
      res.write(`event: ${channel}\n`)
      res.write(`data: ${message}\n\n`)
      res.flush()
    })

    // send headers for event-stream connection
    res.write('\n')
    res.flush()
    // TODO: unsubcribe from redis when the connection is closed
    res.on('close', () => {
      console.log('Connection closed')
      void socketEventRepository.unsub()
    })
  }
)

export default SSERouter
