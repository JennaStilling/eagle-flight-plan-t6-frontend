import TaskServices from "@/services/flightPlanServices/taskServices";
import EventServices from "@/services/flightPlanServices/eventServices";
import ExperienceServices from "@/services/flightPlanServices/experienceTypeServices";

export async function getRecommendedEventsForTask(pTask) {
  try {
    const task = await TaskServices.getTask(pTask.id);
    const currentTaskCategory = task.data.category;
    
    const events = await EventServices.getAllEvents();
    const allEvents = events.data;
    
    let recommendedEvents = [];
    
    switch (currentTaskCategory) {
      case "academic":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" || 
            event.event_type == "academic"
        );
        break;
      case "leadership":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "lunch_and_learn" ||
            event.event_type == "galup_strengths_class" ||
            event.event_type == "mentoring"
        );
        break;
      case "networking":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" ||
            event.event_type == "career_fair" ||
            event.event_type == "lunch_and_learn" ||
            event.event_type == "academic"
        );
        break;
      case "strengths":
        recommendedEvents = allEvents.filter(
          (event) => event.event_type == "galup_strengths_class"
        );
        break;
      case "career":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" ||
            event.event_type == "academic" ||
            event.event_type == "career_fair" ||
            event.event_type == "career_services"
        );
        break;
      case "mentoring":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "mentoring" || 
            event.event_type == "career_services" || 
            event.event_type == "lunch_and_learn"
        );
        break;
      case "volunteer":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "volunteer"
        );
        break;
      case "other":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" || event.event_type == "extra_curricular"
        );
        break;
    }
    
    console.log(currentTaskCategory);
    console.log(recommendedEvents);

    recommendedEvents.sort((a, b) => {
    const dateA = new Date(a.start_date_time);
    const dateB = new Date(b.start_date_time);
    return dateA - dateB;
    });

    return recommendedEvents;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function getRecommendedEventsForExperience(pExperience) {
  try {
    const experience = await ExperienceServices.getExperienceType(pExperience);
    const currentExperienceCategory = experience.data.category;

    const events = await EventServices.getAllEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0)
    const eventsAfterToday = (event) => new Date(event.date) >= today
    const allEvents = events.data.filter(eventsAfterToday);

    let recommendedEvents = [];

    switch (currentExperienceCategory) {
      case "academic":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" || event.event_type == "academic"
        );
        break;
      case "leadership":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "lunch_and_learn" ||
            event.event_type == "galup_strengths_class" ||
            event.event_type == "mentoring"
        );
        break;
      case "networking":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" ||
            event.event_type == "career_fair" ||
            event.event_type == "lunch_and_learn" ||
            event.event_type == "academic"
        );
        break;
      case "strengths":
        recommendedEvents = allEvents.filter(
          (event) => event.event_type == "galup_strengths_class"
        );
        break;
      case "career":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" ||
            event.event_type == "academic" ||
            event.event_type == "career_fair" ||
            event.event_type == "career_services"
        );
        break;
      case "mentoring":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "mentoring" ||
            event.event_type == "career_services" ||
            event.event_type == "lunch_and_learn"
        );
        break;
      case "volunteer":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "volunteer"
        );
        break;
      case "other":
        recommendedEvents = allEvents.filter(
          (event) =>
            event.event_type == "club" || event.event_type == "extra_curricular"
        );
        break;
    }

    console.log(currentExperienceCategory);
    console.log(recommendedEvents)

    recommendedEvents.sort((a, b) => {
      const dateA = new Date(a.start_date_time);
      const dateB = new Date(b.start_date_time);
    return dateA - dateB;
    });

    return recommendedEvents;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
