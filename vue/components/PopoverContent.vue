<template>
    <div>
        <p class="mb-1">Bewerte dein Verständnis von dieser Aktivität:</p>
        <div class="form-check mb-2 col-12 pr-0 ml-1">
            <input id="none" v-model="rating" class="form-check-input" name="userUnderstanding" type="radio" value="0"/>
            <label class="form-check-label" for="none">Nicht abgeschlossen</label>
        </div>
        <div class="ml-1">
            <div class="form-check mb-2 pr-0">
                <input id="weak" v-model="rating" class="form-check-input" name="userUnderstanding" type="radio"
                       value="1"/>
                <label class="form-check-label" for="weak">Ungenügend verstanden</label>
            </div>
            <div class="form-check mb-2 pr-0">
                <input id="ok" v-model="rating" class="form-check-input" name="userUnderstanding" type="radio"
                       value="2"/>
                <label class="form-check-label" for="ok">Größtenteils verstanden</label>
            </div>
            <div class="form-check mb-2 pr-0">
                <input id="strong" v-model="rating" class="form-check-input" name="userUnderstanding" type="radio"
                       value="3"/>
                <label class="form-check-label" for="strong">Alles verstanden</label>
            </div>
        </div>
        <div class="py-1">
            <a href="#">
                Nach Hilfe fragen
                <i aria-hidden="true" class="fa fa-arrow-right"></i>
            </a>
        </div>
        <div class="py-1">
            <a :href="activity.url">
                Gehe zu {{ activity.name }}
                <i aria-hidden="true" class="fa fa-arrow-right"></i>
            </a>
        </div>
        <div class="py-1">
            <button class="btn btn-outline-dark btn-sm" @click="addToTaskList">Zur Aufgabenliste hinzufügen</button>
        </div>
    </div>
</template>

<script>
import Communication from "../scripts/communication";

export default {
    name: "PopoverContent",

    props: {
        activity: {type: Object, required: true},
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
        async updateUnderstanding(newVal) {
            const response = await Communication.webservice(
                'set_user_understanding',
                {
                    'course': 4,
                    'activityid': this.activity.id,
                    'rating': newVal,
                }
            );
            if (response.success) {
                this.$emit('understanding-updated', newVal, this.activity.id)
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        addToTaskList() {
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
