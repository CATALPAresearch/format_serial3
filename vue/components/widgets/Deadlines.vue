<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading
            icon="fa-calendar-o"
            :info-content="info"
            title="Termine">
        </widget-heading>
        <div class="form-group mr-1">
            <select id="deadline-type-select" v-model="currentFilterType" class="form-control">
                <option value="Alle">Alle Termine</option>
                <option value="Assignment">Aufgaben</option>
                <option value="Quiz">Tests</option>
                <option value="Calendar">Kalender</option>
            </select>
        </div>
        <ul class="deadline-items flex-shrink-1 m-0 p-0" style="max-height: 100%;">
            <li v-for="(deadline, index) in filteredDeadlines" :key="index"
                :class="{ 'deadline': true, 'p-2': true, 'mb-1': true, 'mr-1': true, 'border-today': isDueToday(deadline) }">
                <a v-if="deadline.url" :href="deadline.url">
                    <p class="mb-2">
                        <span v-if="deadline.timestart">{{ formatDate(deadline.timestart) }}</span>
                        <span v-if="deadline.timeclose != deadline.timestart">- {{
                                formatDate(deadline.timeclose)
                            }}</span>
                    </p>
                    <i v-if="deadline.type === 'calendar'" aria-hidden="true" class="icon fa fa-calendar fa-fw"></i>
                    <img v-if="deadline.type === 'quiz'" alt="" aria-hidden="true" class="icon"
                         src="http://localhost/theme/image.php/boost/quiz/1679696176/icon">
                    <img v-if="deadline.type === 'assignment'" alt="" aria-hidden="true" class="icon"
                         src="http://localhost/theme/image.php/boost/assign/1679696176/icon">
                    <span>{{ deadline.name }}</span>
                </a>
                <div v-else>
                    <p class="mb-2">
                        <span v-if="deadline.timestart">{{ formatDate(deadline.timestart) }}</span>
                        <span v-if="deadline.timeclose != deadline.timestart">- {{
                                formatDate(deadline.timeclose)
                            }}</span>
                    </p>
                    <i v-if="deadline.type === 'calendar'" aria-hidden="true" class="icon fa fa-calendar fa-fw"></i>
                    <img v-if="deadline.type === 'quiz'" alt="" aria-hidden="true" class="icon"
                         src="http://localhost/theme/image.php/boost/quiz/1679696176/icon">
                    <img v-if="deadline.type === 'assignment'" alt="" aria-hidden="true" class="icon"
                         src="http://localhost/theme/image.php/boost/assign/1679696176/icon">
                    <span>{{ deadline.name }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import Communication from "../../scripts/communication";
import { mapActions } from 'vuex';


export default {
    name: "WidgetDeadlines",

    components: {WidgetHeading},

    data() {
        return {
            deadlines: [],
            assignments: [],
            currentFilterType: "Alle",
            info: 'Dieses Widget hilft dir alle Termine und Abgaben im Überblick zu behalten. Du kannst die Ausgabe nach der Art der Termine filtern. Über einen Link kommst du direkt zu den zugehörigen Moodle-Seiten.'
        }
    },

    mounted() {
        this.getCalendarData()
        this.getAssignmentData()
    },

    computed: {
        allDeadlines() {
            return [...this.deadlines, ...this.assignments];
        },

        filteredDeadlines() {
            this.log({key:"widget-deadlines-filter", value: this.currentFilterType});
            
            let deadlines = [];
            if (this.currentFilterType === "Alle") {
                deadlines = this.allDeadlines;
            } else {
                deadlines = this.allDeadlines.filter(
                    (deadline) => deadline.type === this.currentFilterType.toLowerCase()
                );
            }

            deadlines = deadlines.filter((deadline) => deadline.timeclose > Date.now() / 1000);

            deadlines.sort((a, b) => {
                if (a.timeclose < b.timeclose) return -1;
                if (a.timeclose > b.timeclose) return 1;
                return 0;
            })
            return deadlines;
        },
    },

    methods: {
        ...mapActions(['log']),
        async getCalendarData() {
            const response = await Communication.webservice(
                'get_calendar',
                {
                    'courseid': this.$store.state.courseid,
                }
            );

            if (response) {
                const data = JSON.parse(response.data);
                this.deadlines = Object.values(data).map(item => ({
                    id: item.id,
                    timestart: item.timestart,
                    timeclose: Number(item.timestart) + Number(item.timeduration),
                    name: item.name,
                    url: item.url,
                    type: 'calendar'
                }));
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        async getAssignmentData() {
            const response = await Communication.webservice(
                'get_deadlines',
                {
                    courseid: this.$store.state.courseid,
                }
            );
            if (response.success) {
                const data = JSON.parse(response.data)
                this.assignments = Object.keys(data).map(key => data[key]);

                for (let key in this.assignments) {
                    const id = this.assignments[key].coursemoduleid
                    this.assignments[key].url = this.$store.getters['overview/getUrlById'](id)
                }
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        formatDate(timestamp) {
            const date = new Date(Number(timestamp) * 1000); // convert to milliseconds
            const formatter = new Intl.DateTimeFormat('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
            return formatter.format(date);
        },

        isDueToday(deadline) {
            const deadlineDate = new Date(deadline.timeclose * 1000);
            const today = new Date();
            return deadlineDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
        },
    }
}
</script>

<style lang="scss" scoped>
@import "../../scss/variables.scss";
@import "../../scss/scrollbar.scss";

.deadline {
    border: 1px solid $grey;
    list-style: none;
}

.deadline-items {
    overflow-y: auto;
}

.border-today {
    border: 2px solid $blue-default;
}
</style>