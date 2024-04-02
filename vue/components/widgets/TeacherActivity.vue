<template>
  <div class="position-relative h-100 d-flex flex-column">
    <widget-heading
      icon="fa-user-secret"
      :info-content="info"
      title="Reversed Big Brother"
    >
    </widget-heading>
    <div class="form-group mr-1">
      <select
        id="deadline-type-select"
        v-model="showedInformation"
        class="form-control"
      >
        <option value="OnlineStatus">Online Status</option>
        <option value="CorrectionFeedback">Korrekturen und Feedback</option>
        <option value="Discussions">Engagement in Diskussionsforen</option>
        <option value="CourseMaterial">Änderungen von Kursmaterial</option>
        <option value="DataUseTeachers">Datennutzung durch Lehrpersonen</option>
        <option value="DataUseAgents">Datennutzung durch Agenten</option>
      </select>
    </div>

    <div class="form-group">
      <div v-if="showedInformation == 'OnlineStatus'">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Lehrperson</th>
              <th scope="col">zuletzt aktiv</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teacherLastAccessList" :key="teacher.id">
              <th>
                {{ teacher.firstname + " " + teacher.lastname }}
              </th>
              <td>{{ relativeToToday(teacher.lastaccess) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="form-group">
      <div v-if="showedInformation == 'CourseMaterial'">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Kursmaterial</th>
              <th scope="col">Status</th>
              <th scope="col">letzte Änderung</th>
              <th></th>
              <th scope="col">Von</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resource in courseResourceList" :key="resource.name">
              <th>
                <a href="">{{ resource.name }}</a>
              </th>
              <td>
                <span v-if="isDeleted(resource)" class="red">gelöscht</span>
                <span v-else-if="resource.revision === '1'" class="green"
                  >neu</span
                >
                <span v-else-if="resource.revision > '1'" class="yellow"
                  >geändert</span
                >
                <span v-else>-</span>
              </td>
              <td>{{ absoluteDate(resource.timemodified) }}</td>
              <td>{{ relativeToToday(resource.timemodified) }}</td>
              <td>{{ resource.author }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import Communication from "../../scripts/communication";
import { mapActions } from "vuex";

export default {
  name: "WidgetTeacherActivity",

  components: { WidgetHeading },

  data() {
    return {
      teacherIDList: [],
      teacherLastAccessList: [],
      courseResourceList: [],
      courseDeletedResourceList: [],
      showedInformation: "OnlineStatus",
      info: "Dieses Widget stellt dir das Verhalten der Lehrpersonen in diesem Kurs transparenter dar. Du kannst zum Beispiel sehen, wie oft diese online sind oder Änderungen am Kursmaterial vornehmen. Diese Inforamtionen stammen aus den Logdaten von Moodle.",
    };
  },

  mounted() {
    this.getTeachers();
    this.getTeachersLastAccess();
    this.getAddedOrChangedCourseResources();
    this.getDeletedCourseResources();
  },

  methods: {
    ...mapActions(["log"]),

    async getTeachers() {
      const response = await Communication.webservice(
        "get_all_teachers_of_course",
        {
          courseid: this.$store.state.courseid,
        }
      );

      if (response.success) {
        this.teacherIDList = Object.values(JSON.parse(response.data));
      }
    },

    async getTeachersLastAccess() {
      const response = await Communication.webservice(
        "get_last_access_of_teachers_of_course",
        {
          courseid: this.$store.state.courseid,
        }
      );

      if (response.success) {
        this.teacherLastAccessList = Object.values(JSON.parse(response.data));
      }
    },

    async getAddedOrChangedCourseResources() {
      const response = await Communication.webservice(
        "get_added_or_changed_course_resources",
        {
          courseid: this.$store.state.courseid,
        }
      );

      if (response.success) {
        this.courseResourceList = Object.values(JSON.parse(response.data));
      }
    },

    async getDeletedCourseResources() {
      const response = await Communication.webservice(
        "get_deleted_course_resources",
        {
          courseid: this.$store.state.courseid,
        }
      );

      if (response.success) {
        this.courseDeletedResourceList = Object.values(
          JSON.parse(response.data)
        );
      }
    },

    isDeleted(resource) {
      for (let i = 0; i < this.courseDeletedResourceList.length; i++) {
        if (this.courseDeletedResourceList[i].filename === resource.filename) {
          return true;
        }
      }
      return false;
    },

    relativeToToday(timestamp) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const elapsedSeconds = currentTimestamp - timestamp;

      if (elapsedSeconds < 60) {
        return `vor ${elapsedSeconds} Sekunden`;
      } else if (elapsedSeconds < 3600) {
        const minutes = Math.floor(elapsedSeconds / 60);
        return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
      } else if (elapsedSeconds < 86400) {
        const hours = Math.floor(elapsedSeconds / 3600);
        return `vor ${hours} Stunde${hours !== 1 ? "n" : ""}`;
      } else if (elapsedSeconds < 31536000) {
        const days = Math.floor(elapsedSeconds / 86400);
        return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
      } else {
        const years = Math.floor(elapsedSeconds / 31536000);
        return `vor ${years} Jahr${years !== 1 ? "en" : ""}`;
      }
    },

    absoluteDate(timestamp) {
      // Convert Unix timestamp to milliseconds
      var date = new Date(timestamp * 1000);

      // Extract date components
      var day = ("0" + date.getDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear();
      var hours = ("0" + date.getHours()).slice(-2);
      var minutes = ("0" + date.getMinutes()).slice(-2);

      // Format the date
      var formattedDate =
        day + "." + month + "." + year + " " + hours + ":" + minutes + " Uhr";

      return formattedDate;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../scss/variables.scss";
@import "../../scss/scrollbar.scss";

.yellow {
  background-color: yellow;
  color: black;
}
.green {
  background-color: greenyellow;
  color: black;
}
.red {
  background-color: salmon;
  color: black;
}
</style>
