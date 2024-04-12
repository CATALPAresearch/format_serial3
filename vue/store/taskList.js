import Communication from "../scripts/communication";

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
		async getItems({state, commit, rootState}) {
			const response = await Communication.webservice(
				'get_tasks',
				{
					'userid': Number(rootState.userid),
					'course': Number(rootState.courseid),
				}
			);

			if (response.success) {
				commit('setItems', Object.values(JSON.parse(response.data)));
			} else {
				if (response.data) {
					console.warn('taskList store', 'No dashboard settings stored', rootState.userid, rootState.courseid, response);
				} else {
					console.error('taskList store', 'No connection to webservice /overview/');
				}
			}
		},

		async addItem({commit}, item) {
			const response = await Communication.webservice(
				'create_task', item
			);
			if (response.success) {
				item.id = response.id;
				commit('addItem', item);
			} else {
				if (response.data) {
					console.error(this.name, 'Faulty response of webservice /create_task/', response.data);
				} else {
					console.error(this.name, 'No connection to webservice /create_task/');
				}
			}
		},

		async deleteItem({commit}, item) {
			const response = await Communication.webservice(
				'delete_task',
				{
					'id': Number(item.id)
				}
			);
			if (response.success) {
				commit('deleteItem', item);
			} else {
				if (response.data) {
					console.error(this.name, 'Faulty response of webservice /delete_task/', response.data);
				} else {
					console.error(this.name, 'No connection to webservice /delete_task/');
				}
			}
		},

		async updateItem({commit}, item) {
			const response = await Communication.webservice(
				'update_task',
				{
					'id': item.id,
					'duedate': item.duedate,
					'completed': item.completed
				}
			);
			if (response.success) {
				commit('updateItem', item);
			} else {
				if (response.data) {
					console.error(this.name, 'Faulty response of webservice /update_task/', response.data);
				} else {
					console.error(this.name, 'No connection to webservice /update_task/');
				}
			}
		},

		async toggleItem({commit}, item) {
			const completed = 1 - item.completed;
			const updatedItem = {...item, completed: completed};

			const response = await Communication.webservice(
				'update_task',
				{
					'id': item.id,
					'duedate': item.duedate,
					'completed': completed//item.completed
				}
			);
			if (response.success) {
				commit('updateItem', updatedItem);
			} else {
				if (response.data) {
					console.error(this.name, 'Faulty response of webservice /update_task/', response.data);
				} else {
					console.error(this.name, 'No connection to webservice /update_task/');
				}
			}
		},
	},
};