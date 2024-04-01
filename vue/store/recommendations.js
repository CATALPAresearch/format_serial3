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
        async loadRecommentations({commit, rootState}) {
            let _this = this;
            
            // save to indexeddb
            let openRequest = indexedDB.open("ari_prompts", 2);

            // create/upgrade the database without version checks
            openRequest.onupgradeneeded = function () {
                let db = openRequest.result;
                if (!db.objectStoreNames.contains('prompts')) {
                    //db.createObjectStore('prompts', {keyPath: 'id'}); 
                }
            };

            openRequest.onsuccess = function () {
                let db = openRequest.result;

                db.onversionchange = function () {
                    db.close();
                    console.error(this.name, "ERROR: Database is outdated, please reload the page.")
                };
                try {
                    let transaction = db.transaction("prompts", "readwrite").objectStore("prompts");

                    let request = transaction.getAll();

                    request.onsuccess = function () {
                        for (let rec in request.result) {
                            let item = request.result[rec];
                            _this.commit('recommendations/addRecommendation', {
                                id: item.id,
                                type: item.type,
                                category: item.category,
                                title: item.title,
                                description: item.message,
                                timecreated: item.timecreated,
                            });
                        }
                    };

                    request.onerror = function () {
                        console.error(this.name, "SERIAL3: Error reading prompts", request.error);
                    };
                } catch(e){
                    console.warn(this.name, 'Store not existing');
                }
            }
        },

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