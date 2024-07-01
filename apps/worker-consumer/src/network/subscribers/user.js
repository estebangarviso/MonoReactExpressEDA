// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PDF_CHANNEL, PDF_QUEUE } from '@demo/common';
import PDFDocument from 'pdfkit'
import UserRepository from '../../database/redis/repositories/user.js'
import SocketEventRepository from '../../database/redis/repositories/socket-event.js'
import fs from 'fs'
import { ROLES_LIST } from '../../constants/role.js'
import { PDFGenerationStatus } from '@demo/common';
import path from 'path'
import { PDFS_DIR } from '../../constants/paths.js'

/**
 * Subscribe that receive a message from RabbitMQ and create a PDF file
 */
export const subscribeUserPdf = async (rabbitmq) => {
  await rabbitmq.createQueue(PDF_QUEUE)
  await rabbitmq.subscribeQueue(PDF_QUEUE, async msg => {
    return new Promise(async (resolve, reject) => {
      console.debug('Received message subscribeUserPdf:', msg)
      const {
        idTask,
        details: { userId }
      } = JSON.parse(msg)

      console.log(`Creating PDF for user ${userId} > task: ${idTask}`)

      // get user info
      const userRepository = new UserRepository({ id: userId })
      const user = await userRepository.getByID()

      if (!user) {
        console.error(`User not found: ${userId}`)

        return reject();
      }

      // check if user pdf already exists
      const newPdfPath = path.join(PDFS_DIR, `${user.id}.pdf`)
      if (fs.existsSync(newPdfPath)) {
        console.log(`PDF already exists for user ${user.id}`)
        // save event to notify user that pdf is ready
        const successData = {
          userId,
          state: PDFGenerationStatus.READY
        }
        const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
          data: successData,
          eventName: idTask
        })

        await socketEventRepository.pub()

        return resolve();
      }

      // transform user info
      const roleName = ROLES_LIST.find(role => role.id === user.roleId)?.name
      const age =
        new Date().getFullYear() - new Date(user.birthDate).getFullYear()

      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const stream = fs.createWriteStream(newPdfPath)
      doc.pipe(stream)

      // title
      doc.fontSize(25).text('User Information', { align: 'center' })

      // user info
      doc.fontSize(15).text(`Name: ${user.firstName} ${user.lastName}`)
      doc.fontSize(15).text(`Age: ${age}`)
      doc.fontSize(15).text(`Email: ${user.email}`)
      doc.fontSize(15).text(`Role: ${roleName}`)

      // end and save
      doc.end()

      // close stream
      stream.on('finish', async () => {
        console.log(`PDF created for user ${user.id}`)

        try {
          // save event to notify user that pdf is ready
          const successData = {
            userId,
            state: PDFGenerationStatus.READY
          }
          const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
            data: successData,
            eventName: idTask
          })

          await socketEventRepository.pub()
        } catch (error) {
          console.error(`Error saving event for user ${user.id}:`, error)

          return reject();
        }

        resolve()
      })

      stream.on('error', async err => {
        console.error(`Error creating PDF for user ${user.id}:`, err)

        try {
          // save event to notify user that pdf failed
          const failedData = {
            userId,
            state: PDFGenerationStatus.FAILED
          }
          const socketEventRepository = new SocketEventRepository(PDF_CHANNEL, {
            data: failedData,
            eventName: idTask
          })

          await socketEventRepository.pub()
        } catch (error) {
          console.error(`Error saving event for user ${user.id}:`, error)
        }

        reject()
      })
    });
  })
}
