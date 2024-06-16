import { appHelperInfo } from './appHelpers.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo } from './pkgHelpers.js'
import { appRename, fileDelete, pkgCreate, pkgFinalize, zipExtractFile } from './utils.js'

export async function updateHandlerZipApp (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download zip
        await download(app, appConfig)

        // extract app from zip
        await zipExtractFile(app, appConfig.appName, 'app')

        // get app info
        if (!await appHelperInfo(app, appConfig) && !appConfig.pkgChecksumVersion)
        {
            console.log(`${app}: updateHandlerZipApp no update available`)
            return false
        }

        // rename app
        if (!await appRename(app, appConfig.appName)) throw ''

        //create pkg
        const pkgTarget = appConfig.pkgTarget ? appConfig.pkgTarget : `/Applications`
        await pkgCreate(app, appConfig.appName, pkgTarget)
   
        // get pkg info
        if (!await pkgHelperInfo(app, appConfig)) throw ''

        // finalize pkg
        await pkgFinalize(app, appConfig.appVersion)

        // delete extracted app
        await fileDelete(app, appConfig.appName, `tmp`)
        await fileDelete(app, `${app}.zip`, `tmp`)

        console.log(`${app}: updateHandlerZipApp update available`)
        updates.push(app)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerZipApp failed with error "${e.message}"`)
        return false
    }
    
}