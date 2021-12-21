import fs from 'graceful-fs'
import path from 'path'
import { promisify } from 'util'
import { appHelperInfo } from './appHelpers.js'
import { download } from './download.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo } from './pkgHelpers.js'
import { appRename, dmgExtractFile, fileDelete, pkgCreate, pkgFinalize } from './utils.js'
const unlink = promisify(fs.unlink)

export async function updateHandlerDmgApp (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download dmg
        await download(app, `${app}.dmg`, appConfig.downloadUrl)

        // extract app from dmg
        await dmgExtractFile(app, appConfig.appName, 'app')

        // get app info
        if (!await appHelperInfo(app, appConfig))
        {
            console.log(`${app}: updateHandlerDmgApp no update available`)
            // delete extracted app
            await fileDelete(app, appConfig.appName, 'tmp')
            await fileDelete(app, `${app}.dmg`, `tmp`)
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
        await fileDelete(app, appConfig.appName, 'tmp')
        await fileDelete(app, `${app}.dmg`, `tmp`)

        console.log(`${app}: updateHandlerDmgApp update available`)
        updates.push(app)
        return true
    }
    catch (e)
    {
        console.error(`${app}: updateHandlerDmgApp failed with error "${e.message}"`)
        return false
    }
    
}