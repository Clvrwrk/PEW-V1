import assert from 'node:assert/strict';
import test from 'node:test';
import XLSX from 'xlsx';

import {
  GOVERNANCE_COLUMNS,
  applyPageSpeedResults,
  syncWorkbookGovernanceColumns,
  validateRegistry,
} from '../scripts/lib/pagebuilder-governance.mjs';

test('validateRegistry rejects a pass route without six passing phases and PageSpeed >= 95', () => {
  const registry = {
    version: 1,
    routes: [
      {
        path: '/residential-roofing/metal/',
        pagebuilderRequired: true,
        pagebuilderStatus: 'pass',
        pageSpeedMobileScore: 94,
        phases: {
          phase1: 'pass',
          phase2: 'pass',
          phase3: 'pass',
          phase4: 'pass',
          phase5: 'pass',
          phase6: 'pending',
        },
        blockers: [],
      },
    ],
  };

  const result = validateRegistry(registry);

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /phase6/);
  assert.match(result.errors.join('\n'), /PageSpeed/);
});

test('syncWorkbookGovernanceColumns adds governance columns and maps registry rows by URL', () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['URL', 'Role'],
    ['/residential-roofing/metal/', 'Residential service'],
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, '05_Full_Website_URLs');

  const registry = {
    routes: [
      {
        path: '/residential-roofing/metal/',
        pagebuilderStatus: 'fail',
        pageSpeedMobileScore: 'pending',
        phases: {
          phase1: 'pass',
          phase2: 'pass',
          phase3: 'fail',
          phase4: 'fail',
          phase5: 'pending',
          phase6: 'pending',
        },
      },
    ],
  };

  const changed = syncWorkbookGovernanceColumns(workbook, registry);
  const rows = XLSX.utils.sheet_to_json(changed.Sheets['05_Full_Website_URLs'], { header: 1, defval: '' });
  const header = rows[0];
  const row = rows[1];

  for (const column of GOVERNANCE_COLUMNS) {
    assert.ok(header.includes(column), `expected workbook to include ${column}`);
  }

  assert.equal(row[header.indexOf('PageBuilder Status')], 'fail');
  assert.equal(row[header.indexOf('PageSpeed Mobile Score')], 'pending');
  assert.equal(row[header.indexOf('PB Phase 3 Visual')], 'fail');
});

test('syncWorkbookGovernanceColumns fills unmatched URL rows as pending', () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['URL', 'Role'],
    ['/about/', 'Utility page'],
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, '05_Full_Website_URLs');

  const changed = syncWorkbookGovernanceColumns(workbook, { routes: [] });
  const rows = XLSX.utils.sheet_to_json(changed.Sheets['05_Full_Website_URLs'], { header: 1, defval: '' });
  const header = rows[0];
  const row = rows[1];

  assert.equal(row[header.indexOf('PageBuilder Status')], 'pending');
  assert.equal(row[header.indexOf('PageSpeed Mobile Score')], 'pending');
  assert.equal(row[header.indexOf('PB Phase 1 Brief + Strategy')], 'pending');
  assert.equal(row[header.indexOf('PB Phase 6 Delivery')], 'pending');
});

test('applyPageSpeedResults writes scores and upgrades pending score fields', () => {
  const registry = {
    routes: [
      {
        path: '/commercial-roofing/',
        canonicalUrl: 'https://pc-demo.cleverwork.io/commercial-roofing/',
        pageSpeedMobileScore: 'pending',
      },
    ],
  };

  const updated = applyPageSpeedResults(registry, {
    '/commercial-roofing/': 98,
  });

  assert.equal(updated.routes[0].pageSpeedMobileScore, 98);
  assert.equal(updated.routes[0].lastPageSpeedCheck, new Date().toISOString().slice(0, 10));
});
