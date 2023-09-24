<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa-sticky-note-o" :info-content="info" title="Aufgaben"></widget-heading>
        <div class="todo__items flex-shrink-1 mb-6">
            <ul class="p-0 pl-1">
                <li v-for="item in uncompletedItems" :key="item.id" class="todo__checkbox-items pt-1">
                    <div class="d-flex todo__toggle-item">
                        <input :checked="item.completed === 1" class="mr-2" type="checkbox" @click="toggleTask(item)"/>
                        <span class="m-0">{{ item.task }}</span>
                    </div>
                    <div class="d-flex align-items-center mr-3">
                        <div v-if="item.duedate && item.duedate != 0" class="flex-shrink-0">
                            {{ new Date(item.duedate).toLocaleDateString('de-DE') }}
                        </div>
                        <input v-model="item.duedate" class="form-control p-0 mx-2 todo__change-date" type="date"
                               @change="updateDate(item)"/>
                        <button aria-label="Deletes item" class="close d-flex" type="button" @click="deleteTask(item)">
                            <i aria-hidden="true" class="fa fa-close todo__close-icon"></i>
                        </button>
                    </div>
                </li>
            </ul>

            <a aria-controls="checkedItems" aria-expanded="false" class="todo__toggle w-100 pl-1" data-toggle="collapse" href="#checkedItems"
               role="button" type="button">
                <i aria-hidden="true" class="icon-collapsed fa fa-chevron-down mr-2"></i>
                <i aria-hidden="true" class="icon-expanded fa fa-chevron-up mr-2"></i>
                {{ completedItems.length }} Aufgaben erledigt
            </a>
            <div id="checkedItems" class="collapse">
                <div class="card card-body w-100 pr-0 pl-1 py-2">
                    <ul class="mr-3 mb-0 p-0">
                        <li v-for="item in completedItems" :key="item.id" class="todo__checkbox-items pt-1 pb-1">
                            <div class="d-flex todo__toggle-item">
                                <input :checked="item.completed == 1" class="mr-2" type="checkbox"
                                       @click="toggleTask(item)"/>
                                <span class="todo__item-completed m-0">{{ item.task }}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <div v-if="item.duedate && item.duedate != 0" class="flex-shrink-0">
                                    {{ new Date(item.duedate).toLocaleDateString('de-DE') }}
                                </div>
                                <input v-model="item.duedate" class="form-control p-0 mx-2 todo__change-date"
                                       type="date" @change="updateDate(item)"/>
                                <button aria-label="Deletes item" class="close d-flex" type="button"
                                        @click="deleteTask(item)">
                                    <i aria-hidden="true" class="fa fa-close todo__close-icon"></i>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="todo__add-item w-100">
            <div class="input-group control-group">
                <input v-model="newItem" :placeholder="placeholderAddItem" class="form-control flex-grow-1" type="text"
                       @keyup.enter="addTask"/>
                <input v-model="newDate" class="form-control flex-grow-0 todo__add-date" type="date"/>
                <button :disabled="newItem.length === 0" class="btn btn-primary" type="submit"
                        @click="addTask"><i class="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex';
import WidgetHeading from '../WidgetHeading.vue';

export default {
    name: 'TaskList',

    components: {WidgetHeading},

    data() {
        return {
            newItem: '',
            newDate: '',
            placeholderAddItem: 'Neues Item hinzufügen..',
            showCompletedItems: false,
            info: 'Die Aufgabenliste unterstützt Sie beim Planen und Priorisieren Ihrer Lernaktivitäten.',
        };
    },

    async mounted() {
        await this.getItems();
    },

    computed: {
        ...mapGetters('taskList', ['items']),

        completedItems() {
            return this.items.filter(item => item.completed == 1);
        },

        uncompletedItems() {
            return this.items.filter(item => item.completed == 0);
        },
    },

    methods: {
        ...mapActions('taskList', ['getItems', 'addItem', 'updateItem', 'deleteItem', 'toggleItem']),

        updateDate(item) {
            this.updateItem(item)
        },

        toggleTask(item) {
            this.toggleItem(item)
        },

        deleteTask(item) {
            this.deleteItem(item);
        },

        addTask() {
            const newItem = {
                course: 4,
                task: this.newItem,
                completed: 0,
                duedate: this.newDate,
            }
            this.addItem(newItem)
            this.newItem = ''
            this.newDate = ''
        },
    }
}
</script>

<style lang="scss" scoped>
@import "../../scss/scrollbar.scss";

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
</style>