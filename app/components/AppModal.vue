<script setup lang="ts">
defineProps<{ modelValue: boolean; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <div class="absolute inset-0 bg-slate-900/50" @click="close" />
        <div class="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 class="font-display text-lg font-bold text-slate-900">{{ title }}</h3>
            <button class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" @click="close">
              <Icon name="lucide:x" class="text-xl" />
            </button>
          </div>
          <div class="overflow-y-auto px-5 py-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
