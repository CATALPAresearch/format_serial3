<template>
  <div style="width: 100%">
    <survey-prompt></survey-prompt>
    <div class="d-flex justify-content-between">
      <h2 class="main__title">{{ strings.dashboardTitle }}</h2>
      <div v-if="isModerator" class="alert alert-success">
        Condition: {{ research_condition }}
      </div>
      <div class="d-flex justify-content-end align-items-center">
        <div class="form-group d-flex align-items-center m-0">
          <select
            v-if="editMode"
            id="addDashboardItems"
            class="form-control mr-2"
            @change="addItem($event)"
          >
            <option style="display: none">
              {{ strings.dashboardAddItem }}
            </option>
            <option
              v-for="(component, index) in filteredComponents"
              :key="index"
              :value="component.i"
            >
              {{ component.name }}
            </option>
          </select>
          <button
            v-if="editMode"
            class="btn btn-primary btn-edit"
            @click="saveDashboard"
          >
            {{ strings.save }}
          </button>
        </div>
        <menu-bar @editmode="toggleEditMode"></menu-bar>
      </div>
    </div>
    <grid-layout
      id="widgetGrid"
      :col-num="12"
      :layout="layout"
      :is-draggable="draggable"
      :is-resizable="resizable"
      :row-height="25"
      :responsive="false"
      :use-css-transforms="true"
      :vertical-compact="true"
    >
      <grid-item
        v-for="(item, index) in layout"
        :id="'widget-' + item.c"
        :key="index"
        :h="item.h"
        :i="item.i"
        :static="item.static"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        class="border p-3"
      >
        <span
          v-if="editMode & !item.fixed"
          class="remove"
          title="Element aus Dashboard entfernen"
          @click="removeItem(item.i)"
        >
          <i class="fa fa-close"></i>
        </span>
        <component :is="item.c"></component>
      </grid-item>
    </grid-layout>
    <welcome-video></welcome-video>
  </div>
</template>

<script>
import AppDeadlines from "./components/widgets/Deadlines.vue";
import IndicatorDisplay from "./components/widgets/IndicatorDisplay.vue";
import MenuBar from "./components/MenuBar.vue";
import WelcomeVideo from "./components/WelcomeVideo.vue";
import SurveyPrompt from "./components/SurveyPrompt.vue";
//import QuizStatistics from "./components/widgets/QuizStatistics.vue";
import ProgressChartAdaptive from "./components/widgets/ProgressChartAdaptive.vue";
import Recommendations from "./components/widgets/Recommendations.vue";
import TaskList from "./components/widgets/TaskList.vue";
import LearningStrategies from "./components/widgets/LearningStrategies.vue";
import CourseOverview from "./components/widgets/CourseOverview.vue";
import { GridItem, GridLayout } from "./js/vue-grid-layout.umd.min";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  components: {
    GridLayout,
    GridItem,
    AppDeadlines,
    IndicatorDisplay,
    MenuBar,
    WelcomeVideo,
    SurveyPrompt,
    ProgressChartAdaptive,
    Recommendations,
    TaskList,
    CourseOverview,
    LearningStrategies,
    //QuizStatistics
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
          x: 0,
          y: 0,
          w: 7,
          h: 12,
          i: "10",
          name: "Adaptiver Überblick",
          c: "ProgressChartAdaptive",
          resizable: true,
          fixed: false,
          moved: false,
        },
        {
          x: 7,
          y: 0,
          w: 5,
          h: 12,
          i: "2",
          name: "Lernziele",
          c: "IndicatorDisplay",
          resizable: true,
          moved: false,
        },
        {
          x: 0,
          y: 22,
          w: 14,
          h: 11,
          i: "12",
          name: "Kursübersicht",
          c: "CourseOverview",
          resizable: true,
          moved: false,
        },
        {
          x: 5,
          y: 12,
          w: 4,
          h: 10,
          i: "3",
          name: "Aufgabenliste",
          c: "TaskList",
          resizable: true,
          moved: false,
        },
        {
          x: 9,
          y: 12,
          w: 3,
          h: 10,
          i: "4",
          name: "Termine",
          c: "AppDeadlines",
          resizable: true,
          moved: false,
        },
        {
          x: 0,
          y: 12,
          w: 5,
          h: 10,
          i: "9",
          name: "Feedback",
          c: "Recommendations",
          resizable: true,
          moved: false,
        },
      ],

      allComponents: [
        {
          x: 0,
          y: 0,
          w: 8,
          h: 12,
          i: "10",
          name: "Überblick über den Kurs und die Kurseinheiten",
          c: "ProgressChartAdaptive",
          resizable: true,
          fixed: false,
          moved: false,
        },
        {
          x: 8,
          y: 0,
          w: 6,
          h: 12,
          i: "2",
          name: "Lernziele",
          c: "IndicatorDisplay",
          resizable: true,
          moved: false,
        },
        {
          x: 0,
          y: 22,
          w: 14,
          h: 11,
          i: "12",
          name: "Kursübersicht",
          c: "CourseOverview",
          resizable: true,
          moved: false,
        },
        {
          x: 10,
          y: 12,
          w: 4,
          h: 10,
          i: "3",
          name: "Aufgaben",
          c: "TaskList",
          resizable: true,
          moved: false,
        },
        {
          x: 6,
          y: 12,
          w: 4,
          h: 10,
          i: "4",
          name: "Termine",
          c: "AppDeadlines",
          resizable: true,
          moved: false,
        },
        {
          x: 0,
          y: 12,
          w: 6,
          h: 10,
          i: "9",
          name: "Feedback und Lernempfehlungen",
          c: "Recommendations",
          resizable: true,
          moved: false,
        },

        /*{
                    "x": 0,
                    "y": 0,
                    "w": 6,
                    "h": 12,
                    "i": "7",
                    "name": 'Ergebnisse',
                    c: 'QuizStatistics',
                    resizable: true
                },*/

        {
          x: 0,
          y: 0,
          w: 12,
          h: 10,
          i: "11",
          name: "Lernstrategien",
          c: "LearningStrategies",
          resizable: true,
        },
      ],
    };
  },

  created() {
    this.loadDashboard();
  },

  mounted: function () {
    this.$store.commit("setResearchCondition");
    if (this.research_condition == "control_group") {
      this.allComponents = this.allComponents.filter(
        (component) => component.i != "9"
      );
      this.defaultLayout = this.defaultLayout.filter(
        (component) => component.i != "9"
      );
    }
    this.courseid = this.$store.state.courseid;

    this.context.courseId = this.$store.state.courseid; // TODO

    this.initObserver();
  },

  computed: {
    filteredComponents() {
      return this.allComponents.filter(
        ({ i: id1 }) => !this.layout.some(({ i: id2 }) => id2 === id1)
      );
    },

    layout() {
      let r =
        this.dashboardSettings && this.dashboardSettings.length > 0
          ? this.dashboardSettings
          : this.defaultLayout;
      if (this.research_condition == "control_group") {
        r = r.filter((component) => component.i != "9");
      }
      return r;
    },

    ...mapState({
      dashboardSettings: (state) => state.dashboardSettings.dashboardSettings,
      research_condition: (state) => state.research_condition,
      isModerator: (state) => state.isModerator,
      strings: "strings",
    }),
  },

  methods: {
    ...mapGetters(["setResearchCondition"]),
    ...mapActions(["log"]),
    initObserver() {
      if (
        "IntersectionObserver" in window &&
        "IntersectionObserverEntry" in window &&
        "intersectionRatio" in window.IntersectionObserverEntry.prototype
      ) {
        let _this = this;
        let options = {
          root: null,
          rootMargin: "0px",
          threshold: [0.25, 0.5, 0.75, 1.0],
          trackVisibility: true,
          delay: 100,
        };

        let handleScrolling = function (entries) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log(entry.target.id, entry.intersectionRatio);
              _this.log({
                key: "view-dashboard-widget",
                value: {
                  widget: entry.target.id,
                  intersection: entry.intersectionRatio,
                },
              });
            }
            //   entry.boundingClientRect
            //   entry.intersectionRatio
            //   entry.intersectionRect
            //   entry.isIntersecting
            //   entry.rootBounds
            //   entry.target
            //   entry.time
          });
        };

        let observer = new IntersectionObserver(handleScrolling, options);
        observer.observe(document.querySelector("#widgetGrid"));
        $("#widgetGrid .vue-grid-item").each(function (i, val) {
          if (typeof $(this).attr("id") == "string") {
            let element = "#" + $(this).attr("id");
            observer.observe(document.querySelector(element));
          }
        });
      }
    },
    addItem(e) {
      const newItem = this.allComponents.find(
        (element) => element.i === e.target.value
      );
      this.layout.push(newItem);
      this.$el.querySelector("#addDashboardItems").selectedIndex = 0;
    },

    removeItem(val) {
      const index = this.layout.map((item) => item.i).indexOf(val);
      this.layout.splice(index, 1);
    },

    toggleEditMode() {
      this.editMode = !this.editMode;
      this.draggable = this.resizable = this.editMode;
    },

    loadDashboard: function () {
      this.$store.dispatch("dashboardSettings/getDashboardSettings");
    },

    saveDashboard() {
      const settings = JSON.stringify(this.layout);
      this.$store.dispatch("dashboardSettings/saveDashboardSettings", settings);
      this.toggleEditMode();
    },
    breakpointChangedEvent: function (newBreakpoint, newLayout) {
      console.log(
        "BREAKPOINT CHANGED breakpoint=",
        newBreakpoint,
        ", layout: ",
        newLayout
      );
    },
  },
};
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
