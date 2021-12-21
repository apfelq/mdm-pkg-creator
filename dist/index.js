var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'graceful-fs';
import path from 'path';
import process from 'process';
import yaml from 'js-yaml';
import { updateHandlerDmgApp } from './updateHandlerDmgApp.js';
import { updateHandlerDmgPkg } from './updateHandlerDmgPkg.js';
import { updateHandlerPkg } from './updateHandlerPkg.js';
export const __dirname = process.cwd();
function importYaml(fileName) {
    try {
        return yaml.load(fs.readFileSync(`${fileName}.yaml`, 'utf8'));
    }
    catch (e) {
        console.log(e);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let configApps = importYaml('config-apps');
        const configTenants = importYaml('config-tenants');
        try {
            if (!fs.existsSync('mnt'))
                fs.mkdirSync('mnt');
            if (!fs.existsSync('pkgs'))
                fs.mkdirSync('pkgs');
            if (!fs.existsSync('tmp'))
                fs.mkdirSync('tmp');
        }
        catch (e) {
            console.error(e.message);
        }
        let appUpdates = [];
        const apps = Object.keys(configApps);
        const updates = [];
        for (let app of apps) {
            switch (configApps[app].downloadType) {
                case 'direct':
                    switch (configApps[app].downloadFileType) {
                        case 'dmg':
                            if (configApps[app].dmgFileType) {
                                if (configApps[app].dmgFileType == 'app') {
                                    appUpdates.push(updateHandlerDmgApp(app, configApps[app], updates));
                                }
                                else if (configApps[app].dmgFileType == 'pkg') {
                                    appUpdates.push(updateHandlerDmgPkg(app, configApps[app], updates));
                                }
                                else {
                                    console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].dmgFileType}"`);
                                    console.error(`${app}: verify your config and/or contact developer`);
                                }
                            }
                            else {
                                console.error(`${app}: missing "dmgFileType" in confg`);
                            }
                            break;
                        case 'pkg':
                            appUpdates.push(updateHandlerPkg(app, configApps[app], updates));
                            break;
                        default:
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`);
                            console.error(`${app}: verify your config and/or contact developer`);
                            break;
                    }
                    break;
                case 'github':
                    switch (configApps[app].downloadFileType) {
                        case 'dmg':
                            if (configApps[app].dmgFileType) {
                                if (configApps[app].downloadFileType == 'app') {
                                }
                                else if (configApps[app].dmgFileType == 'pkg') {
                                }
                                else {
                                    console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}_${configApps[app].downloadFileType}"`);
                                    console.error(`${app}: verify your config and/or contact developer`);
                                    continue;
                                }
                            }
                            else {
                                console.error(`${app}: missing "dmgFileType" in confg`);
                                continue;
                            }
                            break;
                        case 'pkg':
                            break;
                        default:
                            console.error(`${app}: no updateHandler for "${configApps[app].downloadType}_${configApps[app].downloadFileType}"`);
                            console.error(`${app}: verify your config and/or contact developer`);
                            break;
                    }
                    break;
                default:
                    console.error(`${app}: no updateHandler for "${configApps[app].downloadType}"`);
                    console.error(`${app}: verify your config and/or contact developer`);
                    break;
            }
        }
        yield Promise.all(appUpdates);
        updates.sort();
        const tenants = Object.keys(configTenants);
        let tenantUpdates = {};
        for (let tenant of tenants) {
            for (let update of updates) {
                if (configTenants[tenant].indexOf(update) > -1) {
                    if (!tenantUpdates[tenant])
                        tenantUpdates[tenant] = {};
                    tenantUpdates[tenant][update] = {
                        appBundleIdentifier: configApps[update].appBundleIdentifier,
                        appCodeRequirement: configApps[update].appCodeRequirement,
                        appName: configApps[update].appName,
                        appVersion: configApps[update].appVersion,
                        pkgChecksum: configApps[update].pkgChecksum,
                        pkgSigned: configApps[update].pkgSigned
                    };
                }
            }
        }
        fs.writeFileSync(path.join(__dirname, 'updates.yaml'), yaml.dump(tenantUpdates, { quotingType: "'", forceQuotes: true, sortKeys: true }));
        fs.writeFileSync(path.join(__dirname, 'config-apps.yaml'), yaml.dump(configApps, { quotingType: "'", forceQuotes: true, sortKeys: true }));
        console.log('updated "config-apps.yaml"');
        console.log('updates published to "updates.yaml"');
    });
}
main();
