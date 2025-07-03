<template>
    <div class="price-list-demo">
        <div class="demo-header">
            <h2>Демо: Компонент редактирования прайс-листа</h2>
            <p class="demo-description">
                Этот компонент демонстрирует работу с константами прайс-листа.
                В реальном приложении данные будут загружаться и сохраняться через API.
            </p>
        </div>

        <!-- Основной компонент -->
        <PriceListEditor />

        <!-- Дополнительная информация -->
        <div class="demo-info">
            <h3>Информация о текущем состоянии</h3>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Состояние загрузки:</strong>
                    <span :class="loadingClass">{{ loadingText }}</span>
                </div>
                <div class="info-item">
                    <strong>Последняя ошибка:</strong>
                    <span :class="errorClass">{{ errorText }}</span>
                </div>
                <div class="info-item">
                    <strong>Всего констант:</strong>
                    <span>15 значений</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePriceListStore } from '@/stores/priceListStore'
import PriceListEditor from './PriceListEditor.vue'

const priceListStore = usePriceListStore()

const loadingClass = computed(() => ({
    'text-primary': priceListStore.loading,
    'text-success': !priceListStore.loading
}))

const loadingText = computed(() =>
    priceListStore.loading ? 'Загрузка...' : 'Готово'
)

const errorClass = computed(() => ({
    'text-danger': !!priceListStore.error,
    'text-muted': !priceListStore.error
}))

const errorText = computed(() =>
    priceListStore.error || 'Нет ошибок'
)
</script>

<style scoped>
.price-list-demo {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.demo-header {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;
}

.demo-header h2 {
    color: #495057;
    margin-bottom: 10px;
}

.demo-description {
    color: #6c757d;
    font-size: 1rem;
    margin: 0;
    line-height: 1.5;
}

.demo-info {
    margin-top: 30px;
    padding: 20px;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
}

.demo-info h3 {
    color: #495057;
    margin-bottom: 15px;
    font-size: 1.2rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item strong {
    color: #495057;
    font-size: 0.9rem;
}

.info-item span {
    font-size: 1rem;
}

.text-primary {
    color: #007bff !important;
}

.text-success {
    color: #28a745 !important;
}

.text-danger {
    color: #dc3545 !important;
}

.text-muted {
    color: #6c757d !important;
}

@media (max-width: 768px) {
    .price-list-demo {
        padding: 10px;
    }

    .demo-header {
        padding: 15px;
    }

    .demo-info {
        padding: 15px;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
}
</style>
