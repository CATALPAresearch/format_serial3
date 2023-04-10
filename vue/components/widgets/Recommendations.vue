<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa-thumbs-o-up" :info-content="info"
                        title="Empfehlungen"></widget-heading>
        <div class="recommendations--container pr-1">
            <ul v-if="recommendations.length > 0" class="list-unstyled">
                <li
                    v-for="(recommendation, index) in filteredRecommendations"
                    :key="index"
                    class="recommendations--item"
                >
                    <div class="mr-5">
                        <h5>{{ recommendation.title }}</h5>
                        <p>{{ recommendation.description }}</p>
                    </div>
                </li>
            </ul>
            <p v-else class="recommendations--item">Es scheint, dass Sie in allen Bereichen gut abschneiden und keine besonderen Schwächen aufweisen. Weiter so!<p/>
        </div>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import recommendationRules  from '../../data/recommendations.json';
import {mapState} from "vuex";

export default {
    name: "Recommendations",

    components: {WidgetHeading},

    data () {
        return {
            recommendations: [],
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
            strings: 'strings'
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
            return this.recommendations.filter((recommendation) => !recommendation.completed);
        },
    },

    methods: {
        markRecommendationDone(index) {
            this.recommendations[index].completed = true;
        },

        generateRecommendations() {
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
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../scss/scrollbar.scss";

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