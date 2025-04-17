import StudentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import StudentFlightPlanTaskServices from '@/services/flightPlanServices/studentFlightPlanTaskServices';
import TaskServices from "@/services/flightPlanServices/taskServices";
import StudentFlightPlanExperienceTypeEventServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeEventServices";
import StudentFlightPlanExperienceTypeServices from "@/services/flightPlanServices/studentFlightPlanExperienceTypeServices";
import ExperienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import { getFlightPlan } from '@/utils/flightPlanGeneration';

export async function setFlightPlanComplete(studentFlightPlan) {
    studentFlightPlan.completion_date = new Date();
    StudentFlightPlanServices.updateSystemStudentFlightPlan(studentFlightPlan.id, studentFlightPlan)
}

export async function isStudentFlightPlanComplete(studentFlightPlan) {
    const studentFlightPlanTasks = await getStudentFlightPlanTasks(studentFlightPlan);
    const studentFlightPlanExperienceTypes = await getStudentFlightPlanExperienceTypes(studentFlightPlan);
    const studentFlightPlanTasksComplete = studentFlightPlanTasks.every(task => task.status === 'approved');
    const studentFlightPlanExperienceTypesComplete = studentFlightPlanExperienceTypes.every(experienceType => experienceType.experienceCompleted);
    return (studentFlightPlanTasksComplete && studentFlightPlanExperienceTypesComplete);
}

export async function getStudentFlightPlanTasks(studentFlightPlan) {
    const studentFlightPlanTasks = (await StudentFlightPlanTaskServices.getStudentFlightPlanTasks(studentFlightPlan.id)).data;
    const newSemesterTasks = [];

    for (const studentFlightPlanTask of studentFlightPlanTasks) {
        const task = await TaskServices.getTask(studentFlightPlanTask.taskId);
        newSemesterTasks.push({
            ...task.data,
            status: studentFlightPlanTask.status,
            unapprove_reason: studentFlightPlanTask.unapprove_reason,
            student_flight_plan_task_id: studentFlightPlanTask.id
        })
    }
    return newSemesterTasks;
}

export async function getStudentFlightPlanExperienceTypes(studentFlightPlan) {
    const studentEventIsComplete = (studentEvent) => studentEvent.status === 'approved';
    const studentFlightPlanExperienceTypes = (await StudentFlightPlanExperienceTypeServices.getAllExperienceTypesForStudentFlightPlan(studentFlightPlan.id)).data;
    const newSemesterExperienceTypes = [];

    for (const studentFlightPlanExperienceType of studentFlightPlanExperienceTypes) {
        const experienceType = (await ExperienceTypeServices.getExperienceType(studentFlightPlanExperienceType.experienceTypeId)).data;
        const studentFlightPlanExperienceTypeEvents = (await StudentFlightPlanExperienceTypeEventServices.getStudentFlightPlanExperienceTypeEvents(studentFlightPlanExperienceType.id)).data;
        newSemesterExperienceTypes.push({
            ...experienceType,
            experienceCompleted: studentFlightPlanExperienceTypeEvents.some(studentEventIsComplete),
        })
    }
    return newSemesterExperienceTypes;
}

export async function isStudentSemesterFlightPlanComplete(semester, student) {
    const flightPlan = await getFlightPlan(semester);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.id, flightPlan.id)).data;
    const currentFlightPlan = studentFlightPlan[0];
    return await isStudentFlightPlanComplete(currentFlightPlan);
}

export async function isStudentSemesterFlightPlanCompleteNotClaimed(semester, student) {
    const flightPlan = await getFlightPlan(semester);
    const studentFlightPlan = (await StudentFlightPlanServices.getAllStudentFlightPlans(student.id, flightPlan.id)).data;
    const currentFlightPlan = studentFlightPlan[0];
    if (!!currentFlightPlan.completion_date) {
        return false;
    }
    return await isStudentFlightPlanComplete(currentFlightPlan);
}