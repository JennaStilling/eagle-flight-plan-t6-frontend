<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import { generateChartData, getGradientFill } from '@/assets/charts/chartUtils';

const props = defineProps({
  timeFrame: {
    type: String,
    default: 'month'
  }
});

const chartCanvas = ref(null);
let chart = null;

// Create/update chart when component mounts or timeFrame changes
const initializeChart = () => {
  if (chart) {
    chart.destroy();
  }
  
  const ctx = chartCanvas.value.getContext('2d');
  const { labels, datasets } = generateChartData(props.timeFrame);
  
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
          borderRadius: 10,
          maxBarThickness: 25, 
          barPercentage: 0.7  
        },
        {
          label: 'Approved Tasks',
          data: datasets.approvedTasks,
          backgroundColor: approvedTasksGradient,
          borderColor: '#78A9C3',
          borderWidth: 1,
          borderRadius: 10,
          maxBarThickness: 25, 
          barPercentage: 0.7 
        },
        {
          label: 'Event Submissions',
          data: datasets.eventSubmissions,
          backgroundColor: eventSubmissionsGradient,
          borderColor: '#F68D76',
          borderWidth: 1,
          borderRadius: 10,
          maxBarThickness: 25, 
          barPercentage: 0.7   
        },
        {
          label: 'Event Approvals',
          data: datasets.eventApprovals,
          backgroundColor: eventApprovalsGradient,
          borderColor: '#B580D1',
          borderWidth: 1,
          borderRadius: 10,
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
}
</style>