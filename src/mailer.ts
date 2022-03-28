import nodemailer from 'nodemailer'
import { __dirname, mailInterface } from './index.js'

export interface attachmentInterface
{
    path: string
}

export async function sendMail (subject: string, msg: string, settings: mailInterface, attachments?: attachmentInterface[]): Promise<boolean>
{
    try
    {
        // create the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: settings.server,
            port: settings.port,
            secure: settings.port === 465 ? true : false,
            auth: {
                user: settings.username,
                pass: settings.password
            }
        })

        // send mail
        let info = await transporter.sendMail({
            from: settings.from,
            to: settings.to,
            subject: subject,
            text: msg,
            attachments: attachments ? attachments : {}
        })
        
        console.log(`updates: mail notification sent`)
        return true
    }
    catch (e)
    {
        console.error(`updates: mail notification failed with error "${e.message}"`)
        return false
    }
}