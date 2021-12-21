import fs from 'graceful-fs'
import path from 'path'
import process from 'process'
import yaml from 'js-yaml'
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js'
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js'
import { updateHandlerPkg } from './updateHandlerPkg.js'
export const __dirname = process.cwd()

export interface appInterface
{
    appBundleIdentifier: string,
    appCodeRequirement: string,
    appName: string,
    appVersion: string,
    downloadType: string,
    downloadUrl?: string,
    downloadFileType: string,
    downloadVersionUrl: string,
    downloadVersionRegex: string,
    downloadGithub?: string,
    dmgFileType?: string,
    pkgChecksum: string,
    pkgName?: string,
    pkgSigned: boolean,
    pkgTarget?: string
}

export interface updateInterface
{
    appBundleIdentifier: string,
    appCodeRequirement: string,
    appName: string,
    appVersion: string,
    pkgChecksum: string,
    pkgSigned: boolean
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
                        if (configApps[app].dmgFileType)
                        {
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
                        }
                        else
                        {
                            console.error(`${app}: missing "dmgFileType" in confg`)
                        }
                        break
                    case 'pkg':
                        appUpdates.push(updateHandlerPkg(app, configApps[app], updates))
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
                            if (configApps[app].downloadFileType == 'app')
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
                    pkgChecksum: configApps[update].pkgChecksum,
                    pkgSigned: configApps[update].pkgSigned
                }
            }
        }
    }
    fs.writeFileSync(path.join(__dirname, 'updates.yaml'), yaml.dump(tenantUpdates, {quotingType: "'", forceQuotes: true, sortKeys: true}))
    fs.writeFileSync(path.join(__dirname, 'config-apps.yaml'), yaml.dump(configApps, {quotingType: "'", forceQuotes: true, sortKeys: true}))
    console.log('updated "config-apps.yaml"')
    console.log('updates published to "updates.yaml"')
}

main()