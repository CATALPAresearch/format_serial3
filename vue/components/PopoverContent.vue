<template>
    <div>
        <p class="mb-1">Rate your understanding of the material:</p>
        <div class="form-check mb-2 col-12 pr-0 ml-1">
            <input class="form-check-input" type="radio" name="userUnderstanding" id="none" value="0" v-model="rating" />
            <label class="form-check-label" for="none">Nicht abgeschlossen</label>
        </div>
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
            <button class="btn btn-outline-dark btn-sm" @click="addToTaskList">Add to task list</button>
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
            rating: this.activity.rating,
        };
    },

    watch: {
        rating(newVal) {
            this.updateUnderstanding(newVal);
        },
    },

    methods: {
        async updateUnderstanding (newVal) {
            await ajax("format_ladtopics_setUserUnderstanding", {
                course: 4,
                activityid: this.activity.id,
                rating: newVal,
                completion: this.activity.id === 0 ? 0 : 1
            })
            this.$emit('understanding-updated', newVal, this.activity.id)
        },

        addToTaskList () {
            this.$emit('add-to-task-list', {
                course: 4,
                task: this.activity.name,
                completed: this.completed ? 1 : 0,
                duedate: null,
            });
        }
    }
}
</script>
