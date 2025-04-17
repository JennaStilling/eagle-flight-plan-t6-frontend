import StudentEventServices from '@/services/flightPlanServices/studentEventServices';
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';

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
  try {
    // Fetch both events and tasks data in parallel
    const [eventResponse, taskResponse] = await Promise.all([
      StudentEventServices.getAllStudentEvents(),
      StudentFlightPlanTaskServices.getAllStudentFlightPlanTasks()
    ]);
    
    const events = eventResponse.data;
    const tasks = taskResponse.data;
    const now = new Date();
    
    // Process data based on time frame
    if (timeFrame === 'month') {
      // Last 30 days, grouped by week
      return processMonthlyData(events, tasks, now);
    } else {
      // All-time (last 6 months), grouped by month
      return processAllTimeData(events, tasks, now);
    }
  } catch (error) {
    console.error('Error fetching activity data:', error);
    // Return dummy data as fallback
    return generateChartData(timeFrame);
  }
}

function processMonthlyData(events, tasks, now) {
  // Create date boundaries for 4 weeks
  const weekBoundaries = [];
  const labels = [];
  
  // Create start date (30 days ago)
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 28);
  startDate.setHours(0, 0, 0, 0);
  
  // Initialize data arrays
  const eventSubmissions = [0, 0, 0, 0];
  const eventApprovals = [0, 0, 0, 0];
  const taskSubmissions = [0, 0, 0, 0];
  const approvedTasks = [0, 0, 0, 0];
  
  // Create week boundaries
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (i * 7));
    weekStart.setHours(0, 0, 0, 0); // Start at beginning of day
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // End at end of day to include full day
    
    // Make sure the last week includes today completely
    if (i === 3) {
      // Set the end date of the 4th week to the end of today
      weekEnd.setTime(now.getTime());
      weekEnd.setHours(23, 59, 59, 999);
    }
    
    // Format week labels
    const startMonth = weekStart.toLocaleString('default', { month: 'short' });
    const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
    
    const dateRange = weekStart.getMonth() !== weekEnd.getMonth()
      ? `${startMonth} ${weekStart.getDate()}-${endMonth} ${weekEnd.getDate()}`
      : `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
    
    labels.push(`Week ${i+1} (${dateRange})`);
    weekBoundaries.push({
      start: weekStart,
      end: weekEnd
    });
  }
  
  // Process each event
  events.forEach(event => {
    if (!event.updatedAt) return;
    
    // Use updatedAt for tracking when status changes occurred
    const eventDate = new Date(event.updatedAt);
    
    // Only process events within our date range and with relevant statuses
    if (eventDate >= weekBoundaries[0].start && eventDate <= weekBoundaries[3].end) {
      // Find which week this event belongs to
      const weekIndex = weekBoundaries.findIndex(
        week => eventDate >= week.start && eventDate <= week.end
      );
      
      if (weekIndex !== -1) {
        if (event.verification_status === 'in_progress') {
          eventSubmissions[weekIndex]++;
        } else if (event.verification_status === 'approved') {
          eventApprovals[weekIndex]++;
        }
      }
    }
  });
  
  // Process each task
  tasks.forEach(task => {
    if (!task.updatedAt) return;
    
    // Use updatedAt for tracking when status changes occurred
    const taskDate = new Date(task.updatedAt);
    
    // Only process tasks within our date range and with relevant statuses
    if (taskDate >= weekBoundaries[0].start && taskDate <= weekBoundaries[3].end) {
      // Find which week this task belongs to
      const weekIndex = weekBoundaries.findIndex(
        week => taskDate >= week.start && taskDate <= week.end
      );
      
      if (weekIndex !== -1) {
        if (task.status === 'ready_for_review') {
          taskSubmissions[weekIndex]++;
        } else if (task.status === 'approved') {
          approvedTasks[weekIndex]++;
        }
      }
    }
  });
  
  return {
    labels: labels,
    datasets: {
      taskSubmissions: taskSubmissions,
      approvedTasks: approvedTasks,
      eventSubmissions: eventSubmissions,
      eventApprovals: eventApprovals
    }
  };
}

function processAllTimeData(events, tasks, now) {
  // Process data for the last 6 months
  const monthBoundaries = [];
  const labels = [];
  
  // Initialize data arrays
  const eventSubmissions = [0, 0, 0, 0, 0, 0];
  const eventApprovals = [0, 0, 0, 0, 0, 0];
  const taskSubmissions = [0, 0, 0, 0, 0, 0];
  const approvedTasks = [0, 0, 0, 0, 0, 0];
  
  // Create month boundaries for last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthStart.setHours(0, 0, 0, 0);
    
    // Calculate end of month
    let monthEnd;
    if (i > 0) {
      monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
    } else {
      monthEnd = new Date(now); // Today for current month
      monthEnd.setHours(23, 59, 59, 999);
    }
    
    const monthStr = monthStart.toLocaleString('default', { month: 'short' });
    const yearStr = monthStart.getFullYear();
    
    labels.push(`${monthStr} ${yearStr}`);
    monthBoundaries.push({
      start: monthStart,
      end: monthEnd,
      index: 5 - i // Adjust index for the array (5,4,3,2,1,0 -> 0,1,2,3,4,5)
    });
  }
  
  // Process each event
  events.forEach(event => {
    if (!event.updatedAt) return;
    
    const eventDate = new Date(event.updatedAt);
    
    // Find which month this event belongs to
    const monthData = monthBoundaries.find(
      month => eventDate >= month.start && eventDate <= month.end
    );
    
    if (monthData) {
      if (event.verification_status === 'in_progress') {
        eventSubmissions[monthData.index]++;
      } else if (event.verification_status === 'approved') {
        eventApprovals[monthData.index]++;
      }
    }
  });
  
  // Process each task
  tasks.forEach(task => {
    if (!task.updatedAt) return;
    
    const taskDate = new Date(task.updatedAt);
    
    // Find which month this task belongs to
    const monthData = monthBoundaries.find(
      month => taskDate >= month.start && taskDate <= month.end
    );
    
    if (monthData) {
      if (task.status === 'ready_for_review') {
        taskSubmissions[monthData.index]++;
      } else if (task.status === 'approved') {
        approvedTasks[monthData.index]++;
      }
    }
  });
  
  return {
    labels: labels,
    datasets: {
      taskSubmissions: taskSubmissions,
      approvedTasks: approvedTasks,
      eventSubmissions: eventSubmissions,
      eventApprovals: eventApprovals
    }
  };
}