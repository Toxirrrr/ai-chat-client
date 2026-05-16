<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: { type: String, default: '' },
  query: { type: String, default: '' },
});

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Разбиваем текст на токены Markdown (жирный, курсив, инлайн-код)
const parseInline = (text) => {
  const regex = /(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[\s\S]+?`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const token = match[1];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push({ type: 'bold', content: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push({ type: 'italic', content: token.slice(1, -1) });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push({ type: 'code', content: token.slice(1, -1) });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return parts;
};

// Функция для подсветки поискового запроса внутри фрагмента текста
const highlightText = (text) => {
  const q = props.query.trim();
  if (!q) return [{ text, match: false }];

  const regex = new RegExp(`(${escapeRegExp(q)})`, 'gi');
  const needle = q.toLowerCase();
  return text
    .split(regex)
    .map((t) => ({ text: t, match: t.toLowerCase() === needle }))
    .filter((p) => p.text.length > 0);
};

// Вычисляем итоговую структуру: сначала маркдаун, внутри поиск
const blocks = computed(() => {
  return parseInline(props.text).map((block) => ({
    ...block,
    fragments: highlightText(block.content),
  }));
});
</script>

<template>
  <span>
    <template v-for="(b, i) in blocks" :key="i">
      <component
        :is="b.type === 'bold' ? 'strong' : b.type === 'italic' ? 'em' : b.type === 'code' ? 'code' : 'span'"
        :class="b.type === 'code' ? 'bg-black/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono' : ''"
      >
        <template v-for="(f, j) in b.fragments" :key="j">
          <mark
            v-if="f.match"
            class="bg-amber-200/70 text-inherit rounded px-0.5"
          >{{ f.text }}</mark>
          <template v-else>{{ f.text }}</template>
        </template>
      </component>
    </template>
  </span>
</template>
