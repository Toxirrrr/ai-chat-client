import { computed, onBeforeUnmount, ref } from 'vue';

/**
 * Обёртка над Web Speech API.
 * Поддерживается в Chromium-браузерах (Chrome, Edge, Opera) и Safari (частично).
 * В Firefox не поддерживается — composable вернёт isSupported = false.
 *
 * Использование:
 *   const speech = useSpeechRecognition({ lang: 'ru-RU' });
 *   speech.start();          // запускает распознавание
 *   speech.stop();           // останавливает
 *   speech.fullTranscript    // computed: final + interim (для live-вывода в input)
 *   speech.error             // 'not-allowed' | 'no-speech' | 'network' | ...
 */
export const useSpeechRecognition = (options = {}) => {
  const SR =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSupported = !!SR;

  const isRecording = ref(false);
  const transcript = ref('');         // финальная часть (склеивается)
  const interimTranscript = ref('');  // временная (пока пользователь говорит)
  const error = ref(null);

  let recognition = null;

  if (isSupported) {
    recognition = new SR();
    recognition.lang = options.lang || navigator.language || 'ru-RU';
    recognition.continuous = options.continuous !== false;       // default: true
    recognition.interimResults = options.interimResults !== false; // default: true

    recognition.onstart = () => {
      isRecording.value = true;
      error.value = null;
    };

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalChunk += result[0].transcript;
        else interimChunk += result[0].transcript;
      }
      if (finalChunk) transcript.value += finalChunk;
      interimTranscript.value = interimChunk;
    };

    recognition.onerror = (event) => {
      error.value = event.error || 'unknown';
      isRecording.value = false;
    };

    recognition.onend = () => {
      isRecording.value = false;
      interimTranscript.value = '';
    };
  }

  const start = () => {
    if (!isSupported || isRecording.value) return;
    transcript.value = '';
    interimTranscript.value = '';
    error.value = null;
    try {
      recognition.start();
    } catch (e) {
      // На повторный start() без предыдущего end() браузер бросает InvalidStateError.
      error.value = e.message || 'start-failed';
    }
  };

  const stop = () => {
    if (!isSupported || !isRecording.value) return;
    try {
      recognition.stop();
    } catch {
      /* noop */
    }
  };

  const toggle = () => (isRecording.value ? stop() : start());

  const fullTranscript = computed(
    () => transcript.value + interimTranscript.value,
  );

  onBeforeUnmount(() => {
    if (recognition && isRecording.value) {
      try { recognition.abort(); } catch { /* noop */ }
    }
  });

  return {
    isSupported,
    isRecording,
    transcript,
    interimTranscript,
    fullTranscript,
    error,
    start,
    stop,
    toggle,
  };
};
