import fs from 'graceful-fs'
import path from 'path'
import process from 'process'
import yaml from 'js-yaml'
import { sendMail } from './mailer.js'
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js'
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js'
import { updateHandlerPkg } from './updateHandlerPkg.js'
import { updateHandlerScrape } from './updateHandlerScrape.js'
import { updateHandlerZipApp } from './updateHandlerZipApp.js'
import { updateHandlerNestedDmg } from './updateHandlerNestedDmg.js'
import { quitSuspiciousPackage, uploadPkg } from './utils.js'
export const __dirname = process.cwd()

export interface appInterface
{
    additionalInfo?: {
        preInstall?: string[],
        postInstall?: string[]
    }
    appBundleIdentifier: string,
    appCodeRequirement: string,
    appName: string,
    appVersion: string,
    cookieUrl?: string,
    downloadType: 'direct' | 'github' | 'scrape',
    downloadUrl?: string,
    downloadFileType: 'dmg' | 'pkg' | 'zip' | 'nested-dmg',
    downloadGithub?: string,
    downloadTool?: 'curl' | 'wget',
    dmgFileName?: string,
    dmgFileType?: string,
    nestedDmgFileType?: 'dmg',
    nestedDmgName?: string,
    pkgChecksum: string,
    pkgName?: string,
    pkgSigned: boolean,
    pkgTarget?: string,
    scrapeDownloadUrl?: string,
    scrapeUrl?: string,
    scrapeRegex?: string,
    zipFileType?: 'app'
}
export interface mailInterface
{
    server: string,
    port: number,
    from: string,
    to: string,
    username: string,
    password: string
}
export interface updateInterface
{
    additionalInfo?: {
        preInstall?: string[],
        postInstall?: string[]
    }
    appBundleIdentifier: string,
    appCodeRequirement: string,
    appName: string,
    appVersion: string,
    cdn: string[],
    pkgChecksum: string,
    pkgSigned: boolean
}

export interface uploadInterface
{
    server: string,
    username?: string,
    password?: string
}

function importYaml (fileName: string): any
{
    try {
        return yaml.load(fs.readFileSync(`${fileName}.yaml`, 'utf8'))
    } catch (e) {
        console.log(e)
    }
}

async function main ()
{

    // import config
    let config: {cdn: string[], mail?: mailInterface, uploads?: uploadInterface[], tls?: {ciphers?: string}} = importYaml('config')
    let configApps: {[propName: string]: appInterface} = importYaml('config-apps')
    const configTenants: {[propName: string]: string[]} = importYaml('config-tenants')

    // create output dirs
    try
    {
        if (!fs.existsSync('mnt')) fs.mkdirSync('mnt')
        if (!fs.existsSync('pkgs')) fs.mkdirSync('pkgs')
        if (!fs.existsSync('tmp')) fs.mkdirSync('tmp')
    } 
    catch (e) 
    {
        console.error(e.message)
    }

    // create promise array
    let appUpdates: Promise<boolean>[] = []

    // iterate through apps
    const apps: string[] = Object.keys(configApps)
    const updates: string[] = []

    for (let app of apps)
    {
        
        switch (configApps[app].downloadType)
        {
            case 'direct':

                switch (configApps[app].downloadFileType)
                {
                    case 'dmg':
                        if (!configApps[app].dmgFileType)
                        {
                            console.error(`${app}: missing "dmgFileType" in confg`)
                            break
                        }
                        if (configApps[app].dmgFileType == 'app')
                        {
                            appUpdates.push(updateHandlerDmgApp(app, configApps[app], updates))
                        }
                        else if (configApps[app].dmgFileType == 'pkg')
                        {
                            appUpdates.push(updateHandlerDmgPkg(app, configApps[app], updates))
                        }
                        else
                        {
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].dmgFileType}"`)
                            console.error(`${app}: verify your config and/or contact developer`)
                        }
                        
                        break

                    case 'pkg':
                        appUpdates.push(updateHandlerPkg(app, configApps[app], updates))
                        break

                    case 'zip':
                        if (!configApps[app].zipFileType)
                        {
                            console.error(`${app}: missing "zipFileType" in confg`)
                            break
                        }
                        if (configApps[app].zipFileType == 'app')
                        {
                            appUpdates.push(updateHandlerZipApp(app, configApps[app], updates))
                        }
                        else
                        {
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].zipFileType}"`)
                            console.error(`${app}: verify your config and/or contact developer`)
                        }
                        break

                    case 'nested-dmg':
                        if (!configApps[app].nestedDmgFileType)
                        {
                            console.error(`${app}: missing "nestedDmgFileType" in confg`)
                            break
                        }
                        if (configApps[app].nestedDmgFileType == 'dmg')
                        {
                            appUpdates.push(updateHandlerNestedDmg(app, configApps[app], updates))
                        }
                        else
                        {
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].nestedDmgFileType}"`)
                            console.error(`${app}: verify your config and/or contact developer`)
                        }
                        
                        break

                    default:
                        console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`)
                        console.error(`${app}: verify your config and/or contact developer`)
                        break
                }
                break

            case 'github':

                switch (configApps[app].downloadFileType)
                {
                    case 'dmg':
                        if (configApps[app].dmgFileType)
                        {
                            if (configApps[app].dmgFileType == 'app')
                            {
                                //appUpdates.push(updateHandlerDmgApp(app, configApps[app], updates))
                            }
                            else if (configApps[app].dmgFileType == 'pkg')
                            {
                                //appUpdates.push(updateHandlerDmgPkg(app, configApps[app], updates))
                            }
                            else
                            {
                                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].downloadFileType}"`)
                                console.error(`${app}: verify your config and/or contact developer`)
                                continue
                            }
                        }
                        else
                        {
                            console.error(`${app}: missing "dmgFileType" in confg`)
                            continue
                        }
                        break
                    case 'pkg':
                        //appUpdates.push(updateHandlerPkg(app, configApps[app], updates))
                        break
                    default:
                        console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`)
                        console.error(`${app}: verify your config and/or contact developer`)
                        break
                }
                break

            case 'scrape':
                appUpdates.push(updateHandlerScrape(app, configApps[app], updates))
                break
            
            default:
                console.error(`${app}: no updateHandler for "${configApps[app].downloadType}"`)
                console.error(`${app}: verify your config and/or contact developer`)
                break
        }

    }

    // wait for all updateHandler to finish
    await Promise.all(appUpdates)

    // create update file by tenant
    updates.sort()
    const tenants: string[] = Object.keys(configTenants)
    let tenantUpdates: {[propName: string]: {[propName: string]: updateInterface}} = {}
    for (let tenant of tenants)
    {
        for (let update of updates)
        {
            if (configTenants[tenant].indexOf(update)>-1)
            {
                if (!tenantUpdates[tenant]) tenantUpdates[tenant] = {}
                tenantUpdates[tenant][update] = {
                    appBundleIdentifier: configApps[update].appBundleIdentifier,
                    appCodeRequirement: configApps[update].appCodeRequirement,
                    appName: configApps[update].appName,
                    appVersion: configApps[update].appVersion,
                    cdn: config.cdn.map(server => encodeURI(`${server}${update}_${configApps[update].appVersion}.pkg`)),
                    pkgChecksum: configApps[update].pkgChecksum,
                    pkgSigned: configApps[update].pkgSigned
                }
                if (configApps[update].additionalInfo)
                {
                    tenantUpdates[tenant][update].additionalInfo = {}
                    if (configApps[update].additionalInfo.preInstall) tenantUpdates[tenant][update].additionalInfo.preInstall = configApps[update].additionalInfo.preInstall
                    if (configApps[update].additionalInfo.postInstall) tenantUpdates[tenant][update].additionalInfo.postInstall = configApps[update].additionalInfo.postInstall
                }
            }
        }
    }
    fs.writeFileSync(path.join(__dirname, 'updates.yaml'), yaml.dump(tenantUpdates, {quotingType: "'", forceQuotes: true, sortKeys: true}))
    fs.writeFileSync(path.join(__dirname, 'config-apps.yaml'), yaml.dump(configApps, {quotingType: "'", forceQuotes: true, sortKeys: true}))
    console.log('updated "config-apps.yaml"')
    console.log('updates published to "updates.yaml"')

    // quit Suspicious Package
    quitSuspiciousPackage()

    // upload updates
    if (config.uploads)
    {
        let uploads = []
        for (let update of updates)
        {
            uploads.push(uploadPkg(update, configApps[update].appVersion, config.uploads))
        }
        await Promise.all(uploads)
    }

    // mail updates file to recipient
    if (config.mail)
    {
        // check if any updates
        if (updates.length>0)
        {
            await sendMail('MDM-PKG-CREATOR: new updates!', `MDM-PKG-CREATOR uploaded the following new PKGs:\r\n\r\n${updates.toString()}\r\n\r\nFor tenant updates and log refer to attachment.`, config.mail, [{path: path.join(__dirname, 'updates.yaml')},{path: path.join(__dirname, 'mdm-pkg-creator.log')}])
        }
        else
        {
            await sendMail('MDM-PKG-CREATOR: no updates!', `MDM-PKG-CREATOR did not detect any updates.\r\n\r\nLog attached.`, config.mail, [{path: path.join(__dirname, 'mdm-pkg-creator.log')}])
        }
    }
    
}

main()