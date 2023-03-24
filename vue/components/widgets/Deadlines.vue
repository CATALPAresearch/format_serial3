<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading title="Termine" icon="fa-hourglass-o" info-content="Informationen über das Widget"></widget-heading>
        <div class="form-group mr-1">
            <select id="deadline-type-select" class="form-control" v-model="currentFilterType">
                <option value="Alle">Alle</option>
                <option value="Assignment">Assignment</option>
                <option value="Quiz">Quiz</option>
                <option value="Calendar">Calendar</option>
            </select>
        </div>
        <ul class="deadline-items flex-shrink-1 m-0 p-0" style="max-height: 100%;">
            <li v-for="(deadline, index) in filteredDeadlines" :key="index" :class="{ 'deadline': true, 'p-2': true, 'mb-1': true, 'mr-1': true, 'border-today': isDueToday(deadline) }">
                <a v-if="deadline.url" :href="deadline.url">
                    <p class="mb-2">
                        <span v-if="deadline.timestart">{{ formatDate(deadline.timestart) }}</span>
                        <span v-if="deadline.timeclose != deadline.timestart">- {{ formatDate(deadline.timeclose) }}</span>
                    </p>
                    <i class="icon fa fa-calendar fa-fw" aria-hidden="true"></i>
                    <span>{{ deadline.name }}</span>
                </a>
                <div v-else>
                    <p class="mb-2">
                        <span v-if="deadline.timestart">{{ formatDate(deadline.timestart) }}</span>
                        <span v-if="deadline.timeclose != deadline.timestart">- {{ formatDate(deadline.timeclose) }}</span>
                    </p>
                    <i v-if="deadline.type === 'calendar'" class="icon fa fa-calendar fa-fw" aria-hidden="true"></i>
                    <img v-if="deadline.type === 'quiz'" class="icon" alt="" aria-hidden="true" src="http://localhost/theme/image.php/boost/quiz/1679696176/icon">
                    <img v-if="deadline.type === 'assignment'" class="icon" alt="" aria-hidden="true" src="http://localhost/theme/image.php/boost/assign/1679696176/icon">
                    <span>{{ deadline.name }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import {ajax} from '../../store/store';
import WidgetHeading from "../WidgetHeading.vue";


export default {
    name: "AppDeadlines",

    components: {WidgetHeading},

    data () {
        return {
            deadlines: [],
            assignments: [],
            currentFilterType: "Alle",
        }
    },

    mounted () {
        this.getCalendarData()
        this.getAssignmentData()
    },

    computed: {
        allDeadlines() {
            return [...this.deadlines, ...this.assignments];
        },

        filteredDeadlines() {
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
        async getCalendarData() {
            const response = await ajax('format_ladtopics_getcalendar', {
                courseid: this.$store.state.courseid,
            });

            const data = JSON.parse(response.data);
            this.deadlines = Object.values(data).map(item => ({
                id: item.id,
                timestart: item.timestart,
                timeclose: Number(item.timestart) + Number(item.timeduration),
                name: item.name,
                url: item.url,
                type: 'calendar'
            }));
        },

        async getAssignmentData() {
            const dates = await ajax('format_ladtopics_getDeadlines', {
                courseid: this.$store.state.courseid,
            });
            const data = JSON.parse(dates.data)
            this.assignments = Object.keys(data).map(key => data[key]);
        },

        formatDate (timestamp) {
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
            return deadlineDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
        },
    }
}
</script>

<style lang="scss" scoped>
.deadline {
    border: 1px solid #8f959e;
    list-style: none;
}

.deadline-items {
    overflow-y: auto;
}

.border-today {
    border: 2px solid #64A0D6;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-thumb {
    background: #888;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>