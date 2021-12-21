import fs from 'graceful-fs'
import got from 'got'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
const pipeline = promisify(stream.pipeline)

export async function download (app: string, filename: string, url: string): Promise<boolean> 
{
    //console.log(url)
    const outputPath = path.join(__dirname, 'tmp', filename)
    const downloadStream = got.stream(url)
    const fileWriterStream = fs.createWriteStream(outputPath)

    try
    {
        await pipeline(downloadStream, fileWriterStream)
        console.log(`${app}: download successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: download failed with error "${e.message}"`)
        throw e
    }
}