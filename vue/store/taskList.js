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
		async getItems({commit, rootState}) {
			const response = await Communication.webservice(
				'get_tasks',
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
		},

		async addItem({commit}, item) {
			const response = await Communication.webservice(
				'create_task', item
			);
			if (response.success) {
				item.id = response.data;
				commit('addItem', item);
			} else {
				if (response.data) {
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
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
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
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
					console.log('Faulty response of webservice /logger/', response.data);
				} else {
					console.log('No connection to webservice /logger/');
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
					'completed': item.completed
				}
			);
			if (response.success) {
				commit('updateItem', updatedItem);
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