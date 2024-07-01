import server from './network/server.js'

const bootstrap = () => {
  return server.start();
}

void bootstrap()
