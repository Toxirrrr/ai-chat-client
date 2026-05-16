import { onBeforeUnmount, onMounted, ref } from 'vue';

const STORAGE_KEY = 'aichat:micId';

/**
 * Перечисление и выбор аудиоустройств ввода.
 *
 * Важно про Speech Recognition:
 * Web Speech API не принимает deviceId напрямую — он использует системный default.
 * Однако getUserMedia({ audio: { deviceId } }) запрашивает разрешение для
 * конкретного устройства и в Chromium-браузерах после этого распознавание
 * обычно идёт через выбранный микрофон.
 */
export const useMicrophones = () => {
  const isSupported = !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.enumerateDevices
  );

  const devices = ref([]);
  const selectedId = ref(
    (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'default',
  );
  const labelsAvailable = ref(false);

  const enumerate = async () => {
    if (!isSupported) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      devices.value = list.filter((d) => d.kind === 'audioinput');
      labelsAvailable.value = devices.value.some((d) => d.label && d.label.length > 0);
    } catch {
      devices.value = [];
    }
  };

  // Браузер скрывает имена устройств, пока юзер не дал permission на аудио.
  // Запрашиваем один раз, чтобы получить labels.
  const requestLabels = async () => {
    if (!isSupported || labelsAvailable.value) return enumerate();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* permission denied — оставим labels пустыми */
    }
    await enumerate();
  };

  const select = async (id) => {
    selectedId.value = id;
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* noop */ }

    if (!isSupported || id === 'default') return;
    // "Активируем" выбранный микрофон, чтобы система запомнила его как
    // активный для последующих audio-запросов (включая SpeechRecognition).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: id } },
      });
      stream.getTracks().forEach((t) => t.stop());
      await enumerate();
    } catch {
      /* permission denied / device disappeared */
    }
  };

  const onChange = () => enumerate();

  onMounted(() => {
    enumerate();
    if (isSupported) {
      navigator.mediaDevices.addEventListener?.('devicechange', onChange);
    }
  });

  onBeforeUnmount(() => {
    if (isSupported) {
      navigator.mediaDevices.removeEventListener?.('devicechange', onChange);
    }
  });

  return {
    isSupported,
    devices,
    selectedId,
    labelsAvailable,
    requestLabels,
    select,
  };
};
