import { GraphQLSchema } from "graphql";
import { Options as PrintSchemaOptions } from "graphql/utilities/schemaPrinter";
import * as path from "path";

import { SchemaGenerator, SchemaGeneratorOptions } from "../schema/schema-generator";
import { loadResolversFromGlob } from "../helpers/loadResolversFromGlob";
import {
  emitSchemaDefinitionFileSync,
  emitSchemaDefinitionFile,
  defaultPrintSchemaOptions,
} from "./emitSchemaDefinitionFile";

interface EmitSchemaFileOptions extends PrintSchemaOptions {
  path?: string;
}

export interface BuildSchemaOptions extends SchemaGeneratorOptions {
  /**
   * Path to the file to where emit the schema
   * or config object with print schema options
   * or `true` for the default `./schema.gql` one
   */
  emitSchemaFile?: string | boolean | EmitSchemaFileOptions;
}
export async function buildSchema(options: BuildSchemaOptions): Promise<GraphQLSchema> {
  checkOptions(options);
  const schema = await new SchemaGenerator().generateFromMetadata(options);
  if (options.emitSchemaFile) {
    const { schemaFileName, printSchemaOptions } = getEmitSchemaDefinitionFileOptions(options);
    await emitSchemaDefinitionFile(schemaFileName, schema, printSchemaOptions);
  }
  return schema;
}

export function buildSchemaSync(options: BuildSchemaOptions): GraphQLSchema {
  checkOptions(options);
  const schema = new SchemaGenerator().generateFromMetadataSync(options);
  if (options.emitSchemaFile) {
    const { schemaFileName, printSchemaOptions } = getEmitSchemaDefinitionFileOptions(options);
    emitSchemaDefinitionFileSync(schemaFileName, schema, printSchemaOptions);
  }
  return schema;
}

function checkOptions(options: BuildSchemaOptions) {
  if (!options.resolvers || options.resolvers.length === 0) {
    throw new Error("Empty `resolvers` array property found in `buildSchema` options!");
  }
  if (!options.types || options.types.length === 0) {
    throw new Error("Empty `types` array property found in `buildSchema` options!");
  }
}

function getEmitSchemaDefinitionFileOptions(
  buildSchemaOptions: BuildSchemaOptions,
): {
  schemaFileName: string;
  printSchemaOptions: PrintSchemaOptions;
} {
  const defaultSchemaFilePath = path.resolve(process.cwd(), "schema.gql");
  return {
    schemaFileName:
      typeof buildSchemaOptions.emitSchemaFile === "string"
        ? buildSchemaOptions.emitSchemaFile
        : typeof buildSchemaOptions.emitSchemaFile === "object"
        ? buildSchemaOptions.emitSchemaFile.path || defaultSchemaFilePath
        : defaultSchemaFilePath,
    printSchemaOptions:
      typeof buildSchemaOptions.emitSchemaFile === "object"
        ? buildSchemaOptions.emitSchemaFile
        : defaultPrintSchemaOptions,
  };
}
