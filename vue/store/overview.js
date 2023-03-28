import {ajax} from './store';
import {groupBy} from "../scripts/util";


export default {

	namespaced: true,

	state: {
		courseData: null,
		currentSection: -1,
		currentActivities: null,
		activityTypes: [],
		sectionNames: [],
	},

	mutations: {
		setCurrentSection(state, section) {
			state.currentSection = section;
		},
		setCourseData(state, data) {
			state.courseData = data;
		},
		setCurrentActivities(state, data) {
			state.currentActivities = data;
		},
		setActivityTypes(state, data) {
			state.activityTypes = data;
		},
	},

	getters: {
		getSections: function(state){
			return groupBy(state.courseData, 'section');
		},
		getActivities: function(state){
			return groupBy(state.courseData, 'type');
		},
		getCurrentActivities: function(state) {
			if (state.currentSection === -1) {
				return state.getActivities;
			} else {
				return groupBy(state.getSections[state.currentSection], 'type');
			}
		},
		getUrlById: (state) => (id) => {
			const bla = Object.values(state.courseData).find(object => object.id === id);
			return bla.url;
		},
		getTotalNumberOfActivities: function(state) {
			return Object.keys(state.courseData).length;
		}
	},

	actions: {
		async updateRating({commit, rootState}, newVal) {
			try {
				await ajax("format_ladtopics_setUserUnderstanding", {
					course: Number(rootState.courseid),
					activityid: this.activity.id,
					rating: newVal,
				});
				commit('updateActivity', newVal);
			} catch (error) {
				console.error(error);
			}
		},

		async toggleItem({ commit }, task) {
			const completed = 1 - task.completed;
			const updatedTask = { ...task, completed: completed };

			await ajax('format_ladtopics_toggleTodoItem', {
				id: task.id,
				duedate: task.duedate,
				completed:  completed
			});

			commit('updateItem', updatedTask);
		},
	},
};