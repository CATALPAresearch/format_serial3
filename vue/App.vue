<template>
    <div>
        <div class="d-flex justify-content-between">
            <h2 class="main__title">{{ strings.dashboardTitle }}</h2>
            <div class="d-flex justify-content-end align-items-center">
                <div class="form-group d-flex align-items-center m-0">
                    <select v-if="editMode" id="addDashboardItems" class="form-control mr-2" @change="addItem($event)">
                        <option style="display:none">{{ strings.dashboardAddItem }}</option>
                        <option v-for="(component, index) in filteredComponents" :key="index" :value="component.i">
                            {{ component.name }}
                        </option>
                    </select>
                    <button v-if="editMode" class="btn btn-primary btn-edit" @click="saveDashboard">{{
                            strings.save
                        }}
                    </button>
                </div>
                <menu-bar @editmode="toggleEditMode"></menu-bar>
            </div>
        </div>
        <grid-layout
            :col-num="14"
            :is-draggable="draggable"
            :is-resizable="resizable"
            :layout="layout"
            :row-height="25"
            :use-css-transforms="true"
            :vertical-compact="true"
        >
            <grid-item
                v-for="(item, index) in layout"
                :key="index"
                :h="item.h"
                :i="item.i"
                :static="item.static"
                :w="item.w"
                :x="item.x"
                :y="item.y"
                class="border p-3"
            >
                <span v-if="editMode & !item.fixed" class="remove" title="Element aus Dashboard entfernen"
                      @click="removeItem(item.i)">
                     <i class="fa fa-close"></i>
                </span>
                <component :is="item.c"></component>
            </grid-item>
        </grid-layout>
    </div>
</template>

<script>
import Logger from './scripts/logger';
import AppDeadlines from "./components/widgets/Deadlines.vue";
import IndicatorDisplay from "./components/widgets/IndicatorDisplay.vue";
import MenuBar from "./components/MenuBar.vue";
import QuizStatistics from "./components/widgets/QuizStatistics.vue";
import ProgressChart from "./components/widgets/ProgressChart.vue";
import Recommendations from "./components/widgets/Recommendations.vue";
import TaskList from "./components/widgets/TaskList.vue";
import {GridItem, GridLayout} from './js/vue-grid-layout.umd.min';
import CircleChart from "./components/widgets/CircleChart.vue";
import {mapState} from 'vuex';


export default {
    components: {
        GridLayout,
        GridItem,
        AppDeadlines,
        CircleChart,
        IndicatorDisplay,
        MenuBar,
        ProgressChart,
        Recommendations,
        TaskList,
        QuizStatistics
    },

    data() {
        return {
            courseid: -1,
            context: {},
            logger: null,
            draggable: false,
            resizable: false,
            index: 0,
            editMode: false,
            defaultLayout: [
                {
                    "x": 0,
                    "y": 0,
                    "w": 8,
                    "h": 12,
                    "i": "1",
                    "name": 'Überblick',
                    c: 'ProgressChart',
                    resizable: true,
                    fixed: true,
                },
                {
                    "x": 8,
                    "y": 0,
                    "w": 6,
                    "h": 14,
                    "i": "2",
                    "name": 'Lernziele',
                    c: 'IndicatorDisplay',
                    resizable: true,
                    fixed: true,
                },
                {
                    "x": 0,
                    "y": 13,
                    "w": 5,
                    "h": 12,
                    "i": "3",
                    "name": 'Aufgabenliste',
                    c: 'TaskList',
                    resizable: true
                },
                {
                    "x": 5,
                    "y": 13,
                    "w": 3,
                    "h": 12,
                    "i": "4",
                    "name": 'Termine',
                    c: 'AppDeadlines',
                    resizable: true
                },
                {
                    "x": 8,
                    "y": 13,
                    "w": 6,
                    "h": 10,
                    "i": "9",
                    "name": 'Empfehlungen',
                    c: 'Recommendations',
                    resizable: true
                },

            ],
            allComponents: [
                {
                    "x": 0,
                    "y": 0,
                    "w": 8,
                    "h": 12,
                    "i": "1",
                    "name": 'Überblick',
                    c: 'ProgressChart',
                    resizable: true,
                    fixed: true,
                },
                {
                    "x": 0,
                    "y": 0,
                    "w": 6,
                    "h": 12,
                    "i": "2",
                    "name": 'Lernziele',
                    c: 'IndicatorDisplay',
                    resizable: true
                },
                {
                    "x": 0,
                    "y": 0,
                    "w": 3,
                    "h": 10,
                    "i": "3",
                    "name": 'Aufgabenliste',
                    c: 'TaskList',
                    resizable: true
                },
                {
                    "x": 0,
                    "y": 0,
                    "w": 3,
                    "h": 10,
                    "i": "4",
                    "name": 'Termine',
                    c: 'AppDeadlines',
                    resizable: true
                },
                {
                    "x": 0,
                    "y": 0,
                    "w": 6,
                    "h": 12,
                    "i": "7",
                    "name": 'Ergebnisse',
                    c: 'QuizStatistics',
                    resizable: true
                },
                {
                    "x": 0,
                    "y": 0,
                    "w": 6,
                    "h": 10,
                    "i": "9",
                    "name": 'Empfehlungen',
                    c: 'Recommendations',
                    resizable: true
                },
            ],
        };
    },

    created () {
        this.loadDashboard();
    },

    mounted: function () {
        this.courseid = this.$store.state.courseid;

        this.context.courseId = this.$store.state.courseid; // TODO
        this.logger = new Logger(this.context.courseId, {
            context: "format_ladtopics",
            outputType: 1,
            url: this.$store.state.url
        });
        this.logger.init();
    },

    computed: {
        filteredComponents() {
            return this.allComponents.filter(({i: id1}) => !this.layout.some(({i: id2}) => id2 === id1));
        },

        layout() {
            return this.dashboardSettings && this.dashboardSettings.length > 0 ? this.dashboardSettings : this.defaultLayout;
        },

        ...mapState({
            dashboardSettings: state => state.dashboardSettings.dashboardSettings,
            strings: 'strings'
        }),
    },

    methods: {
        addItem(e) {
            const newItem = this.allComponents.find(element => element.i === e.target.value)
            this.layout.push(newItem)
            this.$el.querySelector('#addDashboardItems').selectedIndex = 0
        },

        removeItem(val) {
            const index = this.layout.map(item => item.i).indexOf(val);
            this.layout.splice(index, 1);
        },

        toggleEditMode() {
            this.editMode = !this.editMode;
            this.draggable = this.resizable = this.editMode;
        },

        loadDashboard: function () {
            this.$store.dispatch('dashboardSettings/getDashboardSettings');
        },

        saveDashboard() {
            const settings = JSON.stringify(this.layout)
            this.$store.dispatch('dashboardSettings/saveDashboardSettings', settings)
            this.toggleEditMode()
        },
    }
}
</script>

<style lang="scss">
.vue-grid-layout {
    background: #eee;
    position: relative;
}

.vue-grid-item:not(.vue-grid-placeholder) {
    background: #fff;
    border: 1px solid black;
}

.vue-grid-item .resizing {
    opacity: 0.9;
}

.vue-grid-item .no-drag {
    height: 100%;
    width: 100%;
}

.vue-grid-item .minMax {
    font-size: 12px;
}

.vue-grid-item .add {
    cursor: pointer;
}

.vue-draggable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    background-position: bottom right;
    padding: 0 8px 8px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: pointer;
}

.remove {
    position: absolute;
    right: 8px;
    top: 0;
    cursor: pointer;
    color: #666666;

    &:hover {
        color: black;
    }
}

.btn-edit {
    height: 35px;
}

select.form-control {
    appearance: menulist-button !important;
}
</style>