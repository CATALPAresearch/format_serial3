import { groupBy } from "../scripts/util";
import Communication from "../scripts/communication";

export default {
  namespaced: true,

  state: {
    courseData: null,
    currentSection: -1,
    currentActivities: null,
    activityTypes: [],
    sectionNames: [],
  },

  mutations: {
    setCurrentSection(state, section) {
      state.currentSection = section;
    },
    setCourseData(state, data) {
      
      const excluded_sections = [
        "Willkommen!",
        "Allgemeines",
        "General",
        "Prüfung",
        "Praktische Übungen",
        "Prüfungsvorbereitung",
        "FAQs zu den Lernunterstützungen",
      ];

      const allowedActivitities = [
        "hypervideo",
        "longpage",
        "assig",
        "quiz",
        "assign",
        "safran",
      ];
      
      const filtered_activities = Object.keys(data)
        .filter((key) => allowedActivitities.includes(data[key].type))
        .reduce(function (filtered_object, key) {
          if (key in data) {
            filtered_object[key] = data[key];
          }
          return filtered_object;
        }, {});

      console.log('filtered_activities', filtered_activities)
      console.log(
        Object.keys(filtered_activities),
        Object.keys(filtered_activities)
        .filter(
          (key) =>
            !excluded_sections.includes(filtered_activities[key].sectionname)
        )
      )
      const filtered_sections = Object.keys(filtered_activities)
        .filter(
          (key) =>
            !excluded_sections.includes(filtered_activities[key].sectionname)
        )
        .reduce(function (filtered_object, key) {
          if (key in filtered_activities) {
            filtered_object[key] = filtered_activities[key];
          }
          return filtered_object;
        }, {});
      
      state.courseData = Object.values(filtered_sections);
      console.log('filtered_sections', filtered_activities, groupBy(Object.values(state.courseData), "section"))
    },
    setCurrentActivities(state, data) {
      state.currentActivities = data;
    },
    setActivityTypes(state, data) {
      state.activityTypes = data;
    },
  },

  getters: {
    getSections: function (state) {
      return groupBy(state.courseData, "section");
    },
    getActivities: function (state) {
      return groupBy(state.courseData, "type");
    },
    getCurrentActivities: function (state) {
      if (state.currentSection === -1) {
        return state.getActivities;
      } else {
        return groupBy(state.getSections[state.currentSection], "type");
      }
    },
    getUrlById: (state) => (id) => {
      const activity = Object.values(state.courseData).find(
        (object) => object.id === id
      );
      if (activity != undefined) {
        return activity.url;
      }
      return "#";
    },
    getTotalNumberOfActivities: function (state) {
      console.log('state', state)
      return Object.keys(state.courseData).length;
    },
  },

  actions: {
    async updateUnderstanding({ commit, rootState }, newVal) {
      const response = await Communication.webservice(
        "set_user_understanding",
        {
          course: Number(rootState.courseid),
          activityid: this.activity.id,
          rating: newVal,
        }
      );
      if (response.success) {
        commit("updateActivity", newVal);
      } else {
        if (response.data) {
          console.log("Faulty response of webservice /set_user_understanding/", response.data);
        } else {
          console.log("No connection to webservice /set_user_understanding/");
        }
      }
    },
  },
};
