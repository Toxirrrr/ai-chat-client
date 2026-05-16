<script setup></script>

<template>
  <div class="flex-1 overflow-hidden">
    <div class="max-w-3xl mx-auto px-4 py-6 min-h-full flex flex-col justify-end gap-4">
      <!-- одна пара "user + ai" скелетон -->
      <template v-for="i in 3" :key="i">
        <div class="flex justify-end">
          <div class="h-9 w-2/5 rounded-2xl bg-slate-200/80 animate-pulse-soft" />
        </div>
        <div class="flex justify-start">
          <div class="h-20 w-3/5 rounded-2xl bg-slate-200/80 animate-pulse-soft" />
        </div>
      </template>
    </div>
  </div>
</template>
