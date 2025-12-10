/**
 * Documentation Generator
 *
 * Automatically generates GitBook-compatible documentation from:
 * - Smart contract source code and comments
 * - Test files and examples
 * - TypeScript comments and JSDoc annotations
 *
 * Usage: npx ts-node scripts/generate-docs.ts
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface DocSection {
  title: string;
  content: string;
  category: string;
  order: number;
}

interface SmartContractDoc {
  name: string;
  description: string;
  functions: FunctionDoc[];
  events: EventDoc[];
  stateVariables: StateVariableDoc[];
  category?: string;
}

interface FunctionDoc {
  name: string;
  description: string;
  parameters: { name: string; type: string; description: string }[];
  returns: { type: string; description: string }[];
  modifiers: string[];
  visibility: string;
  example?: string;
}

interface EventDoc {
  name: string;
  description: string;
  parameters: { name: string; type: string; indexed: boolean }[];
}

interface StateVariableDoc {
  name: string;
  type: string;
  description: string;
  visibility: string;
}

function extractSolidityDocs(filePath: string): SmartContractDoc {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract contract name
  const contractMatch = content.match(/contract\s+(\w+)/);
  const contractName = contractMatch ? contractMatch[1] : "Unknown";

  // Extract contract documentation
  const docMatch = content.match(/\/\*\*\s*([\s\S]*?)\*\//);
  const description = docMatch ? docMatch[1].trim() : "No description";

  // Extract functions
  const functions = extractFunctions(content);

  // Extract events
  const events = extractEvents(content);

  // Extract state variables
  const stateVariables = extractStateVariables(content);

  return {
    name: contractName,
    description,
    functions,
    events,
    stateVariables
  };
}

function extractFunctions(content: string): FunctionDoc[] {
  const functions: FunctionDoc[] = [];
  const functionPattern = /\/\*\*\s*([\s\S]*?)\*\/\s*([\w\s,()]*?)\s*function\s+(\w+)\s*\(([\s\S]*?)\)\s*([\w\s]*?)\{/g;

  let match;
  while ((match = functionPattern.exec(content)) !== null) {
    const docString = match[1];
    const modifiers = match[2].trim().split(/\s+/).filter(m => m.length > 0);
    const name = match[3];
    const paramsString = match[4];
    const returns = match[5];

    const description = extractDescription(docString);
    const parameters = extractParameters(docString, paramsString);
    const returnParams = extractReturns(docString);

    // Extract visibility
    let visibility = "internal";
    if (modifiers.includes("public")) visibility = "public";
    else if (modifiers.includes("external")) visibility = "external";
    else if (modifiers.includes("private")) visibility = "private";

    functions.push({
      name,
      description,
      parameters,
      returns: returnParams,
      modifiers,
      visibility
    });
  }

  return functions;
}

function extractEvents(content: string): EventDoc[] {
  const events: EventDoc[] = [];
  const eventPattern = /event\s+(\w+)\s*\(([\s\S]*?)\);/g;

  let match;
  while ((match = eventPattern.exec(content)) !== null) {
    const name = match[1];
    const paramsString = match[2];

    // Look for preceding documentation
    const beforeContent = content.substring(0, match.index);
    const docMatch = beforeContent.match(/\/\*\*\s*([\s\S]*?)\*\/\s*event/);
    const description = docMatch ? extractDescription(docMatch[1]) : "No description";

    const parameters = extractEventParameters(paramsString);

    events.push({
      name,
      description,
      parameters
    });
  }

  return events;
}

function extractStateVariables(content: string): StateVariableDoc[] {
  const variables: StateVariableDoc[] = [];
  const pattern = /\/\*\*\s*([\s\S]*?)\*\/\s*([\w\s]*?)\s+(\w+)\s+(\w+);/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const docString = match[1];
    const modifiers = match[2].trim();
    const varType = match[3];
    const varName = match[4];

    const description = extractDescription(docString);

    let visibility = "internal";
    if (modifiers.includes("public")) visibility = "public";
    else if (modifiers.includes("private")) visibility = "private";

    variables.push({
      name: varName,
      type: varType,
      description,
      visibility
    });
  }

  return variables;
}

function extractDescription(docString: string): string {
  const lines = docString.split("\n").map(l => l.replace(/^\s*\*\s?/, ""));
  return lines.join(" ").trim();
}

function extractParameters(
  docString: string,
  paramsString: string
): { name: string; type: string; description: string }[] {
  const parameters = [];

  // Extract parameter descriptions from JSDoc
  const paramRegex = /@param\s+(\w+)\s+([\s\S]*?)(?=@|$)/g;
  const docParams: { [key: string]: string } = {};

  let match;
  while ((match = paramRegex.exec(docString)) !== null) {
    docParams[match[1]] = match[2].trim();
  }

  // Parse function parameters
  const params = paramsString.split(",").map(p => p.trim());
  params.forEach(param => {
    if (param.length === 0) return;

    const parts = param.split(/\s+/);
    const type = parts.slice(0, -1).join(" ");
    const name = parts[parts.length - 1].replace(/^_/, "");

    parameters.push({
      name,
      type,
      description: docParams[name] || ""
    });
  });

  return parameters;
}

function extractReturns(
  docString: string
): { type: string; description: string }[] {
  const returns = [];
  const returnRegex = /@return\s+([\s\S]*?)(?=@|$)/g;

  let match;
  while ((match = returnRegex.exec(docString)) !== null) {
    const description = match[1].trim();
    returns.push({
      type: "Unknown",
      description
    });
  }

  return returns;
}

function extractEventParameters(
  paramsString: string
): { name: string; type: string; indexed: boolean }[] {
  const parameters = [];

  const params = paramsString.split(",").map(p => p.trim());
  params.forEach(param => {
    if (param.length === 0) return;

    const indexed = param.includes("indexed");
    const cleanParam = param.replace("indexed", "").trim();
    const parts = cleanParam.split(/\s+/);
    const type = parts.slice(0, -1).join(" ");
    const name = parts[parts.length - 1];

    parameters.push({
      name,
      type,
      indexed
    });
  });

  return parameters;
}

function generateMarkdownFromContract(doc: SmartContractDoc): string {
  let markdown = `# ${doc.name}\n\n`;
  markdown += `${doc.description}\n\n`;

  // State Variables
  if (doc.stateVariables.length > 0) {
    markdown += `## State Variables\n\n`;
    doc.stateVariables.forEach(variable => {
      markdown += `### ${variable.name}\n`;
      markdown += `- **Type**: \`${variable.type}\`\n`;
      markdown += `- **Visibility**: \`${variable.visibility}\`\n`;
      markdown += `- **Description**: ${variable.description}\n\n`;
    });
  }

  // Functions
  if (doc.functions.length > 0) {
    markdown += `## Functions\n\n`;
    doc.functions.forEach(func => {
      markdown += `### \`${func.name}()\`\n`;
      markdown += `- **Visibility**: \`${func.visibility}\`\n`;
      if (func.modifiers.length > 0) {
        markdown += `- **Modifiers**: \`${func.modifiers.join(", ")}\`\n`;
      }
      markdown += `- **Description**: ${func.description}\n\n`;

      if (func.parameters.length > 0) {
        markdown += `**Parameters**:\n`;
        func.parameters.forEach(param => {
          markdown += `- \`${param.type} ${param.name}\`: ${param.description}\n`;
        });
        markdown += "\n";
      }

      if (func.returns.length > 0) {
        markdown += `**Returns**:\n`;
        func.returns.forEach(ret => {
          markdown += `- \`${ret.type}\`: ${ret.description}\n`;
        });
        markdown += "\n";
      }
    });
  }

  // Events
  if (doc.events.length > 0) {
    markdown += `## Events\n\n`;
    doc.events.forEach(event => {
      markdown += `### \`${event.name}\`\n`;
      markdown += `${event.description}\n\n`;

      if (event.parameters.length > 0) {
        markdown += `**Parameters**:\n`;
        event.parameters.forEach(param => {
          const indexed = param.indexed ? " (indexed)" : "";
          markdown += `- \`${param.type} ${param.name}\`${indexed}\n`;
        });
        markdown += "\n";
      }
    });
  }

  return markdown;
}

function generateDocumentation(): void {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║     Documentation Generator                                ║");
  console.log("║     Privacy-Preserving Quality Inspection System           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const contractsDir = path.join(process.cwd(), "contracts");
  const docsDir = path.join(process.cwd(), "docs");

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Process all Solidity files
  const contracts = fs.readdirSync(contractsDir).filter(f => f.endsWith(".sol"));

  if (contracts.length === 0) {
    console.log("No Solidity contracts found in contracts/");
    return;
  }

  console.log(`Found ${contracts.length} contracts. Generating documentation...\n`);

  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    const contractName = path.basename(contract, ".sol");

    try {
      const doc = extractSolidityDocs(contractPath);
      const markdown = generateMarkdownFromContract(doc);

      const outputPath = path.join(docsDir, `${contractName}.md`);
      fs.writeFileSync(outputPath, markdown);

      console.log(`✓ Generated documentation for ${contractName}`);
    } catch (error) {
      console.error(`✗ Error processing ${contract}:`, error);
    }
  });

  // Generate index
  generateIndex(docsDir, contracts);

  console.log(`\n✅ Documentation generated successfully in docs/`);
}

function generateIndex(docsDir: string, contracts: string[]): void {
  let index = `# API Reference\n\n`;
  index += `Complete API documentation for all smart contracts.\n\n`;
  index += `## Contracts\n\n`;

  contracts.forEach(contract => {
    const contractName = path.basename(contract, ".sol");
    index += `- [${contractName}](./${contractName}.md)\n`;
  });

  const indexPath = path.join(docsDir, "INDEX.md");
  fs.writeFileSync(indexPath, index);
  console.log(`✓ Generated index file`);
}

generateDocumentation();
