/**
 * @typedef {import('@aws-sdk/client-s3').S3ClientConfig} S3ClientConfig
 * @typedef {import('@aws-sdk/client-s3').S3Client} S3Client
 * @typedef {import('@aws-sdk/client-s3').PutObjectCommandInput} PutObjectCommandInput
 * @typedef {import('@aws-sdk/client-s3').GetObjectCommandInput} GetObjectCommandInput
 * @typedef {import('@aws-sdk/client-s3').HeadObjectCommandInput} HeadObjectCommandInput
 * @typedef {import('@aws-sdk/client-s3').UploadPartCommandInput} UploadPartCommandInput
 * @typedef {import('@aws-sdk/client-s3').CompleteMultipartUploadCommandInput} CompleteMultipartUploadCommandInput
 * @typedef {import('@aws-sdk/client-s3').CreateMultipartUploadCommandInput} CreateMultipartUploadCommandInput
 * @typedef {import('@aws-sdk/client-s3').AbortMultipartUploadCommandInput} AbortMultipartUploadCommandInput
 * @typedef {import('@aws-sdk/client-s3').ListPartsCommandInput} ListPartsCommandInput
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3'
import { RequestHandler } from './node-http-handler.js'
import moment from 'moment'
import { REGION, ACCESS_KEY_ID, SECRET_ACCESS_KEY, S3_BUCKET } from '../config/index.js'
import { nanoid } from 'nanoid'
import { RedisProvider } from '../database/redis/provider.js'

export const getS3FilePath = filename => {
  return decodeURIComponent(filename.replace(/\+/g, ' '))
}

export const buildS3FilePath = (filename, auto = false) => {
  filename = auto ? `${nanoid()}` : getS3FilePath(filename)

  return `${filename}`
}

// Amazon S3 multipart upload limits
// see https://docs.aws.amazon.com/es_es/AmazonS3/latest/userguide/qfacts.html
const MIN_MULTIPART_SIZE = 5_242_880 // 5 MiB
const MAX_MULTIPART_SIZE = 5_368_709_120 * 1_024 // 5 TiB
const PARTS_COUNT_LIMIT = 10_000 // 10,000 parts
const MULTIPART_SIZE_GAP = 1_048_576 // 1 MiB

export class AwsS3 {
  constructor() {
    this.client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
      },
      requestHandler: new RequestHandler()
    })
    this.redis = new RedisProvider('s3')
  }

  /**
   * @param {string} filename
   * @param {Buffer} buffer
   * @param {string} contentType
   */
  async uploadFile({ filename, buffer, contentType }) {
    const Key = buildS3FilePath(filename)
    const Bucket = S3_BUCKET

    /**
     * @type {PutObjectCommandInput}
     */
    const params = {
      Bucket,
      Key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        uploadedAt: moment().toISOString()
      },
      ACL: 'public-read'
    }

    return this.client.send(new PutObjectCommand(params))
  }

  async getFile({ filename, start, end }) {
    const Key = getS3FilePath(filename)
    const Bucket = S3_BUCKET

    /**
     * @type {GetObjectCommandInput}
     */
    const params = {
      Bucket,
      Key
    }

    if (start && end) params.Range = `bytes=${start}-${end}`

    return this.client.send(new GetObjectCommand(params))
  }

  /**
   * Check if a file exists in an S3 bucket
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async fileExists(filename) {
    try {
      const Key = getS3FilePath(filename)
      const Bucket = S3_BUCKET

      /**
       * @type {HeadObjectCommandInput}
       */
      const params = {
        Bucket,
        Key
      }

      const result = await this.client.send(new HeadObjectCommand(params))

      if (!result.$metadata.httpStatusCode === 200) return false

      return true
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404)
        return false // File not found
      else if (error.$metadata?.httpStatusCode === 403) {
        console.error('Permission denied', error)

        return false
      } else {
        console.error('Error checking if the file exists', error)
        throw error
      }
    }
  }

  /**
   * Upload a file to an S3 bucket using multipart upload
   * @see https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html#sdksupportformpu
   * @example ```js
   * const size = 1_048_576 * 10; // 10 MB
   * const partSize = 1_048_576; // 1 MB
   * const partCount = 10; // 10 parts
   *
   * const size = 1_048_576 * 100;
   * const partSize = 1_048_576; // 1 MB
   * const partCount = 100; // 100 parts
   *
   * const size = 1_048_576 * 1_000; // 1 GB
   * const partSize = 1_048_576; // 1 MB
   * const partCount = 1_000; // 1000 parts
   *
   * const size = 1_048_576 * 10_000; // 10 GB
   * const partSize = 1_048_576; // 1 MB
   * const partCount = 10_000; // 10000 parts
   *
   * const size = 1_048_576 * 100_000; // 100 GB
   * const partSize = 1_048_576 * 10; // 10 MB
   * const partCount = 10_000; // 10000 parts
   *
   * const size = 1_048_576 * 1_000_000; // 1 TB
   * const partSize = 1_048_576 * 100; // 100 MB
   * const partCount = 10_000; // 10000 parts
   *
   * const size = 1_048_576 * 10_000_000; // 10 TB
   * const partSize = 1_048_576 * 1_000; // 1 GB
   * const partCount = 10_000; // 10000 parts
   * ```
   * @param {string} filename
   * @param {number} size
   * @param {Buffer} buffer
   * @param {Record<string, string>} metadata
   */
  async uploadMultipart(filename, size, buffer) {
    let uploadId
    try {
      const key = decodeURIComponent(filename.replace(/\+/g, ' '))
      const Bucket = S3_BUCKET
      /**
       * @type {CreateMultipartUploadCommandInput}
       */
      const input = {
        Bucket,
        Key: key
      }

      const command = new CreateMultipartUploadCommand(input)

      const data = await this.client.send(command)
      console.info('File uploaded successfully', JSON.stringify(data))

      uploadId = data.UploadId
      if (!uploadId) throw new Error('The upload id is not defined')
      // Save the uploadId in the database to be able to resume the upload if it fails for some reason (abort the upload, timeout, network error, etc)
      this.redis.set(key, uploadId)
      // Optimize part size and part count to upload the file in multipart
      let partSize = MULTIPART_SIZE_GAP
      let partCount = Math.ceil(size / partSize)

      while (partCount > PARTS_COUNT_LIMIT) {
        partSize =
          partSize < MAX_MULTIPART_SIZE
            ? partSize + MULTIPART_SIZE_GAP
            : MAX_MULTIPART_SIZE
        partCount = Math.ceil(size / partSize)
      }

      if (partSize > MAX_MULTIPART_SIZE && partCount > PARTS_COUNT_LIMIT)
        throw new Error(
          `The file is too large to upload. The maximum size is ${MAX_MULTIPART_SIZE} bytes (5TB) and the maximum number of parts is ${PARTS_COUNT_LIMIT}.\n` +
            'Please, try to upload a smaller file or use a multipart upload with multiple threads.\n' +
            `- File name: ${filename}.\n` +
            `- File size: ${size} bytes.\n` +
            `- Last part size: ${partSize} bytes and the number of parts is ${partCount}.`
        )

      // Use a promise all to upload the parts in parallel
      const parts = []
      const partPromises = []

      for (let i = 0; i < partCount; i++) {
        const start = i * partSize
        const end = Math.min(size, start + partSize)

        /**
         * @type {UploadPartCommandInput}
         */
        const partParams = {
          Body: buffer.subarray(start, end),
          Bucket,
          Key: key,
          PartNumber: i + 1,
          UploadId: uploadId
        }

        partPromises.push(this.client.send(new UploadPartCommand(partParams)))
      }

      const partResults = await Promise.all(partPromises)

      for (let i = 0; i < partCount; i++)
        parts[i] = {
          ETag: partResults[i].ETag,
          PartNumber: i + 1
        }

      /**
       * @type {CompleteMultipartUploadCommandInput}
       */
      const inputComplete = {
        Bucket,
        Key: key,
        MultipartUpload: {
          Parts: parts
        },
        UploadId: uploadId
      }

      const commandComplete = new CompleteMultipartUploadCommand(inputComplete)

      const dataComplete = await this.client.send(commandComplete)
      console.info('File uploaded successfully', JSON.stringify(dataComplete))
      // Delete the uploadId from the database
      this.redis.delete(key)

      return {
        region: REGION,
        key,
        bucket: Bucket,
        data: dataComplete
      }
    } catch (error) {
      console.error('Error uploading the file', error)
      if (uploadId)
        try {
          await this.abortMultipartUpload(filename, uploadId)
        } catch (abortError) {
          console.error('Error aborting the multipart upload', abortError)
        }

      throw error
    }
  }

  /**
   * Abort an ongoing multipart upload
   * @param {string} filename
   */
  async abortMultipartUpload(filename, incommingUploadId) {
    let uploadId
    try {
      const key = decodeURIComponent(filename.replace(/\+/g, ' '))
      const Bucket = S3_BUCKET
      if (incommingUploadId) uploadId = incommingUploadId
      else {
        uploadId = await this.redis.get(key)
        if (!uploadId) throw new Error('The upload id is not defined')
      }

      /**
       * @type {AbortMultipartUploadCommandInput}
       */
      const input = {
        Bucket,
        Key: key,
        UploadId: uploadId
      }

      const command = new AbortMultipartUploadCommand(input)

      const data = await this.client.send(command)
      console.info(
        'Multipart upload aborted successfully',
        JSON.stringify(data)
      )
      // Delete the uploadId from the database
      this.redis.delete(key)

      return data
    } catch (error) {
      console.error('Error aborting the multipart upload', error)
      throw error
    }
  }

  /**
   * Resume an ongoing multipart upload
   * @param {string} filename
   * @param {number} size
   * @param {Buffer} buffer
   */
  async resumeMultipartUpload(filename, size, buffer) {
    try {
      const key = decodeURIComponent(filename.replace(/\+/g, ' '))
      const Bucket = S3_BUCKET
      const uploadId = await this.redis.get(key)

      if (!uploadId) throw new Error('The upload id is not defined')

      /**
       * @type {ListPartsCommandInput}
       */
      const listPartParams = {
        Bucket,
        Key: key,
        UploadId: uploadId
      }

      // Reupload last part if the upload was interrupted
      const listPartCommand = await this.client.send(
        new ListPartsCommand(listPartParams)
      )

      const parts = listPartCommand.Parts
      const partCount = parts.length
      const partSize = parts[0].Size

      // Upload the last part
      const lastPart = parts[partCount - 1]
      const lastPartNumber = lastPart.PartNumber
      const lastPartSize = lastPart.Size
      const lastPartStart = (lastPartNumber - 1) * partSize
      const lastPartEnd = Math.min(size, lastPartStart + lastPartSize)

      /**
       * @type {UploadPartCommandInput}
       */
      const partParams = {
        Body: buffer.subarray(lastPartStart, lastPartEnd),
        Bucket,
        Key: key,
        PartNumber: lastPartNumber,
        UploadId: uploadId
      }
      // Use a promise all to upload the parts in parallel
      const partPromises = []
      const partResult = this.client.send(new UploadPartCommand(partParams))
      partPromises.push(partResult)

      // Check if there are missing parts
      if (partCount < Math.ceil(size / partSize))
        for (let i = partCount; i < Math.ceil(size / partSize); i++) {
          const start = i * partSize
          const end = Math.min(size, start + partSize)

          /**
           * @type {UploadPartCommandInput}
           */
          const partParams = {
            Body: buffer.subarray(start, end),
            Bucket,
            Key: key,
            PartNumber: i + 1,
            UploadId: uploadId
          }

          const partResult = this.client.send(new UploadPartCommand(partParams))
          partPromises.push(partResult)
        }

      const partResults = await Promise.all(partPromises)

      for (let i = 0; i < partResults.length; i++)
        parts[i] = {
          ETag: partResults[i].ETag,
          PartNumber: i + 1
        }

      /**
       * @type {CompleteMultipartUploadCommandInput}
       */
      const inputComplete = {
        Bucket,
        Key: key,
        MultipartUpload: {
          Parts: parts
        },
        UploadId: uploadId
      }

      const commandComplete = new CompleteMultipartUploadCommand(inputComplete)

      const dataComplete = await this.client.send(commandComplete)
      console.info('File uploaded successfully', JSON.stringify(dataComplete))
      // Delete the uploadId from the database
      this.redis.delete(key)

      return {
        region: REGION,
        key,
        bucket: Bucket
      }
    } catch (error) {
      console.error('Error resuming the multipart upload', error)
      throw error
    }
  }

  /**
   * Write a stream to an S3 bucket
   * @param {string} key
   * @param {import('stream').Writable} stream
   * @returns {Promise<void>}
   */
  async writeStreamToS3(key, stream) {
    const oneMB = 1024 * 1024
    const isComplete = ({ end, length }) => end === length - 1
    /**
     * @param {string | undefined} contentRange
     */
    const getRangeAndLength = contentRange => {
      const [range, length] = contentRange.split('/')
      const [start, end] = range.split('-')

      return {
        start: parseInt(start),
        end: parseInt(end),
        length: parseInt(length)
      }
    }

    let rangeAndLength = { start: -1, end: -1, length: -1 }
    while (!isComplete(rangeAndLength)) {
      const { end } = rangeAndLength
      const nextRange = { start: end + 1, end: end + oneMB }

      console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`)

      const { ContentRange, Body } = await this.getFile({
        key,
        ...nextRange
      })

      stream.write(await Body.transformToByteArray())
      rangeAndLength = getRangeAndLength(ContentRange)
    }
  }
}
