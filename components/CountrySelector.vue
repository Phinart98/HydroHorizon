<template>
    <div class="bg-white p-4 rounded-lg shadow-md">
      <label for="country-select" class="block text-sm font-medium text-gray-700 mb-2">
        Select a Country
      </label>
      <select
        id="country-select"
        v-model="selectedCountry"
        @change="emitChange"
        class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="ghana">Ghana</option>
        <option value="kenya">Kenya</option>
        <option value="india">India</option>
      </select>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const emit = defineEmits(['country-changed']);
  const selectedCountry = ref('ghana');
  
  function emitChange() {
    emit('country-changed', selectedCountry.value);
  }
  
  // Emit the initial value on component mount
  watch(selectedCountry, (newValue) => {
    emit('country-changed', newValue);
  }, { immediate: true });
  </script>
  