import {ajax} from "./store";

export default {
	namespaced: true,

	state: {
		dashboardSettings: [],
	},

	mutations: {
		setDashboardSettings(state, data) {
			state.dashboardSettings = data;
		},
	},

	actions: {
		/**
		 * Saves dashboard settings.
		 *
		 * @param context
		 * @param settings
		 *
		 * @returns {Promise<void>}
		 */
		async saveDashboardSettings(context, settings) {
			const payload = {
				userid: Number(context.state.userid),
				course: Number(context.state.courseid),
				settings: settings
			};
			try {
				await ajax('format_ladtopics_saveDashboardSettings', payload);
			} catch (error) {
				console.error(error);
			}
		},

		/**
		 * Fetch dashbaord settings.
		 *
		 * @param context
		 *
		 * @returns {Promise<void>}
		 */
		async fetchDashboardSettings(context) {
			const payload = {
				userid: Number(context.state.userid),
				course: Number(context.state.courseid),
			};
			const response =  await ajax('format_ladtopics_fetchDashboardSettings', payload);

			if (response.success) {
				response.data = JSON.parse(response.data);
				context.commit('setDashboardSettings',  JSON.parse(response.data.settings));
			} else {
				if (response.data) {
					console.log('No dashboard settings stored');
				} else {
					console.log('No connection to webservice /overview/');
				}
			}
		},
	},
};