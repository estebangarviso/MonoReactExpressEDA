export interface ISocketEvent<D = string | Record<string, any>> {
  eventName: string
  data: D
}
