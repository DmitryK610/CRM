<template>
    <div class="price-list-view">
        <PriceListEditor />
    </div>
</template>

<script setup lang="ts">
import PriceListEditor from '@/components/pricing/PriceListEditor.vue'
</script>

<style scoped>
.price-list-view {
    min-height: 100%;
    background-color: #f5f5f5;
    padding: 20px 0;
}
</style>
