<template>
    <div>
        <p class="mb-1">Schätzen Sie Ihr Verständnis dieser Aktivität:</p>
        <form class="mr-1 mb-1">
            <div class="form-check mb-2 col-12 pr-0 ml-1">
                <label class="form-check-label">
                    <input id="noneUnderstanding" v-model="rating" class="form-check-input popover-content"
                    name="userUnderstanding" type="radio" value="0" />
                    Noch nicht betrachtet
                </label>
            </div>
            <div class="form-check mb-2 col-12 pr-0 ml-1">
                <label class="form-check-label">
                    <input id="weakUnderstanding" v-model="rating"
                        class="form-check-input popover-content" name="userUnderstanding" type="radio"
                        value="1" />
                    Ungenügend verstanden
                </label>
            </div>
            <div class="form-check mb-2 col-12 pr-0 ml-1">
                <label class="form-check-label">
                    <input id="okUnderstanding" v-model="rating" class="form-check-input popover-content"
                    name="userUnderstanding" type="radio" value="2" />
                    Größtenteils verstanden
                </label>
            </div>
            <div class="form-check mb-2 col-12 pr-0 ml-1">
                <label class="form-check-label">
                    <input id="strongUnderstanding" v-model="rating" class="form-check-input popover-content"
                    name="userUnderstanding" type="radio" value="3" />
                    Alles verstanden
                </label>
            </div>
        </form>

        <div hidden class="py-1">
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
            <button class="btn btn-outline-dark btn-sm" @click="addToTaskList()">
                <i class="fa fa-star-o"></i>
                Zur Aufgabenliste hinzufügen
            </button>
        </div>
    </div>
</template>


<script>
import Communication from "../scripts/communication";

export default {
    name: "PopoverContent",

    props: {
        activity: { type: Object, required: true },
        courseid: { type: Number, required: true }
    },

    data() {
        return {
            rating: this.activity.rating,
            id: this.activity.id,
        };
    },

    watch: {
        rating(newVal) {
            this.updateUnderstanding(newVal);
        },
    },

    methods: {
        async updateUnderstanding(newVal) {
            if (this.courseid == undefined || this.id == undefined || newVal == undefined) {
                return;
            }
            const response = await Communication.webservice(
                'set_user_understanding',
                {
                    'course': this.courseid,
                    'activityid': this.id,
                    'rating': newVal,
                }
            );
            if (response.success) {
                this.$emit('understanding-updated', newVal, this.id)
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /logger/', response.data);
                } else {
                    console.log('No connection to webservice /logger/');
                }
            }
        },

        addToTaskList(url) {
            this.$emit('add-to-task-list', {
                course: this.courseid,
                task: '<a href="' + url + '">' + this.activity.name + '</a>',
                //task: '<a href="https://heise.de/">'+this.activity.name+'</a>',
                completed: this.completed ? 1 : 0,
                duedate: null,
            });
        }
    }
}
</script>


<style scoped>
input {
    margin-top: 0;
    margin-left: -1.5rem;
}
</style>