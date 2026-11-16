import fs from 'node:fs';

export function loadDataset() {
  const raw = fs.readFileSync(new URL('../data/recorders-2026.json', import.meta.url), 'utf8');
  return JSON.parse(raw);
}

/**
 * Compute multi-month Total Cost of Ownership (TCO) for active recorders given monthly recording minutes.
 */
export function calculateTcoTable({ monthlyMinutes = 900, months = 24, requireLocalAi = false } = {}) {
  const { devices } = loadDataset();
  const years = months / 12;

  return devices
    .filter((d) => d.status === 'active' && (!requireLocalAi || d.built_in_local_llm))
    .map((d) => {
      let annualSoftware = 0;
      let tierUsed = 'Included Free / Local';

      if (typeof d.free_monthly_minutes === 'number') {
        if (monthlyMinutes > d.free_monthly_minutes) {
          if (typeof d.paid_plan_monthly_minutes === 'number' && monthlyMinutes > d.paid_plan_monthly_minutes) {
            annualSoftware = d.unlimited_plan_annual_usd ?? d.paid_plan_annual_usd ?? 0;
            tierUsed = 'Unlimited Plan';
          } else {
            annualSoftware = d.paid_plan_annual_usd ?? 0;
            tierUsed = 'Pro Plan';
          }
        }
      }

      const totalUsd = Number((d.hardware_usd + annualSoftware * years).toFixed(2));
      return {
        id: d.id,
        name: d.name,
        hardwareUsd: d.hardware_usd,
        annualSoftwareUsd: annualSoftware,
        months,
        totalUsd,
        tierUsed,
        localTranscription: d.local_transcription,
        builtInLocalLlm: d.built_in_local_llm,
        mcpCli: d.mcp_cli,
        comparisonUrl: d.comparison_url,
      };
    })
    .sort((a, b) => a.totalUsd - b.totalUsd);
}
