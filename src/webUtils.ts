import child_process from 'child_process'
import fs from 'graceful-fs'
import got from 'got'
import { gotScraping } from 'got-scraping'
import { Cookie, CookieJar } from 'tough-cookie'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
const exec = promisify(child_process.exec)
const pipeline = promisify(stream.pipeline)

export async function download (app: string, appConfig: appInterface): Promise<boolean> 
{
    // exchange url when scraping
    const downloadUrl = appConfig.downloadType == 'scrape' ? appConfig.scrapeDownloadUrl : appConfig.downloadUrl

    // check if specific tool is requested
    if (appConfig.downloadTool === 'curl') return downloadCurl(app, `${app}.${appConfig.downloadFileType}`, downloadUrl)
    if (appConfig.downloadTool === 'wget') return downloadWget(app, `${app}.${appConfig.downloadFileType}`, downloadUrl)

    // obtain cookies if applicable
    let cookies = undefined
    let cookieJar = new CookieJar()
    
    if (appConfig.cookieUrl)
    {
        const response  = await got(appConfig.cookieUrl)
        if (response.headers['set-cookie'] instanceof Array)
        {
            cookies = response.headers['set-cookie'].map(header => Cookie.parse(header))
        }
        else
        {
            cookies = [Cookie.parse(response.headers['set-cookie'])]
        }

        for (let cookie of cookies)
        {
            cookieJar.setCookieSync(cookie, downloadUrl)
        }
    }

    // create output dir & output
    if (!fs.existsSync(path.join(__dirname, 'tmp', `${app}`))) fs.mkdirSync(path.join(__dirname, 'tmp', `${app}`))
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${appConfig.downloadFileType}`)
    const fileWriterStream = fs.createWriteStream(outputPath)

    // download
    let options = cookies ? {cookieJar} : {}
    const downloadStream = got.stream(downloadUrl, options)

    try
    {
        await pipeline(downloadStream, fileWriterStream)
        console.log(`${app}: download successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: download failed with error "${e.message}"`)
        console.error(`${app}: trying to download with curl`)
        return downloadCurl(app, `${app}.${appConfig.downloadFileType}`, downloadUrl)
    }
}

export async function downloadCurl (app: string, downloadName:string, downloadUrl: string): Promise<boolean>
{
    // check if Homebrew's curl is installed
    let curlBin = '/usr/local/opt/curl/bin/curl'
    try
    {
        await fs.access(`${curlBin}`)
    }
    catch (e)
    {
        curlBin = '/usr/bin/curl'
    }

    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${downloadName}`)
    try
    {
        const output = await exec(`${curlBin} -LSs -o "${outputPath}" "${downloadUrl}"`)
        console.log(`${app}: downloadCurl successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: downloadCurl failed with error "${e.message}"`)
        throw e
    }
}

export async function downloadWget (app: string, downloadName:string, downloadUrl: string): Promise<boolean>
{
    // check if Homebrew's wget is installed
    let wgetBin = '/usr/local/bin/wget'
    try
    {
        await fs.access(`${wgetBin}`)
    }
    catch (e)
    {
        throw new Error('wget not installed')
    }

    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${downloadName}`)
    try
    {
        const output = await exec(`${wgetBin} -q -O "${outputPath}" "${downloadUrl}"`)
        console.log(`${app}: downloadWget successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: downloadWget failed with error "${e.message}"`)
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