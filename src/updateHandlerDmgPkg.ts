import fs from 'graceful-fs'
import path from 'path'
import process from 'process'
import { promisify } from 'util'
import { appHelperInfo } from './appHelpers.js'
import { download } from './download.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo, pkgHelperExtractApp } from './pkgHelpers.js'
import { dmgExtractFile, fileDelete, pkgFinalize } from './utils.js'
const unlink = promisify(fs.unlink)

export async function updateHandlerDmgPkg (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download pkg
        await download(app, `${app}.dmg`, appConfig.downloadUrl)

        // mount dmg
        const pkgName = appConfig.pkgName ? appConfig.pkgName : appConfig.appName.replace('.app', '.pkg')
        await dmgExtractFile(app, pkgName, 'pkg')

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