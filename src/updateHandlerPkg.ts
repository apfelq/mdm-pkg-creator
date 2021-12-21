import { appHelperInfo } from './appHelpers.js'
import { download } from './download.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js'
import { fileDelete, pkgFinalize } from './utils.js'

export async function updateHandlerPkg (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download pkg
        await download(app, `${app}.pkg`, appConfig.downloadUrl)

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

        console.log(`${app}: updateHandlerPkg update available`)
        updates.push(app)
        return true
    }
    catch (e)
    {
        console.error(`${app}: update failed`)
        return false
    }
    
}