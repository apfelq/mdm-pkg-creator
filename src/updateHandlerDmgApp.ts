import { appHelperInfo } from './appHelpers.js'
import { download } from './webUtils.js'
import { __dirname, appInterface } from './index.js'
import { pkgHelperInfo } from './pkgHelpers.js'
import { appRename, dmgExtractFile, dmgInstallFile, fileDelete, pkgCreate, pkgFinalize } from './utils.js'

export async function updateHandlerDmgApp (app: string, appConfig: appInterface, updates: string[]): Promise<boolean>
{
    try
    {
        // download dmg
        if (!appConfig.downloadFileType.startsWith('nested')) await download(app, appConfig)

        // extract app from dmg
        let fileType = appConfig.downloadFileType
        switch (appConfig.downloadFileType)
        {
            case 'nested-dmg':
                fileType = appConfig.nestedDmgFileType
                break
            case 'nested-zip':
                fileType = appConfig.nestedZipFileType
                break
            default:
        }

        const fileName = appConfig.dmgFileName ? appConfig.dmgFileName : ''
        if (appConfig.dmgInstallCommand)
        {
            await dmgInstallFile(app, fileType, appConfig.dmgInstallCommand)
        }
        else
        {
            await dmgExtractFile(app, fileType, appConfig.appName, appConfig.dmgFileType, fileName)
        }
        

        // get app info
        if (!await appHelperInfo(app, appConfig) && !appConfig.pkgChecksumVersion)
        {
            console.log(`${app}: updateHandlerDmgApp no update available`)
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