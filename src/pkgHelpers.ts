import fs from 'graceful-fs'
import path from 'path'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
import { pkgChecksum, pkgExtractApp, pkgSigned } from './utils.js'
const unlink = promisify(fs.unlink)

export async function pkgHelperInfo (app: string, appConfig: appInterface): Promise<boolean>
{
    try
    {
        // check checksum
        const checksum = await pkgChecksum(app)

        // checksum same: delete pkg and return
        if (checksum == appConfig.pkgChecksum)
        {
            // delete pkg
            await unlink(path.join(__dirname, `tmp`, `${app}.pkg`))
            console.log(`${app}: no update available`)
            return false
        }

        appConfig.pkgChecksum = checksum

        // check signing
        appConfig.pkgSigned = await pkgSigned(app)

        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgHelperInfo failed with error "${e.message}"`)
        throw e
    }
    
}

export async function pkgHelperExtractApp (app: string, appConfig: appInterface): Promise<boolean>
{
    try
    {
        // extract app from pkg
        const pkgTarget = appConfig.pkgTarget ? appConfig.pkgTarget : `/Applications` 
        const pkgTargetApp = path.join(pkgTarget, appConfig.appName)
        await pkgExtractApp(app, pkgTargetApp)

        console.log(`${app}: pkgHelperExtractApp successful`)

        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgHelperExtractApp failed with error "${e.message}"`)
        return false
    }
    
}