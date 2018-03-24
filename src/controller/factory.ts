import { normalize, Path, relative, strings } from '@angular-devkit/core';
import { classify } from '@angular-devkit/core/src/utils/strings';
import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { ModuleImportUtils } from '../utils/module-import.utils';
import { ModuleMetadataUtils } from '../utils/module-metadata.utils';
import { ModuleFinder } from '../utils/module.finder';
import { ControllerOptions } from './schema';

export function main(options: ControllerOptions): Rule {
  options.path = options.path !== undefined ? options.path : options.name;
  return chain([
    mergeWith(generate(options)),
    addDeclarationToModule(options)
  ]);
}

function generate(options: ControllerOptions) {
  return apply(
    url('./files'), [
      template({
        ...strings,
        ...options
      }),
      move('/src')
    ]
  );
}

function addDeclarationToModule(options: ControllerOptions): Rule {
  return (tree: Tree) => {
    const finder: ModuleFinder = new ModuleFinder(tree);
    const moduleToInsertPath: string = finder.find({
      name: options.name,
      path: options.path,
      kind: 'controller'
    });
    const generatedDirectoryPath: string = normalize(`/src/${ options.path }`);
    let relativePath: string = relative(moduleToInsertPath as Path, generatedDirectoryPath as Path);
    relativePath = `${ relativePath.substring(1, relativePath.length) }/${ options.name }.controller`;
    let content = tree.read(moduleToInsertPath).toString();
    const symbol: string = `${ classify(options.name) }Controller`;
    content = ModuleImportUtils.insert(content, symbol, relativePath);
    content = ModuleMetadataUtils.insert(content, 'controllers', symbol);
    tree.overwrite(moduleToInsertPath, content);
    return tree;
  };
}
