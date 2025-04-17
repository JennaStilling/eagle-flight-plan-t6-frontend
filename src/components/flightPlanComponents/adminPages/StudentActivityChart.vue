<template>
  <div class="chart-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading chart data...</p>
    </div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import { getGradientFill, fetchStudentActivityData } from '@/assets/charts/chartUtils';

const props = defineProps({
  timeFrame: {
    type: String,
    default: 'month'
  }
});

const chartCanvas = ref(null);
let chart = null;
const loading = ref(false);

// Create/update chart when component mounts or timeFrame changes
const initializeChart = async () => {
  if (chart) {
    chart.destroy();
  }
  
  loading.value = true;
  
  try {
    // Fetch real data from API
    const { labels, datasets } = await fetchStudentActivityData(props.timeFrame);
    
    const ctx = chartCanvas.value.getContext('2d');
    
    // Create gradient fills for the chart
    const taskSubmissionsGradient = getGradientFill(ctx, '#5EC4B6');
    const approvedTasksGradient = getGradientFill(ctx, '#78A9C3');
    const eventSubmissionsGradient = getGradientFill(ctx, '#F68D76');
    const eventApprovalsGradient = getGradientFill(ctx, '#B580D1');
    
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Task Submissions',
            data: datasets.taskSubmissions,
            backgroundColor: taskSubmissionsGradient,
            borderColor: '#5EC4B6',
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 25, 
            barPercentage: 0.7  
          },
          {
            label: 'Approved Tasks',
            data: datasets.approvedTasks,
            backgroundColor: approvedTasksGradient,
            borderColor: '#78A9C3',
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 25, 
            barPercentage: 0.7 
          },
          {
            label: 'Event Submissions',
            data: datasets.eventSubmissions,
            backgroundColor: eventSubmissionsGradient,
            borderColor: '#F68D76',
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 25, 
            barPercentage: 0.7   
          },
          {
            label: 'Event Approvals',
            data: datasets.eventApprovals,
            backgroundColor: eventApprovalsGradient,
            borderColor: '#B580D1',
            borderWidth: 1,
            borderRadius: 8,
            maxBarThickness: 25,
            barPercentage: 0.7   
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        categoryPercentage: 0.7,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 20,
              font: {
                family: "'Poppins', sans-serif",
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            bodyFont: {
              family: "'Poppins', sans-serif"
            },
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 11
              },
              callback: function(value) {
                if (value % 1 === 0) {
                  return value;
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error initializing chart:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initializeChart();
});

watch(() => props.timeFrame, () => {
  initializeChart();
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5EC4B6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>