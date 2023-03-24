<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading title="Aufgaben" icon="fa-sticky-note-o" info-content="ToDo Liste"></widget-heading>
        <div class="todo__items flex-shrink-1 mb-6">
            <ul class="p-0 pl-1">
                <li v-for="(item, index) in uncompletedItems" :key="index" class="todo__checkbox-items pt-1">
                    <div class="d-flex todo__toggle-item" @click="toggleItem(item)">
                        <input type="checkbox" :checked="item.completed == 1" class="mr-2"/>
                        <span :class="{'todo__item-completed': item.completed == 1}" class="m-0">{{ item.task }}</span>
                    </div>
                    <div class="d-flex align-items-center mr-3">
                        <div v-if="item.duedate && item.duedate != 0" class="flex-shrink-0">{{ item.duedate }}</div>
                        <input type="date" v-model="item.duedate" class="form-control p-0 mx-2 todo__change-date" @change="updateDate(item)"/>
                        <button type="button" class="close d-flex" aria-label="Deletes item" @click="deleteItem(item)">
                            <i class="fa fa-close todo__close-icon" aria-hidden="true"></i>
                        </button>
                    </div>
                </li>
            </ul>

            <a type="button" class="todo__toggle w-100 pl-1" data-toggle="collapse" href="#checkedItems" role="button" aria-expanded="false" aria-controls="checkedItems">
                <i class="icon-collapsed fa fa-chevron-down mr-2" aria-hidden="true"></i>
                <i class="icon-expanded fa fa-chevron-up mr-2" aria-hidden="true"></i>
                {{ completedItems.length }} tasks completed
            </a>
            <div class="collapse" id="checkedItems">
                <div class="card card-body w-100 pr-0 pl-1 py-2">
                    <ul class="mr-3 mb-0 p-0">
                        <li v-for="(item, index) in completedItems" :key="index" class="todo__checkbox-items pt-1 pb-1">
                            <div class="d-flex todo__toggle-item" @click="toggleItem(item)">
                                <input type="checkbox" :checked="item.completed == 1" class="mr-2"/>
                                <span :class="{'todo__item-completed': item.completed == 1}" class="m-0">{{ item.task }}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <input type="date" v-model="item.duedate" class="form-control p-0 mx-2 todo__change-date" @change="updateDate(item)"/>
                                <button type="button" class="close d-flex" aria-label="Deletes item" @click="deleteItem(item)">
                                    <i class="fa fa-close todo__close-icon" aria-hidden="true"></i>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="todo__add-item w-100">
            <div class="input-group control-group">
                <input type="text" v-model="newItem" @keyup.enter="addItem" class="form-control flex-grow-1" :placeholder="placeholderAddItem"  />
                <input type="date" v-model="newDate" class="form-control flex-grow-0 todo__add-date" />
                <button type="submit" class="btn btn-primary todo__add-icon" @click="addItem" :disabled="newItem.length === 0">+</button>
            </div>
        </div>
    </div>
</template>

<script>
import {ajax} from '../../store';
import WidgetHeading from '../WidgetHeading.vue';

export default {
    name: 'TaskList',

    components: {WidgetHeading},

    data() {
        return {
            items: [],
            newItem: '',
            newDate: '',
            placeholderAddItem: 'Neues Item hinzufügen..',
            userid: Number(this.$store.getters.getUserid),
            course: Number(this.$store.getters.getCourseid),
            showCompletedItems: false,
        };
    },

    async mounted() {
        await this.getItems();
        await this.getDeadlines();
    },

    computed: {
        completedItems() {
            return this.items.filter(item => item.completed == 1);
        },

        uncompletedItems() {
            return this.items.filter(item => item.completed == 0);
        }
    },

    methods: {
        formatDate (timestamp) {
            const date = new Date(Number(timestamp) * 1000); // convert to milliseconds
            const formatter = new Intl.DateTimeFormat('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            });
            return formatter.format(date);
        },

        toggleCompletedItemsModal() {
            this.showCompletedItems = !this.showCompletedItems;
        },

        updateDate (item) {
            this.updateItem(item)
        },

        toggleItem (item) {
            item.completed = 1 - item.completed
            this.updateItem(item)
        },

        async updateItem (item) {
            await ajax('format_ladtopics_toggleTodoItem', {
                id: item.id,
                duedate: item.duedate
            });
        },

        async deleteItem(item) {
            this.items = this.items.filter((newItem) => newItem.task !== item.task);

            await ajax('format_ladtopics_deleteTodoItem', {
                id: item.id,
            });
        },

        async addItem () {
            const newItem = {
                course: this.course,
                task: this.newItem,
                completed: 0,
                duedate: this.newDate,
            }
            const response = await ajax('format_ladtopics_addTodoItem', newItem);

            if (response.success) {
                newItem.id = response.data
                this.items.push(newItem)
                this.newItem = ''
                this.newDate = ''
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /getTodoItems/', response.data);
                } else {
                    console.log('No connection to webservice /getTodoItems/');
                }
            }
        },

        async getItems() {
            const response =  await ajax('format_ladtopics_getTodoItems', {
                userid: this.userid,
                course: this.course,
            });
            if (response.success) {
                response.data = JSON.parse(response.data)
                this.items = Object.values(response.data)
            } else {
                this.items = []
            }
            console.log("in get task list item", this.items)
        },
    }
}
</script>

<style lang="scss" scoped>
.todo {
    &__items {
        overflow-y: auto;
    }

    &__checkbox-items {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__toggle-item {
        cursor: pointer;
    }

    &__item-completed {
        text-decoration: line-through;
    }

    &__close-icon {
        font-size: 12px;
    }

    &__add-icon {
        font-size: 26px;
        line-height: 18px;
        padding-top: 6px;
        padding-bottom: 10px;
    }

    &__add-item {
        position: absolute;
        bottom: 0;
    }

    &__add-date {
        width: 120px;
    }

    &__change-date {
        width: 18px;
        border: none;
    }

    &__toggle {
        &:focus {
            border: none;
            outline: none;
            box-shadow: none;
        }
    }
}

.todo__toggle[aria-expanded=false] .icon-expanded {
    display: none;
}
.todo__toggle[aria-expanded=true] .icon-collapsed {
    display: none;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
    background: #888;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>