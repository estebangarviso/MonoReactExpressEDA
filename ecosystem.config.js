module.exports = {
  apps : [{
    name: "@demo/api-producer",
    script: "./apps/api-producer/src/index.js",
  }, {
     name: '@demo/worker-consumer',
     script: './apps/worker-consumer/src/index.js'
  }]
}