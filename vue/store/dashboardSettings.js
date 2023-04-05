import Communication from "../scripts/communication";

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
			const response = await Communication.webservice(
				'save_dashboard_settings',
				{
					'userid': Number(context.rootState.userid),
					'course': Number(context.rootState.courseid),
					'settings': settings
				}
			);
			if (!response.success) {
				if (response.data) {
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
				}
			}
		},

		/**
		 * Gets users' dashboard settings.
		 *
		 * @param context
		 *
		 * @returns {Promise<void>}
		 */
		async getDashboardSettings(context) {
			const response = await Communication.webservice(
				'get_dashboard_settings',
				{
					'userid': Number(context.rootState.userid),
					'course': Number(context.rootState.courseid),
				}
			);

			if (response.success) {
				response.data = JSON.parse(response.data);
				context.commit('setDashboardSettings', JSON.parse(response.data.settings));
			} else {
				if (response.data) {
					console.log('No dashboard settings stored');
				} else {
					console.log('No connection to webservice /overview/');
				}
			}
		}
	},
};