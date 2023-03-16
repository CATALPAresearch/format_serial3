<template>
    <div>
        <div class="d-flex justify-content-between">
            <h2 class="main__title">{{ strings.dashboardTitle }}</h2>
            <div class="d-flex justify-content-end align-items-center">
                <div class="form-group d-flex align-items-center m-0">
                    <select v-if="editMode" id="addDashboardItems" class="form-control mr-2" @change="addItem($event)">
                        <option value="addNewItem">{{ strings.dashboardAddItem }}</option>
                        <option v-for="(component, index) in filteredComponents" :key="index" :value="component.i">{{ component.name }}</option>
                    </select>
                    <button v-if="editMode" class="btn btn-primary btn-edit" @click="saveDashboard">{{ strings.save }}</button>
                </div>
                <menu-bar @editmode="toggleEditMode"></menu-bar>
            </div>
        </div>
        <grid-layout
            :layout="data"
            :col-num="12"
            :row-height="30"
            :is-draggable="draggable"
            :is-resizable="resizable"
            :vertical-compact="true"
            :use-css-transforms="true"
        >
            <grid-item
                v-for="(item, index) in data"
                :key="index"
                :static="item.static"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :is-resizable="resizable"
                class="border p-3"
            >
                <span v-if="editMode" class="remove" @click="removeItem(item.i)" title="Element aus Dashboard entfernen">
                     <i class="fa fa-close"></i>
                </span>
                <component v-if="item.isComponent" :is="item.c"></component>
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
import SubjectProgress from "./components/widgets/SubjectProgress.vue";
import AppTimeline from "./components/widgets/Timeline.vue";
import TodoList from "./components/widgets/TodoList.vue";
import AppMotivation from "./components/widgets/Motivation.vue";

import { GridLayout, GridItem } from './js/vue-grid-layout.umd.min';
import BarChartAdvanced from "./components/BarChartAdvanced.vue";
import CircleChart from "./components/CircleChart.vue";

import { mapState } from 'vuex';


export default {
    components: { GridLayout, GridItem, AppDeadlines, AppMotivation, AppTimeline, BarChartAdvanced, CircleChart, IndicatorDisplay, MenuBar, SubjectProgress, TodoList, QuizStatistics },

    data () {
        return {
            name: 'LAD topics',
            courseid: -1,
            context: {},
            logger: null,
            surveyRequired: true,
            surveyLink: '',
            defaultLayout: [
                {"x":0,"y":0,"w":6,"h":10,"i":"1", "name": 'Fortschrittbalken', c: SubjectProgress, isComponent: true, resizable: true},
                {"x":6,"y":0,"w":6,"h":10,"i":"7", "name": 'Quiz Statistics', c: 'QuizStatistics', isComponent: true, resizable: true},
                {"x":0,"y":10,"w":3,"h":10,"i":"3", "name": 'To-Do Liste', c: 'TodoList', isComponent: true, resizable: true},
                {"x":3,"y":10,"w":3,"h":10,"i":"4", "name": 'Deadlines', c: 'AppDeadlines', isComponent: true, resizable: true},
                {"x":6,"y":0,"w":6,"h":10,"i":"2", "name": 'Indikatoren', c: 'IndicatorDisplay', isComponent: true, resizable: true},
            ],
            layout: [],
            draggable: false,
            resizable: false,
            index: 0,
            isClicked: false,
            editMode: false,
            allComponents: [
                {"x":0,"y":0,"w":6,"h":10,"i":"1", "name": 'Fortschrittbalken', c: SubjectProgress, isComponent: true, resizable: true},
                {"x":6,"y":0,"w":6,"h":10,"i":"2", "name": 'Indikatoren', c: 'IndicatorDisplay', isComponent: true, resizable: true},
                {"x":0,"y":10,"w":3,"h":10,"i":"3", "name": 'To-Do Liste', c: 'TodoList', isComponent: true, resizable: true},
                {"x":3,"y":10,"w":3,"h":10,"i":"4", "name": 'Deadlines', c: 'AppDeadlines', isComponent: true, resizable: true},
                {"x":6,"y":10,"w":6,"h":10,"i":"5", "name": 'Bar Chart', c: 'BarChartAdvanced', isComponent: true, resizable: true},
                {"x":0,"y":20,"w":3,"h":10,"i":"6", "name": 'Circle Chart', c: 'CircleChart', isComponent: true, resizable: true},
                {"x":6,"y":10,"w":6,"h":10,"i":"7", "name": 'Quiz Statistics', c: 'QuizStatistics', isComponent: true, resizable: true},
                {"x":6,"y":10,"w":6,"h":10,"i":"9", "name": 'Zeitleiste', c: 'AppTimeline', isComponent: true, resizable: true},
                {"x":6,"y":10,"w":6,"h":10,"i":"10", "name": 'Motivation', c: 'AppMotivation', isComponent: true, resizable: true},
            ],
        };
    },

    mounted: function () {
        this.loadDashboard();

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
        filteredComponents () {
            return this.allComponents.filter(({ i: id1 }) => !this.layout.some(({ i: id2 }) => id2 === id1));
        },

        data () {
            if (this.dashboardSettings && this.dashboardSettings.length > 0) {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.layout = this.dashboardSettings
            } else {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.layout = this.defaultLayout
            }
            return this.layout
        },

        ...mapState(['dashboardSettings', 'strings']),
    },

    methods: {
        addItem(e) {
            const newItem = this.allComponents.find(element => element.i === e.target.value)
            this.layout.push(newItem)
            this.$el.querySelector('#addDashboardItems').selectedIndex = 0
        },

        removeItem (val) {
            const index = this.layout.map(item => item.i).indexOf(val);
            this.layout.splice(index, 1);
        },

        toggleEditMode () {
            if (!this.editMode) {
                this.editMode = true
                this.draggable = true
                this.resizable = true
            } else {
                this.editMode = false
                this.draggable = false
                this.resizable = false
            }
        },

        loadDashboard: function () {
            this.$store.dispatch('fetchDashboardSettings');
        },

        saveDashboard () { // onSave()
            let settings = JSON.stringify(this.layout)
            this.$store.dispatch('saveDashboardSettings', settings)
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

select.form-control{
    appearance: menulist-button!important;
}
</style>