
<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content" :style="{ width: computedWidth, maxHeight: '90vh' }">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button type="button" class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Информация',
  },


  maxWidth: {
    type: [String, Number],
    default: undefined,
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};


const computedWidth = computed(() => {
  const max = props.maxWidth !== undefined
    ? (typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth)
    : '900px';
  return `min(95vw, ${max})`;
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  
  max-width: none;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-out;
  transform: translateY(0);
}




.modal-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.8em;
  color: #007bff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.close-button {
  background: none;
  border: none;
  color: #777;
  font-size: 1.5em;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 20px;
  overflow: auto; 
  flex: 1 1 auto; 
}

.modal-footer {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}


@media (max-width: 768px) {
  .modal-content {
    border-radius: 8px;
  }
  .modal-header {
    padding: 10px 12px;
  }
  .modal-header h3 {
    font-size: 1.6em; 
  }
  .modal-body {
    padding: 12px; 
  }
  .modal-footer {
    padding: 10px 12px; 
  }
}

@media (max-width: 480px) {
  .modal-content {
    border-radius: 6px;
  }
  .modal-header h3 {
    font-size: 1.4em; 
  }
  .modal-body {
    padding: 10px; 
  }
}
</style>
