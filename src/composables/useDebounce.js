import { customRef } from 'vue';

/**
 * Реактивный ref, изменение которого "оседает" только через `delay` мс простоя.
 * Удобно для search-инпутов: пользователь печатает → дебаунсится → один запрос.
 *
 * @param {any} initial — начальное значение
 * @param {number} delay — задержка в мс (по умолчанию 300)
 */
export const useDebouncedRef = (initial, delay = 300) => {
  let timer;
  return customRef((track, trigger) => {
    let value = initial;
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
};
