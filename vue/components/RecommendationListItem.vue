<template>
    <div class="mr-5">
        <h5><i :class="'fa pr-2 ' + classOfCategory[recommendation.category]"></i>{{ recommendation.title }}</h5>
        <p v-html="recommendation.description"></p>
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
                <li @click="rateFeedback(recommendation.id, 'helpful')">Dieses Feedback ist für mich hilfreich.</li>
                <li @click="rateFeedback(recommendation.id, 'applicable')">Dieses Feedback will ich umsetzen</li>
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
                <li @click="rateFeedback(recommendation.id, 'not-applicable')">Das trifft nicht auf mich zu</li>
                <li @click="rateFeedback(recommendation.id, 'later')">Jetzt nicht, später.</li>
            </ul>
        </div>
        <span class="right">{{ dateToHumanReadable(recommendation.timecreated) }}</span>
    </div>
</template>


<script>
import Communication from "../scripts/communication";

export default {
    name: "RecommendationListItem",

    props: {
        recommendation: {type: Object, required: true},
        courseid: {type: Number, required: true},
        timeAgo: {type: Object, required: true},
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
        rateFeedback(id, rating){
            this.rating = rating;
            console.log('LAD::Rulerating@Recommendations: ',id, rating);
        },

        dateToHumanReadable(date){
            return this.timeAgo.format(date);
        },
        /*
        async updateUnderstanding(newVal) {
            if(this.courseid == undefined || this.id == undefined || newVal == undefined){
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
        */
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