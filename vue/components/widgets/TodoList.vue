<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading title="To-Do Liste" icon="fa-sticky-note-o" info-content="ToDo Liste"></widget-heading>
        <ul class="todo__items flex-shrink-1 p-0 mb-6">
            <li v-for="(item, index) in items" :key="index" class="todo__checkbox-items pt-1 pb-2">
                <div class="d-flex" @click="toggleItem(item)">
                    <input type="checkbox" :checked="item.completed == 1" class="mr-2"/>
                    <span :class="{'todo__item-completed': item.completed == 1}" class="m-0">{{ item.task }}</span>
                </div>
                <button type="button" class="close d-flex mt-2" aria-label="Deletes item" @click="deleteItem(item)">
                    <i class="fa fa-close todo__close-icon" aria-hidden="true"></i>
                </button>
            </li>
        </ul>
        <div class="todo__add-item input-group control-group">
            <input type="text" v-model="newItem" @keyup.enter="addItem" class="form-control" :placeholder="placeholderAddItem"  />
            <button type="submit" class="btn btn-primary" @click="addItem" :disabled="newItem.length === 0">
                Add item
            </button>
        </div>
    </div>
</template>

<script>
import {ajax} from '../../store';
import WidgetHeading from "../WidgetHeading.vue";

export default {
    name: "TodoList",

    components: {WidgetHeading},

    data() {
        return {
            items: [],
            newItem: '',
            placeholderAddItem: 'Neues Item hinzufügen..',
            userid: Number(this.$store.getters.getUserid),
            course: Number(this.$store.getters.getCourseid),
        }
    },

    async mounted() {
        await this.fetchItems();
    },

    methods: {
        async toggleItem (item) {
            item.completed = 1 - item.completed

            await ajax('format_ladtopics_toggleTodoItem', {
                id: item.id,
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
            }
            const response = await ajax('format_ladtopics_addTodoItem', newItem);

            if (response.success) {
                newItem.id = response.data
                this.items.push(newItem)
                this.newItem = ''
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /getTodoItems/', response.data);
                } else {
                    console.log('No connection to webservice /getTodoItems/');
                }
            }
        },

        async fetchItems() {
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
        cursor: pointer;
    }

    &__item-completed {
        text-decoration: line-through;
    }

    &__close-icon {
        font-size: 12px;
    }

    &__add-item {
        position: absolute;
        bottom: 0;
    }
}
</style>