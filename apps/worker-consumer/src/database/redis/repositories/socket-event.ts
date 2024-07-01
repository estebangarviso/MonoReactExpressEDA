// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import httpErrors from 'http-errors'
import { ISocketEvent } from '../models/event'
import {
  pubEvent,
  subChannel,
  onMessage,
  unsubChannel
} from '../queries/pubsub'

export default class SocketEventRepository {
  private _channelName?: string
  private _eventName?: string
  private _data?: any

  constructor(channelName?: string, options?: Partial<ISocketEvent>) {
    const { eventName, data } = options || {}
    this._channelName = channelName
    this._eventName = eventName
    this._data = data
  }

  async pub() {
    if (!this._channelName)
      throw new httpErrors.BadRequest('Missing required field: channelName')
    if (!this._data)
      throw new httpErrors.BadRequest('Missing required field: data')

    return await pubEvent(this._channelName, JSON.stringify(this._data))
  }

  sub() {
    if (!this._channelName)
      throw new httpErrors.BadRequest('Missing required field: channelName')

    return subChannel(this._channelName)
  }

  consume(callback: (channel: string, message: string) => void) {
    if (!this._eventName)
      throw new httpErrors.BadRequest('Missing required field: channelName')

    return onMessage(this._eventName, callback)
  }

  unsub() {
    if (!this._channelName)
      throw new httpErrors.BadRequest('Missing required field: channelName')

    return unsubChannel(this._channelName)
  }
}
