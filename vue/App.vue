<template>
    <div class="">
        <div class="d-flex justify-content-between">
          <h2 class="main__title">{{ title }}</h2>
          <menu-bar></menu-bar>
        </div>

        <div class="mx-3">
            <div class="row">
                <div class="col-6 border">
                    <subject-progress></subject-progress>
                </div>
                <div class="col-6 border">
                    <indicator-display></indicator-display>
                </div>
            </div>
            <div class="row">
                <div class="col-4 border">
                    <todo-list></todo-list>
                </div>
                <div class="col-4 border">
                    <app-deadlines></app-deadlines>
                </div>
                <div class="col-4 border">
                    <student-motivation></student-motivation>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Logger from './scripts/logger';
import TodoList from "./components/widgets/TodoList.vue";
import IndicatorDisplay from "./components/widgets/IndicatorDisplay.vue";
import SubjectProgress from "./components/widgets/SubjectProgress.vue";
import MenuBar from "./components/MenuBar.vue";
import StudentMotivation from "./components/widgets/StudentMotivation.vue";
import AppDeadlines from "./components/widgets/Deadlines.vue";

export default {
    components: {AppDeadlines, MenuBar, TodoList, IndicatorDisplay, StudentMotivation, SubjectProgress },

    data () {
        return {
            title: "Learner Dashboard",
            name: 'LAD topics',
            courseid: -1,
            context: {},
            logger: null,
            surveyRequired: true,
            surveyLink: '',
        };
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
}
</script>

<style lang="scss">
// Colors



.main-container {
  max-width: 100%;
}
</style>