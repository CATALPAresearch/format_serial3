import Communication from "../scripts/communication";

export default {
	namespaced: true,

	state: {
		recommendations: [],
	},

	mutations: {
		setRecommendations(state, items) {
			state.recommendations = items;
		},

		addRecommendation(state, item) {
			state.recommendations.push(item);
		},

        markDone(state, index){
            state.recommendations[index].completed = true;
        },

		deleteRecommendation(state, item) {
			state.recommendations.splice(state.recommendations.indexOf(item), 1);
		},

		updateRecommendation(state, item) {
			const index = state.recommendations.findIndex(i => i.id === item.id);
			if (index >= 0) {
				state.recommendations.splice(index, 1, item);
			}
		},
	},

	getters: {
		getRecommendations(state) {
			return state.recommendations;
		},

        getCourseRecommendations(state) {
            return state.recommendations.filter((recommendation) => recommendation.type == 'scope_course');
        },

        getCourseUnitRecommendations(state) {
            return state.recommendations.filter((recommendation) => recommendation.type == 'scope_course_unit');
        },

        getActivityTypeRecommendations(state) {
            return state.recommendations.filter((recommendation) => recommendation.type == 'scope_activity_type');
        },

        getActivityRecommendations(state) {
            return state.recommendations.filter((recommendation) => recommendation.type == 'scope_activity');
        },
        
	},

	actions: {
		async getItems({commit, rootState}) {
            /*
			const response = await Communication.webservice(
				'get_recommendations',
				{
					'userid': 2,
					'course': 4,
				}
			);

			if (response.success) {
				commit('setItems', Object.values(JSON.parse(response.data)));
			} else {
				if (response.data) {
					console.log('No dashboard settings stored');
				} else {
					console.log('No connection to webservice /overview/');
				}
			}
            */
		},

	},
};