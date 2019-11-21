#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const npm = require('npm');
const cnpm = require('cnpm/lib/config.js');
const extend = require('extend');
const ini = require('ini');

const registries = require('./registries.json');
const PKG = require('./package.json');

const NRMRC = path.join(process.env.HOME, '.nrmrc');
const CNPMRC = path.join(process.env.HOME, '.cnpmrc') || cnpm.userconfig;

const FIELD_REGISTRY = 'registry';
const REGISTRY_ATTRS = [FIELD_REGISTRY];
const FIELD_IS_CURRENT = 'is-current';
const IGNORED_ATTRS = [FIELD_IS_CURRENT];

program
    .version(PKG.version);

program
    .command('ls')
    .description('List all the registries')
    .action(onList);

program
    .command('use <registry>')
    .description('Change registry to registry')
    .action(onUse);

program
    .command('help', { isDefault: true })
    .description('Print this help \n if you want to clear the CNRM configuration when uninstall you can execute "npm uninstall cnrm -g -C or npm uninstall cnrm -g --clean"')
    .action(function () {
        program.outputHelp();
    });

program
    .parse(process.argv);


if (process.argv.length === 2) {
    program.outputHelp();
}

/*//////////////// cmd methods /////////////////*/
function setCustomRegistry (config, cbk) {
  for (let name in config) {
      if (name in registries) {
          delete config[name].registry;
          delete config[name].home;
      }
  }
  fs.writeFile(NRMRC, ini.stringify(config), cbk)
}

function config (attrArray, registry, index = 0) {
  return new Promise((resolve, reject) => {
      const attr = attrArray[index];
      npm.load({userconfig: CNPMRC}, function (err, conf) {
          const command = registry.hasOwnProperty(attr) ? ['set', attr, String(registry[attr])] : ['delete', attr];
          npm.commands.config(command, function (err, data) {
              return err ? reject(err) : resolve(index + 1);
          });
      });
  }).then(next => {
      if (next < attrArray.length) {
          return config(attrArray, registry, next);
      } else {
          return Promise.resolve();
      }
  });
}

function onUse (name) {
  var allRegistries = getAllRegistry();
  if (allRegistries.hasOwnProperty(name)) {
      getCurrentRegistry(function (cur) {
          let currentRegistry, item;
          for (let key of Object.keys(allRegistries)) {
              item = allRegistries[key];
              if (equalsIgnoreCase(item.registry, cur)) {
                  currentRegistry = item;
                  break;
              }
          }
          var registry = allRegistries[name];
          let attrs = [].concat(REGISTRY_ATTRS).concat();
          for (let attr in Object.assign({}, currentRegistry, registry)) {
              if (!REGISTRY_ATTRS.includes(attr) && !IGNORED_ATTRS.includes(attr)) {
                  attrs.push(attr);
              }
          }

          config(attrs, registry).then(() => {
              console.log('                        ');
              const newR = npm.config.get(FIELD_REGISTRY);
              var customRegistries = getCustomRegistry();
              Object.keys(customRegistries).forEach(key => {
                  delete customRegistries[key][FIELD_IS_CURRENT];
              });
              if (customRegistries.hasOwnProperty(name) && (name in registries || customRegistries[name].registry === registry.registry)) {
                  registry[FIELD_IS_CURRENT] = true;
                  customRegistries[name] = registry;
              }
              // Do not update .nrmrc
              // setCustomRegistry(customRegistries);
              printMsg(['', '   Registry has been set to: ' + newR, '']);
          }).catch(err => {
              exit(err);
          });          
      });
  } else {
      printMsg(['', '   Not find registry: ' + name, '']);
  }
}

function onList () {
  getCurrentRegistry(function (cur) {
      var info = [''];
      var allRegistries = getAllRegistry();
      const keys = Object.keys(allRegistries);
      const len = Math.max(...keys.map(key => key.length)) + 3;
      Object.keys(allRegistries).forEach(function (key) {
          var item = allRegistries[key];
          var prefix = equalsIgnoreCase(item.registry, cur) ? '* ' : '  ';
          info.push(prefix + key + line(key, len) + item.registry);
      });

      info.push('');
      printMsg(info);
  });
}

/*//////////////// helper methods /////////////////*/
/*
 * get current registry
 */
function getCurrentRegistry (cbk) {
  npm.load({userconfig: CNPMRC}, function (err, conf) {
      if (err) return exit(err);
      cbk(npm.config.get(FIELD_REGISTRY));
  });
}

function getINIInfo (path) {
  return fs.existsSync(path) ? ini.parse(fs.readFileSync(path, 'utf-8')) : {};
}

function getCustomRegistry () {
  return getINIInfo(NRMRC)
}

function getCNPMInfo () {
  return getINIInfo(CNPMRC)
}

function getAllRegistry () {
  const custom = getCustomRegistry();
  const all = extend({}, registries, custom);
  for (let name in registries) {
      if (name in custom) {
          all[name] = extend({}, custom[name], registries[name]);
      }
  }
  return all;
}

function printMsg (infos) {
  infos.forEach(function (info) {
      console.log(info);
  });
}

/**
 * compare ignore case
 *
 * @param {string} str1
 * @param {string} str2
 */
function equalsIgnoreCase (str1, str2) {
  if (str1 && str2) {
      return str1.toLowerCase() === str2.toLowerCase();
  } else {
      return !str1 && !str2;
  }
}

function printErr (err) {
  console.error('an error occured: ' + err);
}

/*
 * print message & exit
 */
function exit (err) {
  printErr(err);
  process.exit(1);
}

function line (str, len) {
  var line = new Array(Math.max(1, len - str.length)).join('-');
  return ' ' + line + ' ';
}