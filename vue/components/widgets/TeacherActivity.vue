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
        <option value="Coursematerial">Änderungen im Kursmaterial</option>
        <option value="CorrectionExcercises">
          Korrektur von Übungsaufgaben
        </option>
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
              <th scope="col">Aktivität letzte 7 Tage</th>
              <th scope="col">Aktivität letzte 30 Tage</th>
              <th scope="col">Aktivität Semester</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teacherLastAccessList" :key="teacher.id">
              <th>
                {{ teacher.firstname + " " + teacher.lastname }}
              </th>
              <td>{{ relativeToToday(teacher.lastaccess) }}</td>
              <td>...</td>
              <td>...</td>
              <td>...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-for="teacher in teacherIDList" :key="teacher.id">
      <p>{{ teacher.id }} + {{ teacher.firstname }} + {{ teacher.lastname }}</p>
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
      showedInformation: "OnlineStatus",
      info: "Dieses Widget stellt dir das Verhalten der Lehrpersonen in diesem Kurs transparenter dar. Du kannst zum Beispiel sehen, wie oft diese online sind oder Änderungen am Kursmaterial vornehmen. Diese Inforamtionen stammen aus den Logdaten von Moodle.",
    };
  },

  mounted() {
    this.getTeachers(this.$store.state.courseid);
    this.getTeachersLastAccess(this.$store.state.courseid);
  },

  methods: {
    ...mapActions(["log"]),

    async getTeachers(courseid) {
      const response = await Communication.webservice(
        "get_all_teachers_of_course",
        {
          courseid: courseid,
        }
      );

      if (response.success) {
        this.teacherIDList = Object.values(JSON.parse(response.data));
      }
    },

    async getTeachersLastAccess(courseid) {
      const response = await Communication.webservice(
        "get_last_access_of_teachers_of_course",
        {
          courseid: courseid,
        }
      );

      if (response.success) {
        this.teacherLastAccessList = Object.values(JSON.parse(response.data));
      }
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
  },
};
</script>

<style lang="scss" scoped>
@import "../../scss/variables.scss";
@import "../../scss/scrollbar.scss";
</style>
