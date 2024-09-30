<template>
    <div class="mr-5">
        <h5 v-if="mode!='minimal'"><i :class="'fa pr-2 ' + classOfCategory[recommendation.category]"></i>{{ recommendation.title }}</h5>
        <p 
            @click="set_rule_response('click', 'description')" 
            v-html="recommendation.description"
            :style="{ 'color': recommendation.valid ? '#222' : '#555' }"
            ></p>
        <div class="dropdown">
            <div
                id="dropdownThumbsup"
                aria-expanded="false"
                aria-haspopup="true"
                class="btn btn-link dropdown-toggle ml-3 icon"
                data-toggle="dropdown"
                type="button"
            ><i class="fa fa-thumbs-up"></i></div>
            <ul aria-labelledby="dropdownThumbsup" class="dropdown-menu">
                <li @click="set_rule_response('user_rating', 'helpful')">Dieses Feedback ist für mich hilfreich.</li>
                <li @click="set_rule_response('user_rating', 'applicable')">Dieses Feedback will ich umsetzen</li>
            </ul>
        </div>
        <div class="dropdown">
            <div
                id="dropdownThumbsDown"
                aria-expanded="false"
                aria-haspopup="true"
                class="btn btn-link dropdown-toggle ml-3 icon"
                data-toggle="dropdown"
                type="button"
            ><i class="fa fa-thumbs-down"></i></div>
            <ul aria-labelledby="dropdownThumbsDown" class="dropdown-menu">
                <li @click="set_rule_response('user_rating', 'not-applicable')">Das trifft nicht auf mich zu</li>
                <li @click="set_rule_response('user_rating', 'later')">Jetzt nicht, später.</li>
            </ul>
        </div>
        <span v-if="mode!='minimal'" class="right">{{ dateToHumanReadable(recommendation.timecreated) }}</span>
    </div>
</template>


<script>
import Communication from "../scripts/communication";

export default {
    name: "RecommendationItem",

    props: {
        recommendation: {type: Object, required: true},
        courseid: {type: Number, required: true},
        timeAgo: {type: Object, required: false},
        mode: {type: String, required: false}
    },

    data() {
        return {
            rating: this.recommendation.rating,
            id: this.recommendation.id,
            classOfCategory: {
                "time_management": "fa-clock",
                "progress": "fa-chart-line",
                "success": "fa-thumbs-up",
                "social": "fa-people-group",
                "competency": "fa-lightbulb"
            },
        };
    },

    watch: {
        rating(newVal) {
            //this.updateUnderstanding(newVal);
        },
    },

    methods: {
        async set_rule_response(response_type, user_response){
            if(response_type == 'user_rating'){
                this.rating = user_response;
            }
            const data = {
                    'course_id': this.courseid,
                    'action_id': this.id,
                    'response_type': response_type,
                    'user_response': user_response,
                };
            const response = await Communication.webservice('set_rule_response', data);
            if (!response.success) {
                console.log('No connection to webservice /set_rule_response/');
            }
        },

        dateToHumanReadable(date){
            return this.timeAgo.format(date);
        },
        addToTaskList(url) {
            this.$emit('add-to-task-list', {
                course: this.courseid,
                task: this.recommendation.title, 
                completed: this.completed ? 1 : 0,
                duedate: null,
            });
        }
    }
}
</script>


<style scoped>
@import "../scss/variables.scss";
.icon {
  color: rgba(0,0,0,.6);
  width: 20px;
  height: 26px;
  font-size: 16px;
  display: inline;
  border: none;
  align-items: center;
  justify-content: center;
  padding-left: 4px;
  padding-right: 4px;
  margin:0;
}

.icon:hover {
    text-decoration: none;
    color: $blue-default;
}

.dropdown {
    display:inline;

}

.dropdown-toggle::after{
    display: none;
}

ul.dropdown-menu {
    cursor: pointer;
    width: 180px;
}

ul.dropdown-menu {
    padding: 0;
    margin:0;
}

ul.dropdown-menu  li {
    padding: 2px 4px;
}

ul.dropdown-menu  li:hover {
    background-color: $blue-default;
    color: #fff;
}


</style>