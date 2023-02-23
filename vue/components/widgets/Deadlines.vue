<template>
    <div class="py-3">
        <widget-heading title="Deadlines" icon="fa-hourglass-o" info-content="Informationen über das Widget"></widget-heading>
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="exampleCheck1">
            <label class="form-check-label" for="exampleCheck1">Show only official deadlines</label>
        </div>
        <ul v-for="(deadline, index) in deadlines" :key="index" class="ml-0 mt-3 p-0">
            <li class="deadline p-2">
                <a v-if="deadline.url" :href="deadline.url">
                    <p class="mb-2">{{ deadline.startDate }} <span v-if="deadline.endDate">- {{ deadline.endDate }}</span> </p>
                    <span>{{ deadline.task }}</span>
                </a>
                <div v-else>
                    <p>{{ deadline.startDate }} <span v-if="deadline.endDate">- {{ deadline.endDate }}</span> </p>
                    <span>{{ deadline.task }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";

export default {
    name: "AppDeadlines",

    components: {WidgetHeading},

    data () {
        return {
            deadlines: [
                {
                    startDate: '15.03.23',
                    endDate: '30.03.23',
                    task: 'Deadline 1',
                    url: 'https://moodle.org/plugins/local_learning_analytics'
                },
                {
                    startDate: '15.03.23',
                    endDate: '30.03.23',
                    task: 'Deadline 2',
                    url: 'https://moodle.org/plugins/local_learning_analytics'
                },
                {
                    startDate: '15.03.23',
                    endDate: '30.03.23',
                    task: 'Deadline 3',
                    url: 'https://moodle.org/plugins/local_learning_analytics'
                },
            ]
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