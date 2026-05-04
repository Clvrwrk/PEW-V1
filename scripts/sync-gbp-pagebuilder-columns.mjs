#!/usr/bin/env node
import XLSX from 'xlsx';
import {
  backupWorkbook,
  readRegistry,
  syncWorkbookGovernanceColumns,
} from './lib/pagebuilder-governance.mjs';

const args = new Set(process.argv.slice(2));
const workbookPath = process.argv.find((arg) => arg.startsWith('--workbook='))
  ?.replace('--workbook=', '') ?? 'strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx';
const registryPath = process.argv.find((arg) => arg.startsWith('--registry='))
  ?.replace('--registry=', '') ?? 'src/data/pagebuilder-audit.json';
const dryRun = args.has('--dry-run');

const registry = readRegistry(registryPath);
const workbook = XLSX.readFile(workbookPath, { cellDates: true });
const synced = syncWorkbookGovernanceColumns(workbook, registry);

if (dryRun) {
  console.log(`[gbp-pagebuilder-sync] Dry run succeeded for ${workbookPath}; workbook was not written.`);
  process.exit(0);
}

const backupPath = backupWorkbook(workbookPath);
XLSX.writeFile(synced, workbookPath);

console.log(`[gbp-pagebuilder-sync] Updated ${workbookPath}`);
console.log(`[gbp-pagebuilder-sync] Backup written to ${backupPath}`);
