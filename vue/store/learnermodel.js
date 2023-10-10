import Communication from "../scripts/communication";

export default {
	namespaced: true,

	state: {
		userUnderstanding: null,
		proficiency: 0,
		userGrade: 0,
		totalGrade: 0,
		progressUnderstanding: 0,
		timeManagement: 0,
		socialActivity: 0,
		thresholds: {
			"master": {
				"grades": [],
				"proficiency": [70, 85, 100],
				"progress": [75, 90, 100],
				"timeManagement": [70, 85, 100],
				"socialActivity": []
			},
			"passing": {
				"grades": [],
				"proficiency": [50, 70, 100],
				"progress": [50, 70, 100],
				"timeManagement": [40, 70, 100],
				"socialActivity": []
			},
			"overview": {
				"grades": [],
				"proficiency": [20, 40, 100],
				"progress": [40, 50, 100],
				"timeManagement": [20, 40, 100],
				"socialActivity": []
			},
			"practice": {
				"grades": [],
				"proficiency": [30, 60, 100],
				"progress": [30, 60, 100],
				"timeManagement": [50, 75, 100],
				"socialActivity": []
			}
		}
	},

	mutations: {
		setUserUnderstanding(state, data) {
			state.userUnderstanding = data;
		},
		setProficiency(state, data) {
			state.proficiency = data;
		},
		setProgressUnderstanding(state, data) {
			state.progressUnderstanding = data;
		},
		setTimeManagement(state, data) {
			state.timeManagement = data;
		},
		setSocialActivity(state, data) {
			state.socialActivity = data;
		},
		setUserGrade(state, data) {
			state.userGrade = data;
		},
		setTotalGrade(state, data) {
			state.totalGrade = data;
		},
		setSocialActivityThresholds(state, thresholds) {
			state.thresholds = {
				...state.thresholds,
				...{
					master: {
						...state.thresholds.master,
						...{ socialActivity: thresholds },
					},
					passing: {
						...state.thresholds.passing,
						...{ socialActivity: [
								thresholds[0] / 2,
								thresholds[1] / 2,
								thresholds[2]
							] },
					},
					overview: {
						...state.thresholds.overview,
						...{ socialActivity: [
								thresholds[0] / 2,
								thresholds[1] / 2,
								thresholds[2]
							] },
					},
					practice: {
						...state.thresholds.practice,
						...{ socialActivity: [
								thresholds[0] / 2,
								thresholds[1] / 2,
								thresholds[2]
							] },
					},
				},
			};
		},
	},

	getters: {
		getUserUnderstanding: function (state) {
			return state.userUnderstanding;
		},
	},

	actions: {
		/**
		 * Fetches data for each user about their understanding of the course.
		 */
		async loadUserUnderstanding(context) {
			const response = await Communication.webservice(
				'get_user_understanding',
				{course: context.rootState.courseid}
			);

			if (response.success) {
				context.commit('setUserUnderstanding', JSON.parse(response.data));
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /get_user_understanding/', response.data);
				} else {
					console.log('No connection to webservice /get_user_understanding/');
				}
			}
		},

		async calculateLearnerModel(context) {
			await context.dispatch('calculateTimeManagement');
			//await context.dispatch('calculateSocialActivity');
			await context.dispatch('calculateGrades');
			await context.dispatch('calculateProgress');
			await context.dispatch('calculateProficiency');
			// 	@TODO: add self-assessment score
		},

		/**
		 * Calculates the users understanding of the topics.
		 * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points one
		 * can achieve in the topics covered so far
		 */
		async calculateProficiency(context) {
			
			if(context.state.userUnderstanding != null){
				const total = Object.keys(context.state.userUnderstanding).length * 3;
				const user = Object.values(context.state.userUnderstanding).reduce((acc, cur) => acc + Number(cur.rating), 0);
				context.commit('setProficiency', user / total * 100);
			}
			
		},

		/**
		 * Calculates the users progress in the course based on their understanding of the topics.
		 * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points
		 * one can achieve in total in the course.
		 */
		async calculateProgress(context) { 
			const total = context.rootGetters['overview/getTotalNumberOfActivities'];
			if(context.state.userUnderstanding != null){ // if understanding data is available
				const user = Object.values(context.state.userUnderstanding).reduce((acc, cur) => acc + 1, 0);
				context.commit('setProgressUnderstanding', user / total * 100);
			}
			

		},

		/**
		 * Time management: Calculates score from missed assignments compared to total assignments
		 * @TODO: Include missed quizzes and missed task deadlines; inlucde timeliness of doing these activities
		 */
		async calculateTimeManagement(context) {
			let response = await Communication.webservice(
				'get_missed_activities',
				{course: context.rootGetters.getCourseid}
			);
			if (response.success) {
				response = Object.values(JSON.parse(response.data));
				const missed_assignments = response[0].num_missed_assignments;
				const total_assignments = response[0].total_assignments;
				context.commit('setTimeManagement', missed_assignments / total_assignments * 100);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /get_missed_activities/', response.data);
				} else {
					console.log('No connection to webservice /get_missed_activities/');
				}
			}
		},

		/**
		 * Calculates social interaction score based on the number of forum posts
		 *
		 * @TODO: Include number of shared resources once the resource list is implemented
		 */
		async calculateSocialActivity(context) {
			let response = await Communication.webservice(
				'get_forum_posts',
				{ course: context.rootGetters.getCourseid }
			);

			if (response.success) {
				response = Object.values(JSON.parse(response.data));
				const numberOfUserPosts = response[0].user_posts;
				const numberOfAvgPosts = response[0].avg_posts_per_person;
				const minPosts = response[0].min_user_posts;
				const maxPosts = response[0].max_user_posts;

				const thresholds = [
					minPosts,
					numberOfAvgPosts,
					maxPosts
				];

				context.commit('setSocialActivityThresholds', thresholds);
				context.commit('setSocialActivity', numberOfUserPosts);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /get_forum_posts/', response.data);
				} else {
					console.log('No connection to webservice /get_forum_posts/');
				}
			}
		},


		/**
		 * Calculates grades score based on the number of forum posts
		 */
		async calculateGrades(context) {
			let quizzes = await Communication.webservice(
				'get_quizzes',
				{
					course: context.rootGetters.getCourseid,
				}
			);

			if (quizzes.success) {
				quizzes = JSON.parse(quizzes.data);
			} else {
				if (quizzes.data) {
					console.log('Faulty response of webservice /get_quizzes/', quizzes.data);
				} else {
					console.log('No connection to webservice /get_quizzes/');
				}
			}

			let assignments = await Communication.webservice(
				'get_assignments',
				{
					course: context.rootGetters.getCourseid,
				}
			);

			if (assignments.success) {
				assignments = JSON.parse(assignments.data);
			} else {
				if (assignments.data) {
					console.log('Faulty response of webservice /get_assignments/', assignments.data);
				} else {
					console.log('No connection to webservice /get_assignments/');
				}
			}

			const userGrades = [...Object.values(quizzes), ...Object.values(assignments)];

			const totalPoints = userGrades.reduce((sum, item) => {
				return sum + Number(item.max_grade);
			}, 0);

			const userPoints = userGrades.reduce((sum, item) => {
				return sum + Number(item.user_grade);
			}, 0);

			context.commit('setUserGrade', userPoints);
			context.commit('setTotalGrade', totalPoints);
		},
	},
};