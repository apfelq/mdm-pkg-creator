import { appHelperInfo } from './appHelpers.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js'
import { fileDelete, pkgFinalize, pkgInstall } from './utils.js'

export async function updateHandlerPkg (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download pkg
        await download(app, appConfig)

        // get pkg info
        if (!await pkgHelperInfo(app, appConfig)) return false

        if (appConfig.pkgInstall)
        {
            pkgInstall(app)
        }
        else
        {
            // extract app from pkg
            if (!await pkgHelperExtractApp(app, appConfig)) throw ''
        }
        
        // get app info
        if (!await appHelperInfo(app, appConfig) && !appConfig.pkgChecksumVersion)
        {
            console.log(`${app}: updateHandlerPkg no update available`)
            return false
        }

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