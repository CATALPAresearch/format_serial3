import {groupBy} from "../scripts/util";
import Communication from "../scripts/communication";


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
			// TODO: filter for a limited ste of activity types
			var allowedActivitities = ['questionnaire', 'hypervideo', 'longpage', 'assignment'];
			var filtered = Object.values(data)
				/*.filter( type  => data.includes(type) && type == 'hypervideo')
				.reduce((obj, key) => {
					obj[key] = users[key];
					return obj;
			}, {});*/
			console.log('ffff', filtered);
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
		getSections: function (state) {
			return groupBy(state.courseData, 'section');
		},
		getActivities: function (state) {
			return groupBy(state.courseData, 'type');
		},
		getCurrentActivities: function (state) {
			if (state.currentSection === -1) {
				return state.getActivities;
			} else {
				return groupBy(state.getSections[state.currentSection], 'type');
			}
		},
		getUrlById: (state) => (id) => {
			const activity = Object.values(state.courseData).find(object => object.id === id);
			return activity.url;
		},
		getTotalNumberOfActivities: function (state) {
			return Object.keys(state.courseData).length;
		},
	},

	actions: {
		async updateUnderstanding({commit, rootState}, newVal) {
			const response = await Communication.webservice(
				'set_user_understanding',
				{
					'course': Number(rootState.courseid),
					'activityid': this.activity.id,
					'rating': newVal,
				}
			);
			if (response.success) {
				commit('updateActivity', newVal);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
				}
			}
		},
	},
};