import { appHelperInfo } from './appHelpers.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js'
import { fileDelete, pkgFinalize, zipExtractFile } from './utils.js'

export async function updateHandlerZipPkg (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download zip
        await download(app, appConfig)

        // extract pkg from zip
        await zipExtractFile(app, appConfig.appName, 'pkg')

        // get pkg info
        if (!await pkgHelperInfo(app, appConfig)) return false

        // extract app from pkg
        if (!await pkgHelperExtractApp(app, appConfig)) throw ''
        
        // get app info
        if (!await appHelperInfo(app, appConfig)) throw ''

        // finalize pkg
        await pkgFinalize(app, appConfig.appVersion)

        // delete extracted app
        await fileDelete(app, `${app}.app`, `tmp`)

        console.log(`${app}: updateHandlerZipPkg update available`)
        updates.push(app)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerZipPkg failed with error "${e.message}"`)
        return false
    }
    
}