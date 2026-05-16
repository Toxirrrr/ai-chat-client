<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import VoiceButton from '@/components/voice/VoiceButton.vue';
import MicSelector from '@/components/voice/MicSelector.vue';
import ModelSelector from '@/components/chat/ModelSelector.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: Boolean,
  sending: Boolean,
  recording: Boolean,
  voiceSupported: { type: Boolean, default: true },
  maxLength: { type: Number, default: 8000 },
  placeholder: { type: String, default: 'Спросите что-нибудь...' },
  models: { type: Array, default: () => [] },
  selectedModel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'update:selectedModel', 'submit', 'toggle-voice']);

const textareaEl = ref(null);

const canSubmit = computed(
  () => !props.disabled && !props.sending && props.modelValue.trim().length > 0,
);

const autoResize = () => {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
};

watch(() => props.modelValue, () => nextTick(autoResize));

const onInput = (e) => emit('update:modelValue', e.target.value);

const onSubmit = () => {
  if (!canSubmit.value) return;
  emit('submit', props.modelValue.trim());
};

const onKeydown = (e) => {
  // Enter — отправить, Shift+Enter — новая строка
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    onSubmit();
  }
};

const focus = () => textareaEl.value?.focus();

// Возвращаем фокус после завершения отправки, чтобы юзер мог сразу печатать дальше.
watch(() => props.sending, (v, prev) => {
  if (prev && !v) nextTick(focus);
});

onMounted(() => {
  // На мобилке принудительный focus вызывает виртуальную клавиатуру — не делаем там
  if (window.matchMedia('(min-width: 768px)').matches) nextTick(focus);
});

defineExpose({ focus });
</script>

<template>
  <div class="border-t border-slate-200 bg-white">
    <div class="max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
      <div
        class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50
               focus-within:bg-white focus-within:border-brand-300
               focus-within:ring-4 focus-within:ring-brand-100 transition px-2 py-1"
      >
        <div class="flex items-end shrink-0">
          <VoiceButton
            :recording="recording"
            :supported="voiceSupported"
            :disabled="disabled || sending"
            @toggle="$emit('toggle-voice')"
          />
          <MicSelector v-if="voiceSupported" :disabled="disabled || sending || recording" />
        </div>

        <textarea
          ref="textareaEl"
          :value="modelValue"
          :disabled="disabled || sending"
          :placeholder="placeholder"
          :maxlength="maxLength"
          rows="1"
          class="flex-1 bg-transparent resize-none outline-none px-1 py-2 text-[15px]
                 placeholder:text-slate-400 disabled:opacity-60"
          @input="onInput"
          @keydown="onKeydown"
        />

        <!-- Model Selector — centre between textarea and send -->
        <div class="hidden sm:flex items-center shrink-0 border-l border-slate-200 pl-1 ml-1">
          <ModelSelector
            :models="models"
            :model-value="selectedModel"
            :disabled="disabled || sending"
            @update:model-value="$emit('update:selectedModel', $event)"
          />
        </div>

        <button
          type="button"
          class="btn-icon bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300
                 disabled:text-slate-100"
          :disabled="!canSubmit"
          :aria-label="sending ? 'Отправка...' : 'Отправить'"
          :title="sending ? 'Отправка...' : 'Отправить (Enter)'"
          @click="onSubmit"
        >
          <svg
            v-if="sending"
            class="w-5 h-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="4" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5 translate-x-[-2px] translate-y-[1px]"
          >
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      <div class="mt-1 px-2 text-[11px] text-slate-400 hidden sm:flex justify-between">
        <span>Enter — отправить · Shift+Enter — новая строка</span>
        <span v-if="modelValue.length > maxLength * 0.8">
          {{ modelValue.length }} / {{ maxLength }}
        </span>
      </div>
    </div>
  </div>
</template>
