import { program } from "commander";

export function parseCLIArgs() {
  const command = program.version("0.0.1").description("Key share node server");

  command.requiredOption("--node-id <id>");

  command.parse(process.argv);

  const opts = program.opts();
  return opts as CLIArgs;
}

export interface CLIArgs {
  nodeId: string;
}
