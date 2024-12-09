import child_process from 'child_process'
import fs from 'graceful-fs'
import got from 'got'
import { gotScraping } from 'got-scraping'
import { Cookie, CookieJar } from 'tough-cookie'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
import { getPackedSettings } from 'http2'
const exec = promisify(child_process.exec)
const pipeline = promisify(stream.pipeline)
let gotOptions: {https: {ciphers: string}, http2: boolean, cookieJar?: CookieJar, url?: string} = {
    https: {ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384'},
    http2: true
}

export async function download (app: string, appConfig: appInterface): Promise<boolean> 
{
    // exchange url when scraping
    const downloadUrl = appConfig.downloadType == 'scrape' ? appConfig.scrapeDownloadUrl : appConfig.downloadUrl

    // create output dir
    if (!fs.existsSync(path.join(__dirname, 'tmp', `${app}`))) fs.mkdirSync(path.join(__dirname, 'tmp', `${app}`))

    // remove nested prefix
    const downloadFileType = appConfig.downloadFileType.replace('nested-', '')

    // check if specific tool is requested
    if (appConfig.downloadTool === 'curl') return downloadCurl(app, `${app}.${downloadFileType}`, downloadUrl)
    if (appConfig.downloadTool === 'wget') return downloadWget(app, `${app}.${downloadFileType}`, downloadUrl)

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

    // create output
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`)
    const fileWriterStream = fs.createWriteStream(outputPath)

    // download
    gotOptions['url'] = downloadUrl
    if (cookies) gotOptions['cookieJar'] = cookieJar
    const downloadStream = got.stream(gotOptions)

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
        return downloadCurl(app, `${app}.${downloadFileType}`, downloadUrl)
    }
}

export async function downloadCurl (app: string, downloadName:string, downloadUrl: string): Promise<boolean>
{
    // check if Homebrew's curl is installed
    let curlBin = '/opt/homebrew/opt/curl/bin/curl'
    try
    {
        await fs.promises.realpath(`${curlBin}`)
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
        await fs.promises.realpath(`${wgetBin}`)
    }
    catch (e)
    {
        console.error(`${app}: downloadWget failed with error "${e.message}"`)
        throw e
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

export async function scrape (app: string, appConfig: appInterface): Promise<string> 
{
    //console.log(appConfig.scrapeUrlurl)
    if (appConfig.scrapeFormRaw)
    {
        // check if Homebrew's curl is installed
        let curlBin = '/opt/homebrew/opt/curl/bin/curl'
        try
        {
            await fs.promises.realpath(`${curlBin}`)
        }
        catch (e)
        {
            try
            {
                curlBin = '/usr/local/opt/curl/bin/curl'
                await fs.promises.realpath(`${curlBin}`)
            }
            catch (e)
            {
                curlBin = '/usr/bin/curl'
            }
        }

        const curlCmd = `${curlBin} --data-binary '${appConfig.scrapeFormRaw}' '${appConfig.scrapeUrl}'`
        
        try
        {
            const output = await exec(curlCmd)
            console.log(`${app}: scrape successful`)
            return output.stdout
        }
        catch (e)
        {
            console.error(`${app}: scrape failed with error "${e.message}"`)
            throw e
        }
    }
    else
    {
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
        gotOptions['url'] = appConfig.scrapeUrl
    
        if (appConfig.scrapeForm)
        {
            gotOptions['form'] = appConfig.scrapeForm
        }
    
        try
        {
            let response
            if (appConfig.scrapeForm) response = await gotScraping.post(gotOptions)
            else response = await gotScraping.get(gotOptions)
            console.log(`${app}: scrape successful`)
            return response.body
        }
        catch (e)
        {
            console.error(`${app}: scrape failed with error "${e.message}"`)
            throw e
        }
    }
}