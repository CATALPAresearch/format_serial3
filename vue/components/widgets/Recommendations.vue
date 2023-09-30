<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa fa-lightbulb" :info-content="info" title="Feedback und Lernempfehlungen"></widget-heading>
        <div class="recommendations--container pr-1">
            <ul v-if="getRecommendations.length > 0" class="list-unstyled">
                <li v-for="(recommendation, index) in filteredRecommendations" :key="index" class="recommendations--item">
                    <RecommendationItem 
                    :recommendation="recommendation"
                    :courseid="$store.getters.getCourseid"
                    :timeAgo="timeAgo"
                    :mode="'full'"
                    ></RecommendationItem>
                </li>
            </ul>
            <p v-else class="recommendations--item">
                Zur Zeit liegt kein Feedback für Sie vor. Offenbar läuft es bei Ihnen ganz mit dem Lernen.
            </p>
        </div>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import RecommendationItem from "../RecommendationItem.vue";
// import recommendationRules from '../../data/recommendations.json';
import { mapActions, mapGetters, mapState } from 'vuex';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import de from 'javascript-time-ago/locale/de'
//import recommendations from "../../store/recommendations";


export default {
    name: "WidgetRecommendations",

    components: { WidgetHeading, RecommendationItem },

    data() {
        return {
            timeago: '',
            info: 'Dieses Widget zeigt dir Empfehlungen an, wie du deine Lernstrategien optimieren und dadurch deine Lernleistung verbessern kannst. Die Empfehlungen basieren auf den Metriken, die dir im "Lernziel"-Widget angezeigt werden. Durch die individuellen Empfehlungen kannst du deine Lernstrategien hinterfragen und gezielt verbessern.',
        }
    },

    created() {
        this.generateRecommendations();
    },

    watch: {
        learnerGoal: {
            deep: true,
            handler() {
                this.generateRecommendations();
            },
        },

        userMetrics: {
            deep: true,
            handler() {
                this.generateRecommendations();
            },
        },
        thresholds: {
            deep: true,
            handler() {
                this.generateRecommendations();
            },
        },
    },

    computed: {
        ...mapState({
            timeManagement: state => state.learnermodel.timeManagement,
            socialActivity: state => state.learnermodel.socialActivity,
            userGrade: state => state.learnermodel.userGrade,
            totalGrade: state => state.learnermodel.totalGrade,
            progressUnderstanding: state => state.learnermodel.progressUnderstanding,
            proficiency: state => state.learnermodel.proficiency,
            thresholds: state => state.learnermodel.thresholds,
            learnerGoal: 'learnerGoal',
            strings: 'strings',
            research_condition: 'research_condition',
        }),

        userMetrics() {
            return {
                timeManagement: this.timeManagement,
                grades: this.userGrade,
                proficiency: this.proficiency,
                socialActivity: this.socialActivity,
                progress: this.progressUnderstanding,
            };
        },

        filteredRecommendations() {
            // @TODO: add option to remove rcommendations
            //return this.generateRecommendations.filter((recommendation) => !recommendation.completed);
            return this.getRecommendations.filter((recommendation) => !recommendation.completed);
        },

        ...mapState('recommendations' ['recommendations']),
        ...mapGetters('recommendations', ['getRecommendations', 'getCourseRecommendations']),

    },

    mounted: function () {
        TimeAgo.addDefaultLocale(de);
        this.timeAgo = new TimeAgo('de-DE'); // @TODO Language should be stored in the settings or derived from moodle settings 'en-US'
        this.loadRecommentations();
    },

    methods: {
        ...mapActions('recommendations', ['loadRecommentations']),
       
        markRecommendationDone(index) {
            this.$store.commit('recommendations/markDone', index)
        },

        generateRecommendations() {
            /*
            this.recommendations = []
            const rules = recommendationRules[this.learnerGoal]
            const thresholds = this.thresholds[this.learnerGoal]

            for (const metric in rules) {
                const rule = rules[metric];
                const threshold = thresholds[metric];
                const metricValue = this.userMetrics[metric];

                if (metricValue <= threshold[0]) {
                    this.recommendations.push(Object.assign({ completed: false }, ...rule.recommendations));
                }
            }
            */
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../scss/scrollbar.scss";
@import "../../scss/variables.scss";

.recommendations {
    &--container {
        overflow-y: auto;
        max-height: 300px;
    }

    &--item {
        border: 1px solid #ccc;
        margin-bottom: 10px;
        padding: 10px;
        position: relative;
    }

    &--button {
        position: absolute;
        top: 5px;
        right: 5px;
    }
}


</style>