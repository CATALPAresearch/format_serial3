import Vue from 'vue';
import Vuex from 'vuex';
import moodleAjax from 'core/ajax';
import moodleStorage from 'core/localstorage';
import Notification from 'core/notification';
import $ from 'jquery';

import dashboardSettings from './dashboardSettings';
import taskList from './taskList';
import overview from './overview';
import learnermodel from './learnermodel';
import Communication from "../scripts/communication";
import recommendations from "./recommendations";

Vue.use(Vuex);

export const store = new Vuex.Store({
	name: 'store',
	modules: {
		dashboardSettings,
		learnermodel,
		overview,
		taskList,
		recommendations,
	},

	state: {
		pluginName: '',
		courseModuleID: 0,
		contextID: 0,
		courseid: 0,
		userid: -1,
		research_condition: 'control_group',
		aple1801courses: [2, 5, 8, 9, 20, 24, 26, 42],
		surveyRequired: false,
		surveyLink: '',
		questionnaireid: { 2: 0, 5: 0, 8: 0, 9: 0, 20: 0, 24: 0, 26: 1659, 42: 4046 },

		isModerator: false,
		policyAccepted: false,
		url: '',
		title: '',
		strings: {},
		alert: {
			show: false,
			type: 'primary',
			message: 'unknown'
		},
		confValue: '',
		learnerGoal: 'passing',
	},

	mutations: {
		setResearchCondition(state){
			// assign user to the control group if their user id is even 
			state.research_condition = state.userid % 2 == 0 ? 'control_group' : 'treatment_group';
			// do not assign user to the control group if they are not in the course 24 (operating systems etc.)
			state.research_condition = is1801Course() ? state.research_condition : 'control_group';
			// do not assign user to the control group if they are accessing the system on localhost
			state.research_condition = window.location.hostname == 'localhost' ? 'treatment_group' : state.research_condition;
			//state.research_condition = window.location.hostname == 'localhost' ? 'control_group' : state.research_condition;
		},
		setCourseid(state, val) {
			state.courseid = val;
		},
		setisModerator(state, val) {
			state.isModerator = val;
		},
		setUserid(state, val) {
			state.userid = val;
		},
		setPolicyAccepted(state, val) {
			state.policyAccepted = val;
		},
		setConfigValue(state, value) {
			state.confValue = value;
		},
		setPluginName(state, name) {
			state.pluginName = name;
		},
		setModerator(state, isModerator) {
			state.isModerator = isModerator;
		},
		setCourseModuleID(state, id) {
			state.courseModuleID = id;
		},
		setContextID(state, id) {
			state.contextID = id;
		},
		setStrings(state, strings) {
			state.strings = strings;
		},
		showAlert(state, [type, message]) {
			const timeout = 3000;
			state.alert.type = type;
			state.alert.message = message;
			state.alert.show = true;
			new Promise(
				resolve => setTimeout(resolve, timeout)
			).then(
				(resolve) => {
					state.alert.show = false;
					state.alert.type = "primary";
					state.message = "unknown";
				}
			);
		},
		setLearnerGoal(state, goal) {
			state.learnerGoal = goal;
		},
	},

	getters: {
		is1801Course: function(state){
			return state.aple1801courses.includes(parseInt(state.courseid,10)) ? true : false;
		},
		getCourseid: function (state) {
			return state.courseid;
		},
		getisModerator: function (state) {
			return state.isModerator;
		},
		getUserid: function (state) {
			return state.userid;
		},
		getPolicyAccepted: function (state) {
			return state.policyAccepted;
		},
		getConfigValue: function (state) {
			return state.confValue;
		},
		getModeratorStatus: function (state) {
			return state.isModerator;
		},
		getAlertType: function (state) {
			return `alert-${state.alert.type}`;
		},
		getAlertState: function (state) {
			return state.alert.show;
		},
		getAlertMessage: function (state) {
			return state.alert.message;
		},
		getContextID: function (state) {
			return state.contextID;
		},
		getCourseModuleID: function (state) {
			return state.courseModuleID;
		},
		getPluginName: function (state) {
			return state.pluginName;
		},
		getCMID: function (state) {
			return state.courseModuleID;
		},
		getLearnerGoal: function (state) {
			return state.learnerGoal;
		},
	},
	actions: {
		/**
		 * Fetches the i18n data for the current language.
		 *
		 * @param context
		 * @returns {Promise<void>}
		 */
		async loadComponentStrings(context) {
			const lang = $('html').attr('lang').replace(/-/g, '_');
			const cacheKey = 'format_serial3/strings/' + lang;
			const cachedStrings = moodleStorage.get(cacheKey);
			if (cachedStrings) {
				context.commit('setStrings', JSON.parse(cachedStrings));
			} else {
				const request = {
					methodname: 'core_get_component_strings',
					args: {
						'component': 'format_serial3',
						lang,
					},
				};
				const loadedStrings = await moodleAjax.call([request])[0];
				let strings = {};
				loadedStrings.forEach((s) => {
					strings[s.stringid] = s.string;
				});
				context.commit('setStrings', strings);
				moodleStorage.set(cacheKey, JSON.stringify(strings));
			}
		},

		/**
		 * Gets the users learning goal..
		 *
		 * @param context
		 * @returns {Promise<void>}
		 */
		async fetchLearnerGoal(context) {
			const response = await Communication.webservice(
				'get_learner_goal',
				{
					'course': Number(context.state.courseid),
				}
			);
			if (response.success) {
				context.commit('setLearnerGoal', JSON.parse(response.data));
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /set_learner_goal/', response.data);
				} else {
					console.log('No connection to webservice /set_learner_goal/');
				}
			}
		},

		/**
		 * Updates the users learning goal.
		 *
		 * @param context
		 * @returns {Promise<void>}
		 */
		async updateLearnerGoal(context, goal) {
			const response = await Communication.webservice(
				'set_learner_goal',
				{
					'course': Number(context.state.courseid),
					'goal': goal,
				}
			);
			if (response.success) {
				context.commit('setLearnerGoal', goal);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /set_learner_goal/', response.data);
				} else {
					console.log('No connection to webservice /set_learner_goal/');
				}
			}
		},
	},
});

/**
 * Single ajax call to Moodle.
 */
export async function ajax(method, args) {
	const request = {
		methodname: method,
		args: args,
	};

	try {
		return await moodleAjax.call([request])[0];
	} catch (e) {
		Notification.exception(e);
		throw e;
	}
}
