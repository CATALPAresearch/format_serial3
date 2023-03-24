<template>
    <div>
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="completed" v-model="completed" @change="toggleCompletion">
            <label class="form-check-label" for="completed">Abgeschlossen</label>
        </div>
        <div class="form-check mt-2">
            <input class="form-check-input" type="checkbox" value="" id="task" v-model="addToTaskList" @change="toggleAddToTaskList">
            <label class="form-check-label" for="completed">Add to task list</label>
        </div>

        <p class="mb-1 mt-2">Rate your understanding of the material:</p>
        <div class="row ml-1">
            <div class="form-check mb-2 col-5 pr-0">
                <input class="form-check-input" type="radio" name="userUnderstanding" id="weak" value="1" v-model="rating" />
                <label class="form-check-label" for="weak">Schlecht</label>
            </div>
            <div class="form-check mb-2 col-3 pr-0">
                <input class="form-check-input" type="radio" name="userUnderstanding" id="ok" value="2" v-model="rating" />
                <label class="form-check-label" for="ok">Ok</label>
            </div>
            <div class="form-check mb-2 col-4 pr-0">
                <input class="form-check-input" type="radio" name="userUnderstanding" id="strong" value="3" v-model="rating" />
                <label class="form-check-label" for="strong">Gut</label>
            </div>
        </div>

        <div class="py-1">
            <a href="#">
                Ask for help
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
        <div class="py-1">
            <a :href="activity.url">
                Gehe zu {{ activity.name }}
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
    </div>
</template>

<script>
import {ajax} from '../store/store';


export default {
    name: "PopoverContent",

    props: {
        activity: { type: Object, required: true},
    },

    data() {
        return {
            rating: null,
            completed: false,
            addToTaskList: false,
        };
    },

    watch: {
        rating(newVal) {
            this.updateRating(newVal);
        },
    },

    async created() {
        const response = await ajax('format_ladtopics_getUserUnderstanding', {
            course: 4,
            activityid: this.activity.id,
        })

        if (response.success) {
            const res = JSON.parse(response.data)

            if (res.rating) {
                this.rating = Number(res.rating)
            }
            if (res.completed) {
                this.completed = Number(res.completed)
            }
        }
    },

    methods: {
        async updateRating (newVal) {
            await ajax("format_ladtopics_setUserUnderstanding", {
                course: 4,
                activityid: this.activity.id,
                rating: newVal,
            })
            this.$emit('rating-updated', newVal)
        },

        async toggleCompletion () {
            await ajax('format_ladtopics_setCompletionStatus', {
                course: 4,
                activityid: this.activity.id,
                completed: this.completed,
            })
            this.$emit('completion-updated', this.completed)
        },

        toggleAddToTaskList () {
            if (this.addToTaskList) {
                this.$emit('add-to-task-list', {
                    course: 4,
                    task: this.activity.name,
                    completed: this.completed ? 1 : 0,
                    duedate: null,
                });
            } else {
                // @TODO delete activity from task list again
            }
        }
    }
}
</script>

<style scoped>

</style>