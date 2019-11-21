cnrm -- CNPM registry manager
===

[![NPM version][npm-image]][npm-url]

`cnrm` can help you easy and fast switch between different npm registries,
now include: `npm`, `cnpm`, `taobao`, `nj(nodejitsu)`.

## How to configure yarn to use private registry ?
just add .yarnrc in your project’s directory and write there:
`registry “http://your.registry”`

Or you can configure it in your HOME directory's .yarnrc


## Install

```
$ npm install -g cnrm
```

## Example
```
$ cnrm ls

* npm -----  https://registry.npmjs.org/
  yarn ----- https://registry.yarnpkg.com
  cnpm ----  http://r.cnpmjs.org/
  taobao --  https://registry.npm.taobao.org/
  nj ------  https://registry.nodejitsu.com/
  skimdb -- https://skimdb.npmjs.com/registry

```

```
$ cnrm use cnpm  //switch registry to cnpm

    Registry has been set to: http://r.cnpmjs.org/

```

## Usage

```
Usage: cnrm [options] [command]

  Commands:

    ls                                    List all the registries
    current                               Show current registry name
    use <registry>                        Change registry to registry
    help                                  Print this help

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Registries

* [npm](https://www.npmjs.org)
* [yarn](https://yarnpkg.com)
* [cnpm](http://cnpmjs.org)
* [taobao](http://npm.taobao.org/)

## Related Projects

* [verdaccio--A lightweight private npm proxy registry](https://verdaccio.org/)

## Maintainer is wanted

If you find cnrm is useful and is a experienced node.js developer, then you can help maintain cnrm.
If you have the interest you can reach me through email.

## Contributors 

* [](https://github.com/EmilyMew)

## LICENSE
MIT


[npm-image]: https://img.shields.io/npm/v/cnrm.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cnrm
