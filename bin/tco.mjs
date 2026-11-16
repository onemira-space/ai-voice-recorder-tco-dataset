#!/usr/bin/env node
import { calculateTcoTable } from '../src/tco.mjs';

const args = process.argv.slice(2);
const minIdx = args.indexOf('--minutes');
const moIdx = args.indexOf('--months');
const monthlyMinutes = minIdx !== -1 ? Number(args[minIdx + 1]) : 900;
const months = moIdx !== -1 ? Number(args[moIdx + 1]) : 24;
const requireLocalAi = args.includes('--local-only');
const asJson = args.includes('--json');

const rows = calculateTcoTable({ monthlyMinutes, months, requireLocalAi });
if (asJson) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`=== ${months}-Month AI Voice Recorder TCO @ ${monthlyMinutes} min/month ===`);
  for (const r of rows) {
    console.log(
      `${r.name.padEnd(28)} | Total: $${String(r.totalUsd.toFixed(2)).padStart(6)} (HW $${r.hardwareUsd} + $${r.annualSoftwareUsd}/yr ${r.tierUsed}) | LocalAI=${r.builtInLocalLlm}`,
    );
  }
}
