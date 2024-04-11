import fs from 'graceful-fs'
import path from 'path'
import { __dirname, appInterface } from './index.js'
import { appBundleIdentifier, appCodeRequirement, appVersion } from './utils.js'

export async function appHelperInfo (app: string, appConfig: appInterface): Promise<boolean>
{
    try
    {
        // get bundle id
        const bundleIdentifier = await appBundleIdentifier(app, appConfig.appName)
        appConfig.appBundleIdentifier = bundleIdentifier

        // get codesignature
        const codeRequirement = await appCodeRequirement(app, appConfig.appName)
        appConfig.appCodeRequirement = codeRequirement

        // get version
        const version = await appVersion(app, appConfig.appName)

        console.log(`${app}: appHelperInfo successful`)

        if (version == appConfig.appVersion) return false

        appConfig.appVersion = version
        return true
    }
    catch (e)
    {
        console.error(`${app}: appHelperInfo failed with error "${e.message}"`)
        throw e
    }
    
}