// Snippet uses the ioredis library, but other redis clients will also work
import { Cluster } from 'ioredis'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { formatUrl } from '@aws-sdk/util-format-url'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import {
  REDIS_URI,
  AWS_REGION,
  REDIS_CLUSTER_NAME,
  REDIS_CLUSTER_PORT,
  REDIS_CLUSTER_USERNAME,
  REDIS_CLUSTER_PASSWORD,
  REDIS_CLUSTER_ENDPOINT
} from '../../config/index.js'

/**
 * MemoryDB (and Elasticache) with Redis v7.0+ offer IAM authentication. In this mode, pass
 * the username with a presigned URL as the password. This function generates the presigned
 * URL, which acts as an authentication token. Note that this token expires after 15 minutes
 * and will need to be refreshed.
 *
 * Snippet assumes that cache parameters are included as environment variables. Note that
 * cache cluster name is distinct from endpoint.
 */

/**
 * Initialize the Redis client
 * @returns {Promise<string>}
 */
const getAuthToken = async () => {
  const signer = new SignatureV4({
    service: 'memorydb',
    region: AWS_REGION,
    credentials: fromNodeProviderChain(),
    sha256: Sha256
  })

  const protocol = 'https'

  const presigned = await signer.presign(
    {
      method: 'GET',
      protocol,
      hostname: REDIS_CLUSTER_NAME,
      path: '/',
      query: {
        Action: 'connect',
        User: REDIS_CLUSTER_USERNAME
      },
      headers: {
        host: REDIS_CLUSTER_NAME
      }
    },
    { expiresIn: 900 }
  )

  const token = formatUrl(presigned).replace(`${protocol}://`, '')

  return token
}

export default function () {
  return new Cluster(
    [
      {
        host: REDIS_CLUSTER_ENDPOINT,
        port: REDIS_CLUSTER_PORT
      }
    ],
    {
      // dnsLookup resolves an issue with TLS encryption and MemoryDB clusters
      // see https://github.com/redis/ioredis#special-note-aws-elasticache-clusters-with-tls
      dnsLookup: (address, callback) => callback(null, address),
      slotsRefreshInterval: 10000,
      showFriendlyErrorStack: true,
      slotsRefreshTimeout: 2000,
      redisOptions: {
        username: REDIS_CLUSTER_USERNAME,
        password: REDIS_CLUSTER_PASSWORD || void getAuthToken(),
        tls: true
      }
    }
  )
}
