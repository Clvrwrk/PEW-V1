import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';

export const PHASE_KEYS = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'phase6'];

export const PHASE_COLUMNS = {
  phase1: 'PB Phase 1 Brief + Strategy',
  phase2: 'PB Phase 2 Copy',
  phase3: 'PB Phase 3 Visual',
  phase4: 'PB Phase 4 Assembly',
  phase5: 'PB Phase 5 QC',
  phase6: 'PB Phase 6 Delivery',
};

export const GOVERNANCE_COLUMNS = [
  'PageBuilder Status',
  'PageSpeed Mobile Score',
  ...PHASE_KEYS.map((key) => PHASE_COLUMNS[key]),
];

const ALLOWED_STATUSES = new Set(['pass', 'fail', 'pending']);
const URL_HEADER_PATTERN = /^(url|page url|canonical|canonical path|canonical url|target url|website url)$/i;

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeRoutePath(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const parsed = new URL(value);
    value = parsed.pathname;
  } catch {
    // Value is already a path.
  }

  if (!value.startsWith('/')) value = `/${value}`;
  return value.endsWith('/') ? value : `${value}/`;
}

export function registryRows(registry) {
  if (Array.isArray(registry?.routes)) return registry.routes;
  if (Array.isArray(registry?.pagebuilderRequiredRoutes)) {
    return registry.pagebuilderRequiredRoutes.map((route) => ({
      ...route,
      pagebuilderRequired: true,
      pagebuilderStatus: route.status === 'partial' ? 'pending' : route.status,
      templateFolder: route.record,
      phases: route.phases ?? {},
      blockers: route.blockers ?? (route.status === 'fail' ? [route.reason].filter(Boolean) : []),
    }));
  }
  return [];
}

export function buildRegistryIndex(registry) {
  const index = new Map();
  for (const row of registryRows(registry)) {
    index.set(normalizeRoutePath(row.path), row);
    if (row.canonicalUrl) index.set(normalizeRoutePath(row.canonicalUrl), row);
  }
  return index;
}

export function validateRegistry(registry) {
  const errors = [];
  const rows = registryRows(registry);

  if (rows.length === 0) {
    errors.push('Registry has no routes.');
  }

  for (const row of rows) {
    const pathLabel = row.path ?? '(missing path)';
    const status = row.pagebuilderStatus ?? row.status;
    if (!row.path) errors.push('Route is missing path.');
    if (!ALLOWED_STATUSES.has(status)) {
      errors.push(`${pathLabel} has invalid PageBuilder status "${status}".`);
    }

    if (row.pagebuilderRequired !== false) {
      for (const phase of PHASE_KEYS) {
        const phaseStatus = row.phases?.[phase];
        if (!ALLOWED_STATUSES.has(phaseStatus)) {
          errors.push(`${pathLabel} has invalid or missing ${phase}.`);
        }
      }
    }

    if (status === 'pass') {
      for (const phase of PHASE_KEYS) {
        if (row.phases?.[phase] !== 'pass') {
          errors.push(`${pathLabel} cannot pass while ${phase} is ${row.phases?.[phase] ?? 'missing'}.`);
        }
      }

      if (typeof row.pageSpeedMobileScore !== 'number' || row.pageSpeedMobileScore < 95) {
        errors.push(`${pathLabel} cannot pass without PageSpeed mobile score >= 95.`);
      }

      if (Array.isArray(row.blockers) && row.blockers.length > 0) {
        errors.push(`${pathLabel} cannot pass with blockers.`);
      }
    }

    if (status === 'fail' && (!Array.isArray(row.blockers) || row.blockers.length === 0)) {
      errors.push(`${pathLabel} is fail but has no blocker reason.`);
    }

    if (typeof row.templateFolder === 'string' && row.templateFolder.includes('src/pages/residential/')) {
      errors.push(`${pathLabel} references stale src/pages/residential output.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

function findUrlColumn(rows) {
  const header = rows[0] ?? [];
  for (let i = 0; i < header.length; i += 1) {
    const label = String(header[i] ?? '').trim();
    if (URL_HEADER_PATTERN.test(label)) return i;
  }

  for (let r = 1; r < Math.min(rows.length, 20); r += 1) {
    for (let c = 0; c < rows[r].length; c += 1) {
      const value = String(rows[r][c] ?? '');
      if (/^https?:\/\/|^\//.test(value)) return c;
    }
  }

  return -1;
}

function ensureHeader(rows, columnName) {
  if (!rows[0]) rows[0] = [];
  const existing = rows[0].findIndex((value) => String(value ?? '').trim() === columnName);
  if (existing >= 0) return existing;
  rows[0].push(columnName);
  return rows[0].length - 1;
}

export function syncWorkbookGovernanceColumns(workbook, registry) {
  const index = buildRegistryIndex(registry);
  const output = workbook;

  for (const sheetName of output.SheetNames) {
    const sheet = output.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rows.length < 2) continue;

    const urlColumnIndex = findUrlColumn(rows);
    if (urlColumnIndex < 0) continue;

    const columnIndexes = Object.fromEntries(
      GOVERNANCE_COLUMNS.map((column) => [column, ensureHeader(rows, column)]),
    );

    let touchedRows = 0;
    for (let r = 1; r < rows.length; r += 1) {
      const routePath = normalizeRoutePath(String(rows[r][urlColumnIndex] ?? ''));
      if (!routePath || routePath === '/') continue;
      const route = index.get(routePath);

      rows[r][columnIndexes['PageBuilder Status']] = route?.pagebuilderStatus ?? route?.status ?? 'pending';
      rows[r][columnIndexes['PageSpeed Mobile Score']] = route?.pageSpeedMobileScore ?? 'pending';
      for (const phase of PHASE_KEYS) {
        rows[r][columnIndexes[PHASE_COLUMNS[phase]]] = route?.phases?.[phase] ?? 'pending';
      }
      touchedRows += 1;
    }

    if (touchedRows > 0) {
      output.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
    }
  }

  return output;
}

export function applyPageSpeedResults(registry, scoresByPath, now = todayIso()) {
  const output = cloneJson(registry);
  output.routes = registryRows(output).map((route) => {
    const score = scoresByPath[normalizeRoutePath(route.path)] ?? scoresByPath[normalizeRoutePath(route.canonicalUrl ?? '')];
    if (typeof score !== 'number') return route;
    return {
      ...route,
      pageSpeedMobileScore: score,
      lastPageSpeedCheck: now,
    };
  });
  output.lastUpdated = now;
  return output;
}

export function readRegistry(registryPath = 'src/data/pagebuilder-audit.json') {
  return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

export function writeRegistry(registry, registryPath = 'src/data/pagebuilder-audit.json') {
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

export function backupWorkbook(workbookPath, now = new Date()) {
  const parsed = path.parse(workbookPath);
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  const backupPath = path.join(parsed.dir, `${parsed.name}.backup-${stamp}${parsed.ext}`);
  fs.copyFileSync(workbookPath, backupPath);
  return backupPath;
}
