import { appHelperInfo } from './appHelpers.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js'
import { dmgExtractFile, fileDelete, pkgFinalize } from './utils.js'

export async function updateHandlerDmgPkg (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download dmg
        await download(app, appConfig)

        // mount dmg
        if (!appConfig.pkgName)
        {
            console.error(`${app}: no pkgName in config`)
            return false
        }
        await dmgExtractFile(app, appConfig.downloadFileType, appConfig.pkgName, appConfig.dmgFileType)

        // get pkg info
        if (!await pkgHelperInfo(app, appConfig)) throw ''

        // extract app from pkg
        if (!await pkgHelperExtractApp(app, appConfig)) throw ''

        // get app info
        if (!await appHelperInfo(app, appConfig)) throw ''
        
        // finalize pkg
        await pkgFinalize(app, appConfig.appVersion)

        // unmount & delete extracted app
        await fileDelete(app, `${app}.app`, `tmp`)
        await fileDelete(app, `${app}.dmg`, `tmp`)

        console.log(`${app}: updateHandlerDmgPkg update available`)
        updates.push(app)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerDmgPkg failed with error "${e.message}"`)
        return false
    }
    
}