<template>
    <div class="position-relative h-100 d-flex flex-column">
        <widget-heading icon="fa fa-lightbulb" :info-content="info" title="Empfehlungen"></widget-heading>
        <div class="recommendations--container pr-1">
            <ul v-if="getRecommendations.length > 0" class="list-unstyled">
                <li v-for="(recommendation, index) in filteredRecommendations" :key="index" class="recommendations--item">
                    <div class="mr-5">
                        <h5><i :class="'fa pr-2 ' + classOfCategory[recommendation.category]"></i>[{{ recommendation.type }}] {{ recommendation.title }}</h5>
                        <p v-html="recommendation.description"></p>
                        <div>
                            <span>{{ dateToHumanReadable(recommendation.timecreated) }}</span>
                            <button class="btn btn-default"><i class="fa fa-arrow-up"></i></button>
                            <button class="btn btn-default"><i class="fa fa-arrow-down"></i></button>
                        </div>
                    </div>
                </li>
            </ul>
            <p v-else class="recommendations--item">
                Es scheint, dass Sie in allen Bereichen gut abschneiden und keine
                besonderen Schwächen aufweisen. Weiter so!
            </p>
        </div>
    </div>
</template>

<script>
import WidgetHeading from "../WidgetHeading.vue";
import recommendationRules from '../../data/recommendations.json';
import { mapActions, mapGetters, mapState } from 'vuex';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import de from 'javascript-time-ago/locale/de'
import recommendations from "../../store/recommendations";


export default {
    name: "WidgetRecommendations",

    components: { WidgetHeading },

    data() {
        return {
            timeago: '',
            classOfCategory: {
                "time_management": "fa-clock",
                "progress": "fa-chart-line",
                "success": "fa-thumbs-up",
                "social": "fa-people-group",
                "competency": "fa-lightbulb"
            },
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
            //return this.generateRecommendations.filter((recommendation) => !recommendation.completed);
            return this.getRecommendations.filter((recommendation) => !recommendation.completed);
        },

        ...mapState('recommendations' ['recommendations']),
        ...mapGetters('recommendations', ['getRecommendations', 'getCourseRecommendations']),

    },

    mounted: function () {
        TimeAgo.addDefaultLocale(de);
        //this.timeAgo = new TimeAgo('en-US');
        this.timeAgo = new TimeAgo('de-DE');
        this.loadRecommentations()
    },

    methods: {
        loadRecommentations() {
            let _this = this;
            
            // save to indexeddb
            let openRequest = indexedDB.open("ari_prompts", 2);

            // create/upgrade the database without version checks
            openRequest.onupgradeneeded = function () {
                let db = openRequest.result;
                if (!db.objectStoreNames.contains('prompts')) {
                    //db.createObjectStore('prompts', {keyPath: 'id'}); 
                }
            };

            openRequest.onsuccess = function () {
                let db = openRequest.result;

                db.onversionchange = function () {
                    db.close();
                    console.log("ERROR: Database is outdated, please reload the page.")
                };
                let transaction = db.transaction("prompts", "readwrite");

                // get an object store to operate on it
                let prompts = transaction.objectStore("prompts");

                let request = prompts.getAll();

                request.onsuccess = function () {
                    for (let rec in request.result) {
                        console.log('RecLISt---------------------------------------', request.result[rec])
                        let item = request.result[rec];
                        _this.$store.commit('recommendations/addRecommendation', {
                            type: item.type,
                            category: item.category,
                            title: item.title,
                            description: item.message,
                            timecreated: item.timecreated,
                        });
                    }
                };

                request.onerror = function () {
                    console.log("SERIAL3: Error reading prompts", request.error);
                };

            }
        },

        dateToHumanReadable(date){
            return this.timeAgo.format(date);
        },

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