export function generateChartData(timeFrame) {
  const now = new Date(); // Current date
  
  if (timeFrame === 'month') {
    // Generate week labels for the past 30 days
    const weekLabels = [];
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 28); // Go back 28 days
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Format dates: "Apr 14-20" or "Apr 28-May 4" if spanning months
      const startMonth = weekStart.toLocaleString('default', { month: 'short' });
      const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
      
      const dateRange = weekStart.getMonth() !== weekEnd.getMonth()
        ? `${startMonth} ${weekStart.getDate()}-${endMonth} ${weekEnd.getDate()}`
        : `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
      
      weekLabels.push(`Week ${i+1} (${dateRange})`);
    }
    
    return {
      labels: weekLabels,
      datasets: {
        taskSubmissions: [28, 34, 42, 39],
        approvedTasks: [22, 30, 37, 32],
        eventSubmissions: [14, 18, 23, 20],
        eventApprovals: [12, 16, 21, 18]
      }
    };
  } else {
    // Generate month labels for the past 6 months
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      const yearStr = date.getFullYear();
      
      monthLabels.push(`${monthStr} ${yearStr}`);
    }
    
    return {
      labels: monthLabels,
      datasets: {
        taskSubmissions: [65, 82, 91, 74, 86, 94],
        approvedTasks: [58, 71, 84, 67, 73, 85],
        eventSubmissions: [42, 48, 53, 47, 51, 58],
        eventApprovals: [36, 43, 48, 42, 46, 53]
      }
    };
  }
}

/**
 * Creates a gradient fill for chart bars
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} baseColor - Base color for the gradient
 * @returns {CanvasGradient} Gradient object
 */
export function getGradientFill(ctx, baseColor) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, `${baseColor}FF`); 
  gradient.addColorStop(1, `${baseColor}22`); 
  return gradient;
}

export async function fetchStudentActivityData(timeFrame) {
  // Has dummy data for now
  return Promise.resolve(generateChartData(timeFrame));
}