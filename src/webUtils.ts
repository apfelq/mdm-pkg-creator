import fs from 'graceful-fs'
import got from 'got'
import { gotScraping } from 'got-scraping'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
const pipeline = promisify(stream.pipeline)

export async function download (app: string, appConfig: appInterface): Promise<boolean> 
{
    //console.log(url)
    let downloadUrl = appConfig.downloadUrl
    if (appConfig.downloadType == 'scrape') downloadUrl = appConfig.scrapeDownloadUrl
    if (!fs.existsSync(path.join(__dirname, 'tmp', `${app}`))) fs.mkdirSync(path.join(__dirname, 'tmp', `${app}`))
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${appConfig.downloadFileType}`)
    const downloadStream = got.stream(downloadUrl)
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

export async function scrape (app: string, url: string): Promise<string> 
{
    //console.log(url)
    const headerGeneratorOptions = {
        browsers: [
            {
                name: 'firefox',
                minVersion: 91,
                maxVersion: 95
            }
        ],
        devices: ['desktop'],
        locales: ['en'],
        operatingSystems: ['macos'],
    }

    try
    {
        const response = await gotScraping.get(url)
        console.log(`${app}: scrape successful`)
        return response.body
    }
    catch (e)
    {
        console.error(`${app}: scrape failed with error "${e.message}"`)
        throw e
    }
}