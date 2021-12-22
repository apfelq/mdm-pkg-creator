import fs from 'graceful-fs'
import child_process from 'child_process'
import path from 'path'
import { promisify } from 'util'
import { __dirname, appInterface } from './index.js'
const exec = promisify(child_process.exec)

export async function appBundleIdentifier (app: string): Promise<string>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.app`, `Contents`, `Info.plist`)
    try
    {
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

export async function appCodeRequirement (app: string): Promise<string>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.app`)
    try
    {
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
    const inputPath = path.join(__dirname, 'tmp', `${app}.app`)
    const outputPath = path.join(__dirname, 'tmp', appName)
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

export async function appVersion (app: string): Promise<string>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.app`, `Contents`, `Info.plist`)
    try
    {
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

export async function dmgExtractFile (app:string, appName: string, type: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.dmg`)
    const mountPoint = path.join(__dirname, 'mnt', `${app}`)
    const outputPath = path.join(__dirname, 'tmp', `${app}.${type}`)
    try
    {
        // Apple Script works best with absolute paths
        await exec(`sh ./src/dmgExtractFile.sh "${inputPath}" "${mountPoint}" "${outputPath}" "${appName}"`)
        console.log(`${app}: dmgExtractFile successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: dmgExtractFile failed with error "${e.message}"`)
        throw e
    }
}

export async function fileDelete (app: string, fileName: string, dir: string): Promise<boolean>
{
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

export async function pkgChecksum (app:string): Promise<string>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`)
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
    const inputPath = path.join(__dirname, 'tmp', appName)
    const outputPath = path.join(__dirname, 'tmp', `${app}.pkg`)
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
    const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`)
    const outputPath = path.join(__dirname, 'tmp', `${app}.app`)
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
    const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`)
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

export async function pkgSigned (app:string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.pkg`)
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

export async function zipExtractFile (app:string, appName: string, type: string): Promise<boolean>
{
    const inputPath = path.join(__dirname, 'tmp', `${app}.zip`)
    const extractPath = path.join(__dirname, 'tmp', `${app}`)
    const outputPath = path.join(__dirname, 'tmp', `${app}.${type}`)
    try
    {
        // Apple Script works best with absolute paths
        await exec(`sh ./src/zipExtractFile.sh "${inputPath}" "${extractPath}" "${outputPath}" "${appName}"`)
        console.log(`${app}: zipExtractFile successful`)
        return true
    }
    catch (e)
    {
        console.error(`${app}: zipExtractFile failed with error "${e.message}"`)
        throw e
    }
}