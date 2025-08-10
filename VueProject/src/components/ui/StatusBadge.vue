<template>
  <span class="status-badge" :class="badgeClass">
    <slot>{{ labelText }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: string | null | undefined;
  label?: string | null | undefined;
}

const props = defineProps<Props>();

const labelText = computed(() => props.label ?? (props.status ?? 'Статус не указан'));

const badgeClass = computed(() => {
  const raw = (props.status ?? '').toString();

  const normalized = normalizeStatus(raw);
  const map: Record<string, string> = {
    NEW: 'status-new',
    CALCULATION_CONFIRMED: 'status-confirmed',
    AWAITING_ADVANCE: 'status-pending',
    IN_PRODUCTION: 'status-in-progress',
    READY_FOR_INSTALLATION: 'status-ready',
    AWAITING_INSTALLATION: 'status-waiting',
    INSTALLATION: 'status-installation',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled',
  };
  return map[normalized] ?? 'status-unknown';
});

function normalizeStatus(value: string): string {

  const v = value.trim();
  const direct = v.toUpperCase();
  const byLabel: Record<string, string> = {
    'Новый': 'NEW',
    'Расчет подтвержден': 'CALCULATION_CONFIRMED',
    'Ожидает аванса': 'AWAITING_ADVANCE',
    'В производстве': 'IN_PRODUCTION',
    'Готов к установке': 'READY_FOR_INSTALLATION',
    'Ожидает установки': 'AWAITING_INSTALLATION',
    'Установка': 'INSTALLATION',
    'Выполнен': 'COMPLETED',
    'Отменен': 'CANCELLED',
  };
  if (byLabel[v]) return byLabel[v];

  const known = new Set([
    'NEW',
    'CALCULATION_CONFIRMED',
    'AWAITING_ADVANCE',
    'IN_PRODUCTION',
    'READY_FOR_INSTALLATION',
    'AWAITING_INSTALLATION',
    'INSTALLATION',
    'COMPLETED',
    'CANCELLED',
  ]);
  return known.has(direct) ? direct : '';
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.status-new { background-color: #bbdefb; color: #0d47a1; }
.status-confirmed { background-color: #c8e6c9; color: #1b5e20; }
.status-pending { background-color: #fff9c4; color: #f57f17; }
.status-in-progress { background-color: #d1c4e9; color: #4a148c; }
.status-ready { background-color: #b3e5fc; color: #01579b; }
.status-waiting { background-color: #ffccbc; color: #bf360c; }
.status-installation { background-color: #f8bbd0; color: #880e4f; }
.status-completed { background-color: #a5d6a7; color: #1b5e20; }
.status-cancelled { background-color: #cfd8dc; color: #37474f; }
.status-unknown { background-color: #e0e0e0; color: #666; }
</style>
