import Communication from "../scripts/communication";

export default {
	namespaced: true,

	state: {
		userUnderstanding: null,
		mastery: 0,
		userGrade: 0,
		totalGrade: 0,
		progressUnderstanding: 0,
		timeManagement: 0,
		socialActivity: 0,
	},

	mutations: {
		setUserUnderstanding(state, data) {
			state.userUnderstanding = data;
		},
		setMastery(state, data) {
			state.mastery = data;
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
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
				}
			}
		},

		async calculateLearnerModel(context) {
			await context.dispatch('calculateTimeManagement');
			await context.dispatch('calculateSocialActivity');
			await context.dispatch('calculateGrades');
			await context.dispatch('calculateProgress');
			await context.dispatch('calculateMastery');
		},

		/**
		 * Calculates the users understanding of the topics.
		 * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points one
		 * can achieve in the topics covered so far
		 */
		async calculateMastery(context) {
			const total = Object.keys(context.state.userUnderstanding).length * 3;
			const user = Object.values(context.state.userUnderstanding).reduce((acc, cur) => acc + Number(cur.rating), 0);
			context.commit('setMastery', user / total * 100);
		},

		/**
		 * Calculates the users progress in the course based on their understanding of the topics.
		 * Count of users understanding: 1 for weak, 2 for ok, 3 for strong divided by optimal number of points
		 * one can achieve in total in the course.
		 */
		async calculateProgress(context) {
			const total = context.rootGetters['overview/getTotalNumberOfActivities'] * 3;
			const user = Object.values(context.state.userUnderstanding).reduce((acc, cur) => acc + Number(cur.rating), 0);
			context.commit('setProgressUnderstanding', user / total * 100);
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
		 * @TODO: Include number of shared resources
		 */
		async calculateSocialActivity(context) {
			let response = await Communication.webservice(
				'get_forum_posts',
				{course: context.rootGetters.getCourseid}
			);

			if (response.success) {
				response = Object.values(JSON.parse(response.data));
				const numberOfUserPosts = response[0].user_posts;
				const numberOfAvgPosts = response[0].avg_posts_per_person;
				const minPosts = response[0].min_user_posts;
				const maxPosts = response[0].max_user_posts;
				const userScore = ((numberOfUserPosts - numberOfAvgPosts) / numberOfAvgPosts) * 100;

				console.log("user percentage: ", userScore);

				context.commit('setSocialActivity', userScore);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /get_missed_activities/', response.data);
				} else {
					console.log('No connection to webservice /get_missed_activities/');
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
					course: 4,
					userid: 3
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
					course: 4,
					userid: 3
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