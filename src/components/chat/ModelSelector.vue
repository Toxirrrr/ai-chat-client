<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  models: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  disabled: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const containerEl = ref(null);

const allOptions = computed(() => [
  { value: '', label: 'Auto', sub: 'default' },
  ...props.models.map((m) => {
    const clean = m.replace('gemini-', '');
    return { value: m, label: clean.toUpperCase(), sub: 'gemini' };
  }),
]);

const selected = computed(
  () => allOptions.value.find((o) => o.value === props.modelValue) ?? allOptions.value[0],
);

const select = (val) => {
  emit('update:modelValue', val);
  open.value = false;
};

const toggle = () => {
  if (!props.disabled) open.value = !open.value;
};

const onOutside = (e) => {
  if (containerEl.value && !containerEl.value.contains(e.target)) open.value = false;
};

onMounted(() => document.addEventListener('mousedown', onOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside));
</script>

<template>
  <div ref="containerEl" class="relative flex items-center">
    <!-- Trigger button -->
    <button
      type="button"
      :disabled="disabled"
      class="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold
             text-slate-500 hover:text-brand-600 hover:bg-brand-50
             disabled:opacity-40 disabled:cursor-not-allowed
             transition-all duration-150 select-none whitespace-nowrap"
      :class="{ 'text-brand-600 bg-brand-50': open }"
      @click="toggle"
    >
      <!-- Dot indicator -->
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
        :class="modelValue ? 'bg-brand-500' : 'bg-slate-300'"
      />
      {{ selected.label }}
      <!-- Chevron -->
      <svg
        class="w-3 h-3 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="open"
        class="absolute bottom-full mb-2 left-0 z-50
               bg-white rounded-xl border border-slate-200
               shadow-lg shadow-slate-200/80
               min-w-[148px] py-1 origin-bottom-left"
      >
        <!-- Header -->
        <div class="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
          AI Model
        </div>

        <button
          v-for="opt in allOptions"
          :key="opt.value"
          type="button"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-left
                 text-[12px] font-medium transition-colors duration-100
                 hover:bg-brand-50"
          :class="opt.value === modelValue
            ? 'text-brand-600 bg-brand-50/60'
            : 'text-slate-700'"
          @click="select(opt.value)"
        >
          <!-- Check icon for selected -->
          <span class="w-3.5 shrink-0">
            <svg
              v-if="opt.value === modelValue"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round"
              class="w-3.5 h-3.5 text-brand-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>

          <span class="flex-1 leading-tight">
            {{ opt.label }}
            <span
              v-if="opt.value === ''"
              class="ml-1 text-[10px] font-normal text-slate-400"
            >(default)</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>
