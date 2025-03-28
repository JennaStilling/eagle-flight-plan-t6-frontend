import studentMajorServices from "@/services/flightPlanServices/studentMajorServices";
import studentCliftonStrengthServices from "@/services/flightPlanServices/studentCliftonStrengthServices";
import taskServices from "@/services/flightPlanServices/taskServices";
import taskMajorServices from "@/services/flightPlanServices/taskMajorServices";
import taskCliftonStrengthServices from "@/services/flightPlanServices/taskCliftonStrengthServices";
import experienceTypeServices from "@/services/flightPlanServices/experienceTypeServices";
import experienceTypeMajorServices from "@/services/flightPlanServices/experienceTypeMajorServices";
import experienceTypeCliftonStrengthServices from "@/services/flightPlanServices/experienceTypeCliftonStrengthServices";
import majorServices from "@/services/flightPlanServices/majorServices";
import cliftonStrengthServices from "@/services/flightPlanServices/cliftonStrengthServices";
import studentFlightPlanServices from "@/services/flightPlanServices/studentFlightPlanServices";
import studentFlightPlanTaskServices from "@/services/flightPlanServices/studentFlightPlanTaskServices";
import studentExperienceTypeServices from "@/services/flightPlanServices/studentExperienceTypeServices";
import studentExperienceTypeEventServices from "@/services/flightPlanServices/studentExperienceTypeEventServices";
import semesterServices from "@/services/flightPlanServices/semesterServices";
import flightPlanServices from "@/services/flightPlanServices/flightPlanServices";

// Number of tasks and experiences default Needs to store this
let numOfTasksToAdd = 6;
let numOfExperiencesToAdd = 2;
let behindOffsetTask = 8;
let aheadOffsetTask = 4;
let behindOffsetExperience = 3;
let aheadOffsetExperience = 1;

export function setNumberOfTasks(numOfTasks, numOfExperiences, offset) {
    try {

    }
    catch (error) {
        console.log("Error, could not change the number of tasks per semester: " + error);
    }
}

// Generates a student flight plan for the semester
export async function generateFlightPlan(student) {
    try {
        const majors = (await majorServices.getAllMajors()).data;
        const allMajor = majors.filter(major => major.name === "All");
    
        const cliftonStrengths = (await cliftonStrengthServices.getAllCliftonStrengths()).data;
        const allCliftonStrengths = cliftonStrengths.filter(cliftonStrength => cliftonStrength.name === "All");
    
        const semestersUntilGrad = getSemestersUntilGraduation(student.graduation_date);
        
        // Get Major(s) (StudentMajor Bridge Table)
        const studentsMajors = (await studentMajorServices.getAllStudentMajors(student.id)).data;
        const allMajorObject = {
            id: null,
            majorId: allMajor[0].id,
            studentId: student.id
        };
        studentsMajors.push(allMajorObject); // Used to get the tasks that are for all majors
    
        // Get Clifton Strengths (StudentCliftonStrength Bridge Table)
        const studentsCliftonStrengths = (await studentCliftonStrengthServices.getAllStudentCliftonStrengths(student.id)).data;
        const allCliftonStrengthsObject = {
            id: null,
            cliftonStrengthId: allCliftonStrengths[0].id,
            studentId: student.id
        };
        studentsCliftonStrengths.push(allCliftonStrengthsObject); // Used to get the tasks that for all Clifton Strengths
        
        const elgibleTasks = await getPossibleTasks(student, studentsMajors, studentsCliftonStrengths);
        const elgibleExperiences = await getPossibleExperiences(student, studentsMajors, studentsCliftonStrengths);
    
        const tasks = (
            await Promise.all(
                elgibleTasks.map(task => taskServices.getTask(task.taskId))
            )
        ).map(res => res.data);
    
        const experiences = (
            await Promise.all(
                elgibleExperiences.map(experience => experienceTypeServices.getExperienceType(experience.experienceTypeId))
            )
        ).map(res => res.data);
        tasks.sort((a, b) => b.semester_from_grad - a.semester_from_grad);
        
        const oneTimeTasks = tasks.filter(task => task.schedule_type != 'semesterly');
        const semesterlyTasks = tasks.filter(task => task.schedule_type === 'semesterly');
    
        const oneTimeExperiences = experiences.filter(experience => experience.schedule_type != 'every_semester');
        const semesterlyExperiences = experiences.filter(experience => experience.schedule_type === 'every_semester');
    
        const highestSemester = Math.max(...oneTimeTasks.map(task => task.semester_from_grad));
    
        // Get previous flight plans to look for tasks that are prereqs
        const studentsFlightPlans = (await studentFlightPlanServices.getAllFlightPlansForStudent(student.id)).data;
        const studentsPreviousTasks = ((
            await Promise.all(
                studentsFlightPlans.map(studentFlightPlan => studentFlightPlanTaskServices.getStudentFlightPlanTasks(studentFlightPlan.id))
            )
        ).map(res => res.data)).flat();
    
        let tasksToFlightPlan;
        let experiencesToFlightPlan = [];
        if (highestSemester > semestersUntilGrad) { // Behind
            // If there are not enough tasks, just add the rest of them into this flight plan
            if (oneTimeTasks.length < behindOffsetTask) tasksToFlightPlan = await createTaskList(oneTimeTasks.length, oneTimeTasks, studentsPreviousTasks);
            else tasksToFlightPlan = await createTaskList(behindOffsetTask, oneTimeTasks, studentsPreviousTasks);
    
            if (oneTimeExperiences.length < behindOffsetExperience) experiencesToFlightPlan = createExperienceList(oneTimeExperiences.length, oneTimeExperiences);
            else experiencesToFlightPlan = createExperienceList(behindOffsetExperience, oneTimeExperiences);
        }
        else if (highestSemester < semestersUntilGrad) { // Ahead
            if (oneTimeTasks.length < aheadOffsetTask) tasksToFlightPlan = await createTaskList(oneTimeTasks.length, oneTimeTasks, studentsPreviousTasks);
            else tasksToFlightPlan = await createTaskList(aheadOffsetTask, oneTimeTasks, studentsPreviousTasks);
    
            if (oneTimeExperiences.length < aheadOffsetExperience) experiencesToFlightPlan = createExperienceList(oneTimeExperiences.length, oneTimeExperiences);
            else experiencesToFlightPlan = createExperienceList(aheadOffsetExperience, oneTimeExperiences);
        }
        else { // On Pace
            if (oneTimeTasks.length < numOfTasksToAdd) tasksToFlightPlan = await createTaskList(oneTimeTasks.length, oneTimeTasks, studentsPreviousTasks);
            else tasksToFlightPlan = await createTaskList(numOfTasksToAdd, oneTimeTasks, studentsPreviousTasks);
    
            if (oneTimeExperiences.length < numOfExperiencesToAdd) experiencesToFlightPlan = createExperienceList(oneTimeExperiences.length, oneTimeExperiences);
            else experiencesToFlightPlan = createExperienceList(numOfExperiencesToAdd, oneTimeExperiences);
        }
    
        tasksToFlightPlan = tasksToFlightPlan.concat(semesterlyTasks);
        experiencesToFlightPlan = experiencesToFlightPlan.concat(semesterlyExperiences);
    
        tasksToFlightPlan = Array.from( new Map(tasksToFlightPlan.map(item => [item.id, item])).values() );
        experiencesToFlightPlan = Array.from( new Map(experiencesToFlightPlan.map(item => [item.id, item])).values() );
    
        // Create the flight plan and assign the correct number of tasks/experiences depending on their pace
        const semester = await getSemester();
        const flightPlan = await getFlightPlan(semester);
        const studentFlightPlan = (await studentFlightPlanServices.createStudentFlightPlan(student.id, flightPlan.id, {})).data;

        await addTasksToStudentFlightPlan(studentFlightPlan, tasksToFlightPlan);
        await addExperiencesToStudent(student, experiencesToFlightPlan);
    }
    catch (error) {
        console.log("Error, could not generate a flight plan for student: " + error);
    }
}

// Gets the current FlightPlan, if it does not exist, it creates one
export async function getFlightPlan(semester) {
    try {
        const flightPlans = (await flightPlanServices.getAllFlightPlans(semester.id)).data;
    
        if (flightPlans.length < 1) { // Meaning there is no flight plan in the database
            const res = await flightPlanServices.createFlightPlan(semester.id, {});
            flightPlans.push(res.data);
        }

        return flightPlans[0];
    }
    catch (error) {
        console.log("Error, could not get Flight Plan: " + error);
    }
}

// Gets the current semester, if it does not exist, it creates one
export async function getSemester() {
    try {
        const currentDate = new Date();
        const semesters = (await semesterServices.getAllSemesters()).data;

        const currentSemester = semesters.filter(semester => semester.start_date < currentDate.toISOString() && currentDate.toISOString() < semester.end_date);
        if (currentSemester.length < 1) { // Meaning there is no current semester in the database
            const month = currentDate.getUTCMonth() + 1; // Offset
            const year = currentDate.getUTCFullYear();
            let semester;
            if (month > 1 && month < 5) {
                semester = {
                    name: "Spring " + year,
                    start_date: new Date(year + "-01-15"),
                    end_date: new Date(year + "-05-10")
                }
            }
            else if(month > 8 && month < 12) {
                semester = {
                    name: "Fall " + year,
                    start_date: new Date(year + "-09-01"),
                    end_date: new Date(year + "-12-15")
                }
            }

            const res = await semesterServices.createSemester(semester);
            currentSemester.push(res.data);
        }

        return currentSemester[0];
    }
    catch (error) {
        console.log("Error, could not get current semester: " + error);
    }
}

// Return the number of semesters the student has left until graduation
function getSemestersUntilGraduation(date) {
    const gradDate = new Date(date);
    const today = new Date();
    
    let count = 0;
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // Offset

    while (year < gradDate.getFullYear() || (year === gradDate.getFullYear() && month <= 5)) {
            // Spring Semester
            if (month <= 5) {
            count++;
            month = 8;
            } 
            // Fall semester
            else {
            count++;
            year++; 
            month = 1; 
            }
    }

    return count;
}

// Return a list of elgible tasks that meet the students majors and Clifton Strengths
async function getPossibleTasks(student, studentsMajors, studentCliftonStrengths) {
    try {
        const allTasksByMajor = (await taskMajorServices.getAllTaskMajors()).data;
        const applicableTasksFromMajors = allTasksByMajor.filter(task => studentsMajors.some(major => task.majorId === major.majorId));

        const allTasksByCliftonStrengths = (await taskCliftonStrengthServices.getAllTaskCliftonStrengths()).data;
        const applicableTasksFromCliftonStrengths = allTasksByCliftonStrengths.filter(task => studentCliftonStrengths.some(strength => task.cliftonStrengthId === strength.cliftonStrengthId));

        const combinedTaskList = applicableTasksFromMajors.concat(applicableTasksFromCliftonStrengths);

        const allElgibleTasks = Array.from( new Map(combinedTaskList.map(item => [item.taskId, item])).values() );

        const studentsFlightPlans = (await studentFlightPlanServices.getAllFlightPlansForStudent(student.id)).data;

        const studentFlightPlanTasks = ((
            await Promise.all(
                studentsFlightPlans.map(studentFlightPlan => studentFlightPlanTaskServices.getStudentFlightPlanTasks(studentFlightPlan.id))
            )
        ).map(res => res.data)).flat();

        const completedTasks = studentFlightPlanTasks.filter(task => task.status === 'approved');
        
        const tasksToRemove = new Set(completedTasks.map(item => item.taskId));
        const incompleteElgibleTasks = allElgibleTasks.filter(item => !tasksToRemove.has(item.taskId));

        return incompleteElgibleTasks;
    }
    catch (error) {
        console.log("Error, could not retreive all elgible tasks: " + error);
    }

}

// Return a list of elgible experiences that meet the students majors and Clifton Strengths
async function getPossibleExperiences(student, studentsMajors, studentCliftonStrengths) {
    try {
        const allExperiencesByMajor = (await experienceTypeMajorServices.getAllExperienceTypeMajors()).data;
        const applicableExperiencesFromMajors = allExperiencesByMajor.filter(experience => studentsMajors.some(major => experience.majorId === major.majorId));

        const allExperiencesByCliftonStrengths = (await experienceTypeCliftonStrengthServices.getAllExperienceTypeCliftonStrengths()).data;
        const applicableExperienesFromCliftonStrengths = allExperiencesByCliftonStrengths.filter(experience => studentCliftonStrengths.some(strength => experience.cliftonStrengthId === strength.cliftonStrengthId));

        const combinedExperienceList = applicableExperiencesFromMajors.concat(applicableExperienesFromCliftonStrengths);
        
        const allElgibleExperiences = Array.from( new Map(combinedExperienceList.map(item => [item.experienceTypeId, item])).values() );
        
        const studentExperiences = (await studentExperienceTypeServices.getAllExperienceTypesForStudent(student.id)).data;

        const studentEvents = (
            await Promise.all(
                studentExperiences.map(studentExperience => studentExperienceTypeEventServices.getStudentExperienceTypeEvents(studentExperience.id))
            )
        ).map(res => res.data).flat();

        const completedEvents = studentEvents.filter(experience => experience.status === 'approved');
        const completedExperiences = studentExperiences.filter(experience => completedEvents.some(event => event.studentExperienceTypeId === experience.id));

        const experiencesToRemove = new Set(completedExperiences.map(item => item.experienceTypeId));
        const incompleteElgibleExperience = allElgibleExperiences.filter(item => !experiencesToRemove.has(item.experienceTypeId));

        return incompleteElgibleExperience;
    }
    catch (error) {
        console.log("Error, could not get all elgible experiences: " + error);
    }
}

async function createTaskList(numOfTasks, availableTasks, studentsPreviousTasks) {
    try {
        const tasksToFlightPlan = [];
        const addedTaskIds = new Set(); // Tracks the tasks IDs to see if a prereq task has been added or not
        let trackNumberOfTasks = numOfTasks;
    
        for (let i = 0; i < numOfTasks; i++) {
            const task = availableTasks[i];
            if (!task.taskId) {
                tasksToFlightPlan.push(task);
                continue;
            }

            if (addedTaskIds.has(task.taskId)) {
                tasksToFlightPlan.push(task);
                continue;
            }

            const prereqTask = studentsPreviousTasks.find(preTask => preTask.taskId === task.taskId);
            if (await shouldFetchPrereqTask(prereqTask)) {
                const fetchedTask = (await taskServices.getTask(task.taskId)).data;
                tasksToFlightPlan.push(fetchedTask);
                addedTaskIds.add(fetchedTask.id);
                adjustTaskCount(trackNumberOfTasks, numOfTasks);
            }

            tasksToFlightPlan.push(task);
        }
    
        return tasksToFlightPlan;
    } catch (error) {
        console.log("Error, could not create a list of tasks: " + error);
    }
}

// Checks to see if there is a prereq task and if it has been completed or not
async function shouldFetchPrereqTask(prereqTask) {
    if (!prereqTask) return true;
    return prereqTask.status !== 'approved';
}

// Adjusts the number of tasks added to the list depending on if there are prereqs
function adjustTaskCount(trackNumberOfTasks, numOfTasks) {
    if (trackNumberOfTasks >= numOfTasks) {
        numOfTasks--;
    } else {
        trackNumberOfTasks++;
    }
}

// Returns a list of experience that will be added to this semester's flight plan
function createExperienceList(numOfExperiencesToAdd, oneTimeExperiences) {
    const experiencesToFlightPlan = [];

    for (let i = 0; i < numOfExperiencesToAdd; i++) {
        experiencesToFlightPlan.push(oneTimeExperiences[i]);
    }

    return experiencesToFlightPlan;
}

// Add the tasks to the students flight plan
async function addTasksToStudentFlightPlan(studentFlightPlan, tasksToFlightPlan) {
    try {
        const template = {
            studentFlightPlanId: studentFlightPlan.id,
            taskId: null,
            points_earned: null,
            completed_date: null,
            unapprove_reason: null,
            status: 'in_progress',
            reflection: null,
        }
    
        for (let i = 0; i < tasksToFlightPlan.length; i++) {
            template.taskId = tasksToFlightPlan[i].id;
            await studentFlightPlanTaskServices.createSystemStudentFlightPlanTask(template)
        }
    }
    catch (error) {
        console.log("Error, could not add tasks to student's Flight Plan: " + error);
    }
}

// Add the experiences to the students flight plan
async function addExperiencesToStudent(student, experiencesToFlightPlan) {
    try {
        const template = {
            studentId: student.id,
            experienceTypeId: null
        }
        for (let i = 0; i < experiencesToFlightPlan.length; i++) {
            template.experienceTypeId = experiencesToFlightPlan[i].id;
            await studentExperienceTypeServices.createSystemStudentExperienceType(template);
        }
    }
    catch (error) {
        console.log("Error, could not add Experiences to Student's Plan: " + error);
    }
}