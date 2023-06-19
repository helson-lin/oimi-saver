const qiniu = require('qiniu');
const os = require('os');
const fs = require('fs');
const fse = require('fs-extra')
const path = require('path');
const colors = require('colors')

const baseConfig = {
    accessKey: '',
    secretKey: '',
    bucket: '',
    domain: '',
    zone: '',
}

const zoneMap = {
    huadong: qiniu.zone.Zone_z0,
    huabei: qiniu.zone.Zone_z1,
    huanan: qiniu.zone.Zone_z2,
    beimei: qiniu.zone.Zone_na0,
    asiz: qiniu.zone.Zone_as0,
}

const homedir = os.homedir();
const basePath = path.join(homedir, '/oimiSaver/config.json')


const uploadFile = async (filePath, filename) => {
    const isRes = await getConfigFile()
    if (!isRes) await syncConfig()
    const data = await getConfig()
    const { accessKey, secretKey, bucket, domain, zone } = JSON.parse(data)
    if (!secretKey || !accessKey || !bucket || !zone) {
        console.log(colors.red('【saver】 请检查配置文件: ' + basePath))
        return
    }
    const fileFullPath = fileIsExist(filePath)
    // console.log(data, fileFullPath)
    if (!fileFullPath) {
        console.log(colors.red('【saver】没有找到该文件'))
        return
    }
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const config = new qiniu.conf.Config();
    config.zone = zoneMap[zone];
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
    const key = filename || path.basename(fileFullPath);
    const token = putPolicy.uploadToken(mac);
    const formUploader = new qiniu.form_up.FormUploader(config);
    const extra = new qiniu.form_up.PutExtra();
    const ret = formUploader.putFile(token, key, filePath, extra, (err, respBody, respInfo) => {
        if (err) {
            throw err;
        }
        if (respInfo.statusCode == 200) {
            console.log(colors.green('【saver】上传成功, 文件地址: ' + domain + '/' + respBody.key));
        } else {
            console.log(colors.red('【saver】上传失败'));
        }
    });
}

const syncConfig = () => {
    fse.ensureFileSync(basePath)
    fse.writeFileSync(basePath, JSON.stringify(baseConfig))
}

const getConfigFile = () => fse.pathExistsSync(basePath)

const getConfig = async () => await fse.readFileSync(basePath, 'utf-8')

const fileIsExist = (filename) => {
    const fileFullPathMb = [path.join(process.cwd(), filename), filename]
    const filePath = fileFullPathMb.find(_file => fse.pathExistsSync(_file))
    if (!filePath) return null
    return filePath
}
module.exports = { uploadFile, syncConfig }
