import fs from 'graceful-fs'
import child_process from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { __dirname, appInterface, uploadInterface } from './index.js'
const exec = promisify(child_process.exec)
const fsAccess = promisify(fs.access)

export async function appBundleIdentifier (app: string, appName?: string): Promise<string>
{
    let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`, `Contents`, `Info.plist`)
    try
    {
        if (!await fsExists(inputPath, app))
        {
            let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`, `Contents`, `Info.plist`)
            if (!await fsExists(inputPath, app))
            {
                let inputPath = path.join(`/Application/${appName}`, `Contents`, `Info.plist`)
                if (!await fsExists(inputPath, app)) throw new Error('Path does not exist')
            }
        }
        const output = await exec(`sh ./src/appBundleIdentifier.sh "${inputPath}"`)
        console.log(`${app}: appBundleIdentifier successful`)
        return output.stdout.replace(/(\r\n|\n|\r)/gm,"")
    }
    catch (e)
    {
        console.error(`${app}: appBundleIdentifier failed with error "${e.message}"`)
        throw e
    }
    
}

export async function appCodeRequirement (app: string, appName?: string): Promise<string>
{
    let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`)
    try
    {
        if (!await fsExists(inputPath, app))
        {
            let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`)
            if (!await fsExists(inputPath, app))
            {
                let inputPath = path.join(`/Application/${appName}`)
                if (!await fsExists(inputPath, app)) throw new Error('Path does not exist')
            }
        }
        const output = await exec(`sh ./src/appCodeRequirement.sh "${inputPath}"`)
        console.log(`${app}: appCodeRequirement successful`)
        return output.stdout.replace(/(\r\n|\n|\r)/gm,"")
    }
    catch (e)
    {
        console.error(`${app}: appCodeRequirement failed with error "${e.message}"`)
        throw e
    }
    
}

export async function appRename (app: string, appName: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, appName)
    try
    {
        const output = await exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`)
        console.log(`${app}: appRename successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: appRename failed with error "${e.message}"`)
        throw e
    }
}

export async function appVersion (app: string, appName?: string): Promise<string>
{
    let inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`, `Contents`, `Info.plist`)
    try
    {
        if (!await fsExists(inputPath, app))
        {
            let inputPath = path.join(__dirname, 'tmp', `${app}`, `${appName}`, `Contents`, `Info.plist`)
            if (!await fsExists(inputPath, app))
            {
                let inputPath = path.join(`/Application/${appName}`, `Contents`, `Info.plist`)
                if (!await fsExists(inputPath, app)) throw new Error('Path does not exist')
            }
        }
        const output = await exec(`sh ./src/appVersion.sh "${inputPath}"`)
        console.log(`${app}: appVersion successful`)
        return output.stdout.replace(/(\r\n|\n|\r)/gm,"")
    }
    catch (e)
    {
        console.error(`${app}: appVersion failed with error "${e.message}"`)
        throw e
    }
    
}

export async function dmgExtractFile (app:string, downloadFileType: string, appName: string, dmgFileType: string, dmgFileName?: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`)
    const mountPoint = path.join(__dirname, 'mnt', `${app}`)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${dmgFileType}`)
    const fileName = dmgFileName && dmgFileName.length > 0 ? dmgFileName : appName

    try
    {
        // Apple Script works best with absolute paths
        await exec(`sh ./src/dmgExtractFile.sh "${inputPath}" "${mountPoint}" "${outputPath}" "${fileName}"`)
        console.log(`${app}: dmgExtractFile successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: dmgExtractFile failed with error "${e.message}"`)
        throw e
    }
}

export async function dmgInstallFile (app:string, downloadFileType: string, installCommand: string): Promise<boolean>
{
    const appTmpDir = path.join(__dirname, 'tmp', `${app}`)
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${downloadFileType}`)
    const mountPoint = path.join(__dirname, 'mnt', `${app}`)
    const installCmd = `${mountPoint}/${installCommand.replaceAll('<APPDIR>', appTmpDir)}`

    try
    {
        // Apple Script works best with absolute paths
        await exec(`sh ./src/dmgInstallFile.sh "${inputPath}" "${mountPoint}" "${installCmd}"`)
        console.log(`${app}: dmgInstallFile successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: dmgInstallFile failed with error "${e.message}"`)
        throw e
    }
}

export async function fileDelete (app: string, fileName: string, dir: string): Promise<boolean>
{
    if (dir=='tmp') dir=`tmp/${app}`
    const inputPath = path.join(__dirname, dir, fileName)
    try
    {
        const output = await exec(`sh ./src/fileDelete.sh "${inputPath}"`)
        console.log(`${app}: fileDelete successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: fileDelete failed with error "${e.message}"`)
        throw e
    }
}

export async function fileRename (app: string, oldName: string, newName: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${oldName}`)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${newName}`)
    try
    {
        const output = await exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`)
        console.log(`${app}: fileRename successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: fileRename failed with error "${e.message}"`)
        throw e
    }
}

export async function fsExists (path: string, app?:string): Promise<boolean> {  
    try
    {
        await fsAccess(path)
        return true
    } 
    catch (e)
    {
        //app ? console.error(`${app}: fsExists failed with error "${e.message}"`) : console.error(`fsExists failed with error "${e.message}"`)
        return false
    }
  }

export async function pkgChecksum (app:string): Promise<string>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    try
    {
        const output = await exec(`sh ./src/pkgChecksum.sh "${inputPath}"`)
        console.log(`${app}: pkgChecksum successful`)
        return output.stdout.replace(/(\r\n|\n|\r)/gm,"")
    }
    catch (e)
    {
        console.error(`${app}: pkgChecksum failed with error "${e.message}"`)
        throw e
    }
}

export async function pkgCreate (app: string, appName: string, pkgTarget: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, appName)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    try
    {
        const output = await exec(`sh ./src/pkgCreate.sh "${inputPath}" "${pkgTarget}" "${outputPath}"`)
        console.log(`${app}: pkgCreate successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgCreate failed with error "${e.message}"`)
        throw e
    }
}

export async function pkgExtractApp (app:string, appTargetPath: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.app`)
    try
    {
        // Apple Script works best with absolute paths
        const output = await exec(`sh ./src/pkgExtractApp.sh "${inputPath}" "${appTargetPath}" "${outputPath}"`)
        console.log(`${app}: pkgExtractApp successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgExtractApp failed with error "${e.message}"`)
        throw e
    }
}

export async function pkgFinalize (app:string, version: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    const outputPath = path.join(__dirname, 'pkgs', `${app}_${version}.pkg`)
    try
    {
        await exec(`sh ./src/appRename.sh "${inputPath}" "${outputPath}"`)
        console.log(`${app}: pkgFinalize successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgFinalize failed with error "${e.message}"`)
        throw e
    }
}

export async function pkgInstall (app:string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    try
    {
        await exec(`/usr/sbin/installer -target "/" -pkg "${inputPath}"`)
        console.log(`${app}: pkgInstall successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgInstall failed with error "${e.message}"`)
        throw e
    }
}

export async function pkgSigned (app:string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.pkg`)
    try
    {
        const output = await exec(`sh ./src/pkgSigned.sh "${inputPath}"`)
        console.log(`${app}: pkgSigned successful`)
        if (output.stdout.startsWith('not-signed')) return false
        return true
    }
    catch (e)
    {
        console.error(`${app}: pkgSigned failed with error "${e.message}"`)
        return false
    }
}

export async function quitSuspiciousPackage (): Promise<boolean>
{
    try
    {
        const output = await exec(`sh ./src/quitSuspiciousPackage.sh`)
        return true
    }
    catch (e)
    {
        console.error(`quitSuspiciousPackage failed with error "${e.message}"`)
        return false
    }
}

export async function uploadPkg (app:string, version:string, uploadConfigs: uploadInterface[]): Promise<boolean>
{
    let uploads = []
    const inputPath = path.join(__dirname, 'pkgs', `${app}_${version}.pkg`)

    for (let uploadConfig of uploadConfigs)
    {
        if (uploadConfig.username && uploadConfig.password)
        {
            uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --username '${uploadConfig.username}' --password '${uploadConfig.password}' --upload '${uploadConfig.server}' '${inputPath}'`))
        }
        else if (uploadConfig.username)
        {
            uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --username '${uploadConfig.username}' --upload '${uploadConfig.server}' '${inputPath}'`))
        }
        else
        {
            uploads.push(exec(`/usr/local/bin/duck --assumeyes --existing skip --upload '${uploadConfig.server}' '${inputPath}'`))
        }
    }
    try
    {
        // Wait for uploads to finish
        await Promise.all(uploads)
        console.log(`${app}: uploadPkg successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: uploadPkg failed with error "${e.message}"`)
        return false
    }
}

export async function zipExtractFile (app:string, appName: string, type: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.zip`)
    const extractPath = path.join(__dirname, 'tmp', `${app}`, `${app}`)
    const outputPath = path.join(__dirname, 'tmp', `${app}`, `${app}.${type}`)
    try
    {
        // Apple Script works best with absolute paths
        if (type=='app')
        {
            await exec(`sh ./src/zipAppExtractFile.sh "${inputPath}" "${extractPath}" "${outputPath}" "${appName}"`)
        }
        else
        {
            await exec(`sh ./src/zipPkgExtractFile.sh "${inputPath}" "${extractPath}" "${outputPath}"`)
        }       
        console.log(`${app}: zipExtractFile successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: zipExtractFile failed with error "${e.message}"`)
        throw e
    }
}