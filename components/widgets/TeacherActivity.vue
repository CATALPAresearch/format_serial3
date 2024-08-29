<template>
  <div class="position-relative h-100 d-flex flex-column teaching-dashboard">
    <widget-heading icon="fa-chalkboard-user" :info-content="info" title="Teaching Dashboard">
    </widget-heading>
    <!-- 
DONE feedback4 93 % ... benachrichtigt werden, wenn die Lehrperson meine Übungsaufgaben korrigiert hat.
DONE dataUseTeacher1 91 % ... welche Daten die Lehrpersonen von mir betrachten können.
DONE forum4 87 % ... in einer Übersicht sehen, ob die Lehrpersonen im Online-Kurs einen neuen Forumsbeitrag erstellt haben.
DONE courseMaterial1 87 % ... wissen, welche neuen Kursmaterialien wann hinzugefügt wurden.
dataUseAgent2 87 % ... wann, wie oft und mit welchem Zweck Daten von mir durch Software-Agenten genutzt wurden
dataUseAgent3 87 % ... wann und wie Software-Agenten meine Daten genutzt haben, um das Lernangebot für mich anzupassen.
DONE courseMaterial2 86 % ... wissen, welche Kursmaterialen wann aktualisiert wurden.
dataUseAgent1 86 % ... welche Daten Software-Agenten von mir nutzen können.
dataUseAgent5 81 % ... ob Software-Agenten eigenständig Entscheidungen getroffen haben, die sich auf mich auswirken.
DONE forum1 75 % ... in einer Übersicht sehen, ob sich Lehrkräfte an der Diskussionen im Forum beteiligt haben.
DONE forum3 75 % ... in einer Übersicht sehen, auf welche Forumsbeiträge die Lehrpersonen geantwortet haben.
dataUseAgent6 74 % ... ob die durch einen Software-Agenten ausgearbeiteten Entscheidungen durch eine Lehrperson bestätigt oder abgelehnt wurden.
__feedback5 71 % ... eine Vorhersage erhalten, wann ich ein Feedback zu meinen eingereichten Lösungen erwarten kann.
dataUseAgent4 68 % ... wann und wie Software-Agenten meine Daten genutzt haben, um das Lernangebot für andere Studierende anzupassen.
DONE courseMaterial3 67 % ... wissen, welche Kursmaterialien wann entfernt wurden.
DONE dataUseTeacher5 65 % ... ob Lehrpersonen in letzter Zeit die zusammengefassten Daten zum Lernfortschritt und den Lernleistungen der im Online-Kurs aktiven Studierenden eingesehen haben.
__ dataUseTeacher4 64 % ... ob Lehrpersonen in letzter Zeit die zusammengefassten Daten zum Lernfortschritt und den Lernleistungen meiner Lerngruppe eingesehen haben.
DONE correction2 62 % ... wissen, ob meine Übungsaufgaben von einer Lehrperson bereits korrigiert wurden.
DONE dataUseTeacher2 61 % ... ob die Lehrpersonen in letzter Zeit meine individuellen Daten zu Lernleistungen und Lernfortschritt eingesehen haben.
TODO courseMaterial5 57 % ... eine Versionshistorie der Änderungen am Kursmaterial einsehen können.
DONE correction5 57 % ... eine Vorhersage erhalten, wann ich die Korrektur meiner eingereichten Lösungen der Übungsaufgaben erwarten kann.
DONE dataUseTeacher3 57 % ... wann welche meiner Daten über Lernleistungen und Lernfortschritte von Lehrpersonen eingesehen wurden.
DONE forum6 51 % ... eine Vorhersage erhalten, wann ich eine Antwort der Lehrpersonen auf meine Forumsbeiträge erwarten kann.
 

    -->
    <div class="row">
      <div class="col-3">
        <div class="bold">Assignments</div>
        <div class="alert alert-success">Two assignements have been corrected. <span class="btn btn-secondary">View</span>
        </div>
        <div>8/10 assignements have been corrected. The remaining assignments shall be corrected with the next week.
        </div>
      </div>
      <div class="col-3">
        <div class="bold">Forum</div>
        <div class="alert alert-warning" style="position:relative;">
          No teacher will propably reply to your <a>post</a> from May 5 any time soon
          <div style="position:absolute; top:0; right:2px;"><i class="fa fa-close"></i></div>
        </div>
        <ul>
          <li><a>New post</a> by Mr. B**** available</li>
          <li><a>New reply</a> by Mrs. O**** available</li>
        </ul>
        <button class="btn btn-link">Show older forum changes</button>
      </div>
      <div class="col-3">
        <div class="bold">Course Material Changes</div>
        <ul>
          <li><a>Course text in Unit 1</a> has been modified</li>
          <li>A new <a>task</a> has been added in Unit 3</li>
          <li>Wiki has changed on page <a>Unified Model</a></li>
          <li>Quiz entitled <a>Type Cast</a> in Unit 2 was deleted</li>
        </ul>
        <button class="btn btn-link">Show more</button>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-3">
        <div
          style="display: inline-block; width: 30px; padding-top:4px;  height: 30px; text-align: center; vertical-align: middle; background-color: blueviolet; color: aliceblue; font-weight: 700; font-size: large;">
          34</div><div class="btn-label">Teachers' views of aggregated course data,<br>last viewed tody</div>
      </div>
      <div class="col-3">
        <div
          style="display: inline-block; padding-top:4px; width: 30px; height: 30px; text-align: center; vertical-align: middle; background-color: blueviolet; color: aliceblue; font-weight: 700; font-size: large;">
          2</div><div class="btn-label">Teachers' views of my personal data,<br>last viewed May 23</div> 
      </div>
      <div class="col-3">
        <div class="fa fa-eye"
          style="display: inline-block; padding-top:6px; width: 30px; height: 30px; text-align: center; padding:auto; background-color: blueviolet; color: aliceblue; font-weight: 700; font-size: large;">
          </div><div class="btn-label">View list of data features collected</div>
      </div>
      <div class="col-3">
        <div class="fa fa-download"
          style="display: inline-block; padding-top:6px; width: 30px; height: 30px; text-align: center; background-color: blueviolet; color: aliceblue; font-weight: 700; font-size: large;">
          </div><div class="btn-label">Download data collected about me</div>
      </div>
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
      newForumDiscussions: [],
      showedInformation: "OnlineStatus",
      info: "Dieses Widget stellt dir das Verhalten der Lehrpersonen in diesem Kurs transparenter dar. Du kannst zum Beispiel sehen, wie oft diese online sind oder Änderungen am Kursmaterial vornehmen. Diese Inforamtionen stammen aus den Logdaten von Moodle.",
    };
  },

  mounted() {
    this.getTeachers();
    this.getTeachersLastAccess();
    this.getAddedOrChangedCourseResources();
    this.getDeletedCourseResources();
    this.getNewForumDiscussions();
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

    async getNewForumDiscussions() {
      const response = await Communication.webservice(
        "get_new_forum_discussions",
        {
          courseid: this.$store.state.courseid,
          userid: this.$store.state.userid,
        }
      );
      if (response.success) {
        this.newForumDiscussions = Object.values(JSON.parse(response.data));
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

.teaching-dashboard a{
  color:#003366 !important;
  text-decoration: underline;
}

.btn-label{
  font-weight: bold;
  padding: 0px 2px;
  display: inline-table;
  line-height: 15px;
  vertical-align: top;
}
.date {
  float: left;
  height: 52px;
  width: 52px;
  background: url('../../../img/date.png') no-repeat;
  margin-right: 10px;
  padding-top: 0px;
  line-height: normal;
  border: solid 1px #555;
}

.date .month {
  display: block;
  text-align: center;
  color: #555;
  font-size: 11px;
  padding-top: 4px;
  text-transform: uppercase;
}

.date .day {
  display: block;
  text-align: center;
  padding-top: 5px;
  color: #222;
  font-size: 18px;
  font-weight: bold;
}

.meta {
  display: block;
  font-size: 11px;
  color: #666;
}
</style>
