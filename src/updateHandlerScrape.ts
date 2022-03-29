import { scrape } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js'
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js'
import { updateHandlerPkg } from './updateHandlerPkg.js'
import { updateHandlerZipApp } from './updateHandlerZipApp.js'
import { updateHandlerNestedDmg } from './updateHandlerNestedDmg'


export async function updateHandlerScrape (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // get website body and scrape version
        const body = await scrape(app, appConfig.scrapeUrl)
        //const version = body.match(new RegExp(appConfig.scrapeRegex))[1]
        const downloadUrl = body.replace(new RegExp(appConfig.scrapeRegex, 'gm'), appConfig.downloadUrl)

        //if (!version) throw 'version not found, check scrapeUrl & scrapeRegex'
        if (!downloadUrl) throw 'version not found, check scrapeUrl & scrapeRegex'

        //const downloadUrl = appConfig.downloadUrl.replaceAll('%VERSION%', version)

        if ( appConfig.scrapeDownloadUrl == downloadUrl )
        {
            console.log(`${app}: updateHandlerScrape no update`)
            return false
        }

        appConfig.scrapeDownloadUrl = downloadUrl

        // push to appropriate handler
        let handler = false
        switch (appConfig.downloadFileType)
        {
            case 'dmg':
                if (!appConfig.dmgFileType)
                {
                    console.error(`${app}: missing "dmgFileType" in confg`)
                    break
                }
                if (appConfig.dmgFileType == 'app')
                {
                    handler = await updateHandlerDmgApp(app, appConfig, updates)
                }
                else if (appConfig.dmgFileType == 'pkg')
                {
                    handler = await updateHandlerDmgPkg(app, appConfig, updates)
                }
                break

            case 'pkg':
                handler = await updateHandlerPkg(app, appConfig, updates)
                break

            case 'zip':
                if (!appConfig.zipFileType)
                {
                    console.error(`${app}: missing "zipFileType" in confg`)
                    break
                }
                if (appConfig.zipFileType == 'app')
                {
                    handler = await updateHandlerZipApp(app, appConfig, updates)
                }
                break

            case 'nested-dmg':
                if (!appConfig.nestedDmgFileType)
                {
                    console.error(`${app}: missing "nestedDmgFileType" in confg`)
                    break
                }
                if (appConfig.nestedDmgFileType == 'dmg')
                {
                    handler = await updateHandlerNestedDmg(app, appConfig, updates)
                }
                break
        }
        if (!handler)
        {
            console.log(`${app}: updateHandlerScrape no update`)
            return false
        }
        console.log(`${app}: updateHandlerScrape update available`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerScrape failed with error "${e.message}"`)
        return false
    }
    
}