import server from './network/server'

const bootstrap = () => {
  return server.start()
}

void bootstrap()
