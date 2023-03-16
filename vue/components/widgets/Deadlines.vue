<template>
    <div>
        <widget-heading title="Termine" icon="fa-hourglass-o" info-content="Informationen über das Widget"></widget-heading>
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="exampleCheck1">
            <label class="form-check-label" for="exampleCheck1">Show only official deadlines</label>
        </div>
        <ul v-for="(deadline, index) in deadlines" :key="index" class="ml-0 mt-3 p-0">
            <li class="deadline p-2">
                <a v-if="deadline.url" :href="deadline.url">
                    <p class="mb-2">{{ formatDate(deadline.timestart) }} <span v-if="deadline.duration">- {{ deadline.duration }}</span> </p>
                    <span>{{ deadline.name }}</span>
                </a>
                <div v-else>
                    <p class="mb-2">{{ formatDate(deadline.timestart) }} <span v-if="deadline.endDate">- {{ deadline.endDate }}</span> </p>
                    <span>{{ deadline.name }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import {ajax} from '../../store';
import WidgetHeading from "../WidgetHeading.vue";


export default {
    name: "AppDeadlines",

    components: {WidgetHeading},

    data () {
        return {
            deadlines: [],
            //     {
            //         startDate: '15.03.23',
            //         endDate: '30.03.23',
            //         task: 'Deadline 1',
            //         status: 'Ongoing',
            //         url: 'https://moodle.org/plugins/local_learning_analytics'
            //     },
            //     {
            //         startDate: '15.03.23',
            //         endDate: '30.03.23',
            //         task: 'Deadline 2',
            //         status: 'Done',
            //         url: 'https://moodle.org/plugins/local_learning_analytics'
            //     },
            //     {
            //         startDate: '15.03.23',
            //         endDate: '30.03.23',
            //         task: 'Deadline 3',
            //         status: 'Failed',
            //         url: 'https://moodle.org/plugins/local_learning_analytics'
            //     },
            // ]
        }
    },

    async mounted () {
        const response = await ajax('format_ladtopics_getcalendar', {
            courseid: 4,
        });
        this.deadlines = JSON.parse(response.data)
    },

    methods: {
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
        }
    }

}
</script>

<style lang="scss" scoped>
.deadline {
    border: 1px solid #8f959e;
    list-style: none;
}
</style>