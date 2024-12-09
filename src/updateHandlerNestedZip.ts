import { fileDelete, zipExtractFile } from './utils.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js'
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js'


export async function updateHandlerNestedZip (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download dmg
        await download(app, appConfig)

        // extract app from zip
        await zipExtractFile(app, appConfig.nestedZipName, appConfig.nestedZipFileType)

        // delete downloaded zip
        //await fileDelete(app, `${app}.${appConfig.downloadFileType}`, 'tmp')

        // push to appropriate handler
        let handler = false
        switch (appConfig.nestedZipFileType)
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
        }
        if (!handler)
        {
            console.log(`${app}: updateHandlerNestedZip no update`)
            return false
        }
        console.log(`${app}: updateHandlerNestedZip update available`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerNestedZip failed with error "${e.message}"`)
        return false
    }
    
}