<template>
  <div class="position-relative h-100 d-flex flex-column">
    <widget-heading
      :info-content="info"
      icon="fa-hourglass-o"
      title="Überblick über den Kurs und die Kurseinheiten"
    ></widget-heading>

    <div class="subject-progress px-1">
      <div
        :class="currentSection === -1 ? 'section-selection--current' : ''"
        class="section-selection mr-2"
        @click="setCurrentSection(-1)"
      >
        <p class="my-1 pl-1">Alle Kurseinheiten</p>
        <div class="progress mb-2">
          <div
            :aria-valuenow="calculateProgress"
            :style="{ width: calculateProgress + '%' }"
            aria-valuemax="100"
            aria-valuemin="0"
            class="progress-bar progress-bar-blue"
            role="progressbar"
          >
            {{ calculateProgress }}%
          </div>
        </div>
      </div>

      <div class="w-100 mb-4">
        <div
          v-for="(section, index) in getSections"
          :key="index"
          :style="{ width: calculateWidth(getSections.length) + '%' }"
          class="d-inline-block"
          @click="setCurrentSection(index)"
        >
          <div
            :class="
              currentSection === index ? 'section-selection--current' : ''
            "
            class="section-selection mr-2"
          >
            <p
              :title="section[0].sectionname"
              class="section-names mb-1 small pl-1"
            >
              {{ section[0].sectionname }}
            </p>
            <div class="progress">
              <div
                :aria-valuenow="calculateSectionProgress(section)"
                :style="{ width: calculateSectionProgress(section) + '%' }"
                aria-valuemax="100"
                aria-valuemin="0"
                class="progress-bar progress-bar-blue"
                role="progressbar"
              >
                {{ calculateSectionProgress(section) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="research_condition != 'control_group'"
        class="course-recommendation py-2"
      >
        <div
          v-for="(recommendation, index) in getCourseRecommendations"
          :key="index"
        >
          <RecommendationItem
            v-if="
              index < 1 &&
              currentSection == -1 &&
              recommendation.type == 'scope_course'
            "
            :recommendation="recommendation"
            :courseid="$store.getters.getCourseid"
            :timeAgo="timeAgo"
            :mode="'minimal'"
          ></RecommendationItem>
        </div>
      </div>
      <div
        v-for="(type, typeIndex) in activityTypes"
        :key="typeIndex"
        class="row"
      >
        <span
          v-if="isIncludedActivity(getActivities[type][0].type)"
          class="col-3"
          >{{ mapActivityNames[getActivities[type][0].modulename] }}</span
        >
        <div class="col-9">
          <span
            v-if="isIncludedActivity(activity.type)"
            v-for="activity in currentActivities[type]"
            :key="activity.id"
            class="position-relative"
          >
            <button
              id="'popover' + activity.id"
              ref="popoverButton"
              v-popover-html="popoverContent(activity)"
              class="subject-progress__popover popoverx"
              data-placement="bottom"
              data-toggle="popover"
              @click="
                log({
                  key: 'activity-popover-show',
                  value: { id: activity.id, name: activity.name },
                })
              "
              type="button"
              :title="
                activity.completion !== 0
                  ? activity.name + ' (bereits bearbeitet)'
                  : activity.name
              "
            >
              <span
                :class="{
                  'rect--grey': activity.rating === 0,
                  'rect--weak': activity.rating === 1,
                  'rect--ok': activity.rating === 2,
                  'rect--strong': activity.rating === 3,
                  'activity-completed': activity.completion !== 0,
                }"
                :title="activity.name"
                data-toggle="tooltip"
                data-placement="top"
                class="completion-rect"
              ></span>
            </button>
          </span>
        </div>
      </div>
      <div class="legend d-flex justify-content-start mt-3">
        <div class="d-flex align-items-center mr-3">
          <span class="completion-rect rect-sm rect--grey mr-1"></span
          ><span class="">Nicht abgeschlossen</span>
        </div>
        <div class="d-flex align-items-center mr-3">
          <span class="completion-rect rect-sm rect--weak mr-1"></span
          ><span class="">Ungenügend verstanden</span>
        </div>
        <div class="d-flex align-items-center mr-3">
          <span class="completion-rect rect-sm rect--ok mr-1"></span
          ><span class="">Größtenteils verstanden</span>
        </div>
        <div class="d-flex align-items-center">
          <span class="completion-rect rect-sm rect--strong mr-1"></span
          ><span class="">Alles verstanden</span>
        </div>
      </div>
    </div>
    <PopoverContent
      class="d-none"
      :activity="{}"
      :courseid="$store.getters.getCourseid"
      @log="logg"
    ></PopoverContent>
  </div>
</template>

<script>
import Communication from "../../scripts/communication";
import WidgetHeading from "../WidgetHeading.vue";
import RecommendationItem from "../RecommendationItem.vue";
import Vue from "vue";
import { mapActions, mapGetters, mapState } from "vuex";
import { groupBy } from "../../scripts/util";
import PopoverContent from "../PopoverContent.vue";
//import { treemapSquarify } from '../../../lib/src/d3.v4';

export default {
  name: "WidgetProgressChartAdaptive",

  components: { WidgetHeading, PopoverContent, RecommendationItem },

  directives: {
    popoverHtml: {
      bind: function (el, binding) {
        setTimeout(function () {
          
          $(el).popover({
            html: true,
            sanitize: false,
            content: function () {
              return binding.value;
            },
          });
          
          $(el).on("shown.bs.popover", function () {
            var popover = $(el).siblings(".popoverx");
            popover.on("click", function (event) {
              event.stopPropagation();
            });
            
          });

          $(el).on("show.bs.popover", function () {
            $(".popoverx").popover('hide');
          });
          
          $(document).on("click.popover", function (event) {
            var popovers = $(el).siblings(".popoverx");
            
            var isClickInsidePopover =
              $(event.target).closest(".popoverx").length > 0 ||
              $(event.target).hasClass("popover-content");
            var isClickOnPopoverButton = $(event.target).is($(el));
            if (!isClickInsidePopover && !isClickOnPopoverButton) {
              $(el).popover("hide");
              $(document).off("click.popover");
            }
          });
          
          $(el).on("hidden.bs.popover", function () {
            var popover = $(el).siblings(".popover");
            popover.off("click");
            
          });
        }, 0); // end set timeout
      },
      unbind: function (el) {
        
        $(document).ready(function () {
          $(el).popover("dispose");
          $(el).off("shown.bs.popover");
          $(el).off("hidden.bs.popover");
        });
      },
    },
  },

  data: function () {
    return {
      total: 0,
      info:
        "Das Widget bietet Ihnen eine Übersicht über alle Kursaktivitäten. Für jede Aktivität können Sie Ihr Verständnis bewerten, den Bearbeitungsstand sehen oder es zur Aufgabenliste hinzufügen. Über den Aktivitäten wird Ihnen eine Fortschrittsanzeige angezeigt, die anzeigt, wie viele Aktivitäten Sie insgesamt und für jede Kurseinheit separat bereits abgeschlossen haben. Diese dienen Ihnen auch als Filter, um die dir nur die Aktivitäten für die jeweilige Kurseinheit anzuzeigen.\n" +
        "\n" +
        "Dieses Widget hilft Ihnen Ihre Lernaktivitäten im Blick zu behalten und Ihre Fortschritte zu verfolgen. Durch die Bewertung Ihres Verständnisses können Sie schnell erkennen, welche Aktivitäten noch unklar sind. Das Hinzufügen von Aktivitäten zur Aufgabenliste ermöglicht es Ihnen, Ihre Aufgaben zu organisieren und Prioritäten zu setzen.",
      sectionnames: [],
      stats: [],
      popoverComponent: null,
      currentSection: -1,
      mapActivityNames: {
        longpage: "Kurstext",
        Assignment: "Einsendeaufgaben",
        hypervideo: "Video",
        Safran: "Self-Assessments",
        safran: "Self-Assessments",
        quiz: "Selbsttests",
      },
    };
  },

  watch: {
    currentSection: {
      immediate: true,
      handler(val) {
        if (val === -1) {
          this.$store.commit(
            "overview/setCurrentActivities",
            this.getActivities
          );
        } else {
          this.$store.commit(
            "overview/setCurrentActivities",
            groupBy(this.getSections[this.currentSection], "type")
          );
        }
      },
    },
  },

  created() {
    import("../PopoverContent.vue").then((component) => {
      this.popoverComponent = Vue.extend(component.default);
    });
  },

  mounted: async function () {
    await this.loadCourseData();
    //await this.loadLearnerModel()
  },

  computed: {
    calculateProgress() {
      const x = this.getSections.map(
        (a) => a.filter(({ rating }) => rating !== 0).length
      );
      const sum = x.reduce((total, current) => {
        return total + current;
      }, 0);
      const total = this.getTotalActivites();
      return Math.floor((sum / total) * 100);
    },

    currentActivities() {
      if (this.currentSection === -1) {
        return this.getActivities;
      } else {
        const section = this.getSections[this.currentSection];
        return groupBy(section, "type");
      }
    },
    //
    ...mapState(
      //'overview', ['courseData', 'activityTypes'],
      {
        activityTypes: (state) => state.overview.activityTypes,
        courseData: (state) => state.overview.courseData,
        research_condition: (state) => state.research_condition,
      }
    ),
    ...mapGetters("overview", [
      "getSections",
      "getActivities",
      "getCurrentActivities",
    ]),
    ...mapGetters("recommendations", [
      "getRecommendations",
      "getCourseRecommendations",
      "getCourseUnitRecommendations",
      "getActivityTypeRecommendations",
      "getActivityRecommendations",
    ]),
  },

  methods: {
    ...mapActions("taskList", ["addItem"]),
    ...mapActions(["log"]),

    popoverContent(activity) {
      let _this = this;
      if (this.popoverComponent) {
        const PopoverComponent = Vue.extend(this.popoverComponent);

        const popover = new PopoverComponent({
          propsData: {
            activity: activity,
            courseid: this.$store.getters.getCourseid,
          },
        }).$mount();

        popover.$on("understanding-updated", (understanding, activityId) => {
          if(this.courseData.hasOwnProperty(activityId)){
            this.courseData[activityId].rating = Number(understanding);
            _this.log({
              key: "activity-popover-rate-understanding",
              value: {
                id: this.courseData[activityId].id,
                name: this.courseData[activityId].name,
                understanding: understanding,
              },
            });

            if (understanding === 0) {
              this.courseData[activityId].completion = 0;
            } else {
              this.courseData[activityId].completion = 1;
            }
          }
        });

        popover.$on("add-to-task-list", (task) => {
          _this.log({
            key: "activity-popover-addToTaskList",
            value: { id: task.id, name: task.name },
          });
          delete task.id;
          delete task.name;
          this.addItem(task);
        });

        popover.$on("logg", (payload) => {
          _this.log(payload);
        });

        return popover.$el;
      }
    },

    calculateSectionProgress(section) {
      const sum = section.filter(({ rating }) => rating !== 0).length;
      const total = section.length;
      return Math.floor((sum / total) * 100);
    },

    calculateWidth(items) {
      return 100 / items;
    },

    getTotalActivites() {
      const y = this.getSections.map((a) => a.length);
      return y.reduce((total, current) => {
        return total + current;
      }, 0);
    },

    isIncludedActivity(activity) {
      const includedActivities = [
        "hypervideo",
        "assign",
        "safran",
        "longpage",
        "questionnaire",
      ];
      if (includedActivities.indexOf(activity) > -1) {
        return true;
      }
      return false;
    },

    setCurrentSection(section) {
      this.currentSection = section;
      this.$store.commit("overview/setCurrentSection", section);
      this.log({ key: "progress-chart-select-section", value: section });
    },

    /**
     * TODO
     */
    loadLearnerModel() {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var lm = JSON.parse(this.responseText);
          // TODO convert LM to internal data structure
        }
      };
      // FIXME: pass the moodle path from php to the client
      var wwwroot =
        window.location.protocol +
        "//" +
        window.location.host +
        "/" +
        window.location.pathname;
      wwwroot = "http://localhost/moodle311";
      // FIXME: add the current semester as a parameter of the path instead of "SS23"
      var path =
        wwwroot +
        "/local/ari/lm/learner_model.php?format=json&period=SS23&course_id=" +
        parseInt(this.$store.getters.getCourseid, 10) +
        "&user_id=" +
        parseInt(this.$store.getters.getUserid, 10);
      xmlhttp.open("GET", path, true);
      xmlhttp.send();
    },

    loadCourseData: async function () {
      //console.log('DEBUG')
      const response = await Communication.webservice("overview", {
        courseid: parseInt(this.$store.getters.getCourseid, 10),
      });
      if (response.success) {
        response.data = JSON.parse(response.data);
        //console.log('input debug::', JSON.parse(response.data.debug));
        console.log('XXX input completions::', JSON.parse(response.data.completions));

        this.$store.commit(
          "overview/setCourseData",
          JSON.parse(response.data.completions)
        );
        this.$store.commit("overview/setCurrentActivities", this.getActivities);
        this.$store.commit(
          "overview/setActivityTypes",
          Object.keys(this.getActivities)
        );
        this.total = this.getTotalActivites();
      } else {
        if (response.data) {
          console.error(
            this.name,
            "Faulty response of webservice /overview/",
            response.data
          );
        } else {
          console.error(this.name, "No connection to webservice /overview/");
        }
      }

      const completionData = this.$store.state.learnermodel.userUnderstanding;
      for (let key in completionData) {
        let activityid = completionData[key]["activityid"];
        if(this.courseData.hasOwnProperty(activityid)){
          this.courseData[activityid]["completion"] = Number(
            completionData[key]["completed"]
          );
          this.courseData[activityid]["rating"] = Number(
            completionData[key]["rating"]
          );
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../scss/variables.scss";
@import "../../scss/scrollbar.scss";

.course-recommendation {
  padding: 10px 0px;
  color: $blue-dark;
  font-size: 1.2em;
}

.subject-progress {
  overflow-y: auto;
  overflow-x: hidden;

  &__popover {
    border: none;
    padding: 0;
    background: none;
  }
}

.progress-bar-blue {
  background-color: $blue-dark;
  opacity: 0.8;
}

.completion-rect {
  stroke-width: 3px;
  stroke: white;
  width: 20px;
  height: 18px;
  display: inline-block;
  opacity: 0.8;
  margin-right: 1px;
}

.rect-sm {
  width: 12px;
  height: 12px;
}

.rect--grey {
  background-color: $light-grey;
}

.rect--ok {
  background-color: $blue-middle;
}

.rect--strong {
  background-color: $blue-dark;
}

.rect--weak {
  background-color: $blue-weak;
}

.completion-rect:hover {
  stroke-width: 3px;
  stroke: white;
  opacity: 1;
}

.progressbar {
  width: 100%;
  height: 40px;
}

.section-names {
  white-space: nowrap;
  overflow: hidden !important;
  text-overflow: ellipsis;
}

.section-selection {
  cursor: pointer;
  margin: 2px;

  &:hover {
    text-decoration: underline;
    outline: 2px solid $blue-default;
    outline-offset: 0px;
  }

  &--current {
    text-decoration: underline;
    outline: 2px solid $blue-default;
    outline-offset: 0px;
  }
}

.button {
  border: none;
  background: none;
  padding: 0;
}

.container {
  margin-top: 10px;
}

.my-popover-content {
  display: none;
}

.activity-completed {
  border-bottom: solid 2px #555;
}
</style>
