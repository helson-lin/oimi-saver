#!/usr/bin/env node
const yargs = require('yargs');
const colors = require('colors')
const { hideBin } = require('yargs/helpers');
const pkg = require('../package.json');
const {uploadFile} = require('./qiniu')

hideBin(process.argv);
const argv = process.argv.slice(2);
const context = {
    ltVersion: pkg.version
}
const cli = yargs()
cli
    .usage('Usage: saver [command] <options>') // 用法
    .demandCommand(1, 'A command is required. Pass --help to see all available commands') // 无command提示
    .recommendCommands()
    .fail((err, msg) => {
        console.log('Error', err);
    })
    .strict() // 严格模式
    .alias('h', 'help')
    .alias('v', 'version')
    .alias("v", "version")
    .wrap(cli.terminalWidth()) // 实现文字两侧顶格显示
    .epilogue('oimi saver')
    .options({
        debug: {
            type: 'boolean',
            describe: 'Bootstrap debug mode',
            alias: 'd',
        }
    })
    .group(['debug'], 'Dev Options')
    .command('upload [file]', ': upload file', (yargs) => {
        yargs.option('file', {
            type: 'string',
            describe: 'file',
            alias: 'f'
        })
        yargs.option('name', {
            type: 'string',
            describe: 'file name',
            alias: 'n'
        })
    }, (argv) => {
        if (!argv.file) console.log(colors.red('【saver】 upload need a file'))
        uploadFile(argv.file, argv.name)
    })
    .parse(argv, context);