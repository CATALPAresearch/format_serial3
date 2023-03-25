import {ajax} from './store';

export default {
	namespaced: true,

	state: {
		tasks: [],
	},

	mutations: {
		setItems(state, items) {
			state.tasks = items;
		},

		addItem(state, item) {
			state.tasks.push(item);
		},

		deleteItem(state, item) {
			state.tasks.splice(state.tasks.indexOf(item), 1);
		},

		updateItem(state, item) {
			const index = state.tasks.findIndex(i => i.id === item.id);
			if (index >= 0) {
				state.tasks.splice(index, 1, item);
			}
		},
	},

	getters: {
		items(state) {
			return state.tasks;
		}
	},

	actions: {
		async getItems({commit, rootState}) {
			const response = await ajax('format_ladtopics_getTodoItems', {
				userid: Number(rootState.userid),
				course: Number(rootState.courseid),
			});

			if (response.success) {
				commit('setItems', Object.values(JSON.parse(response.data)));
			}
		},

		async addItem({commit}, item) {
			try {
				const response = await ajax('format_ladtopics_addTodoItem', item);
				item.id = response.data;
				commit('addItem', item);
			} catch (error) {
				console.error(error);
			}
		},

		async deleteItem({commit}, item) {
			try {
				await ajax('format_ladtopics_deleteTodoItem', {
					id: Number(item.id),
				});
				commit('deleteItem', item);
			} catch (error) {
				console.error(error);
			}
		},

		async updateItem({commit}, item) {
			try {
				await ajax('format_ladtopics_toggleTodoItem', {
					id: item.id,
					duedate: item.duedate,
					completed: item.completed
				});
				commit('updateItem', item);
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