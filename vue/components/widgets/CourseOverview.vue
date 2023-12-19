
<template>
    <div id="dashboard-overview" class="position-relative d-flex flex-column">
        <widget-heading
            icon="fa-calendar-o"
            :info-content="info"
            title="Kursübersicht">
        </widget-heading>
        <div class="row mb-3 form-group">
            <div class="col-4 form-group">
                <nav hidden class="nav nav-pills nav-sm flex-column flex-sm-row">
                    <label for="select-timerange">Zeitraum filtern:</label>
                    <div class="flex-sm-fill text-sm-center nav-link active">etzten 24 Stunden</div>
                    <div class="text-sm-center nav-link">7 Tage</div>
                    <div class="flex-sm-fill text-sm-center ">14 Tage</div>
                    <div class="flex-sm-fill text-sm-center nav-link">letzter Monat</div>
                    <div class="flex-sm-fill text-sm-center nav-link">Semester</div>
                </nav>
                <select hidden id="select-timerange" class="form-control w-50 form-control-sm"
                    aria-label=".form-select-sm example" style="margin-left:15px;display:inline-block;">
                    <option selected>letzten 24 Stunden</option>
                    <option value="1">letzten 7 Tage</option>
                    <option value="2">letzten 14 Tage</option>
                    <option value="3">letzter Monat</option>
                    <option value="3">seit Semesterbeginn</option>
                </select>
            </div>
        </div>
        <div class="row col-12 mb-2">
            <span class="col-3" style="text-align:right;"><strong>Kurseinheit</strong></span>
            <span v-if="!is1801Course()" class="col-2">
                <strong class="word-wrap">Videos</strong>
                <span class="d-none d-md-block">ansehen und verstehen</span>
            </span>
            <span class="col-2">
                <strong class="word-wrap">Kurstext</strong>
                <span class="d-none d-md-block">lesen und verstehen</span>
            </span>
            <span v-if="is1801Course()" class="col-2">
                <strong class="word-wrap">Selbsttests</strong>
                <span class="d-none d-md-block">lösen und Lerninhalte anwenden</span>
            </span>
            <span class="col-2">
                <strong class="word-wrap">Einsendeaufgaben</strong>
                <span class="d-none d-md-block">bearbeiten und in der Klausur Zeit sparen</span>
            </span>
            <span v-if="research_condition != 'control_group'" class="col-3">
                <strong class="word-wrap">Abschlussreflexion</strong>
                <span class="d-none d-md-block">bearbeiten und besser in der Klausur
                    abschneiden</span>
            </span>
        </div>

        <div v-for="(section, index) in stats" v-if="isNoExcludedSection(section.sectionname)" class="row col-12 mb-0">
            <div class="col-3 mb-1 word-wrap" style="border: solid #111 0pt;text-align:right;">
                <!-- Course Unit -->
                {{ shortenTitle(section.sectionname) }}
            </div>
            <div v-if="!is1801Course()" class="col-2 mb-1" style="border: solid #111 0pt;">
                <!-- Hypervideo -->
                <span v-if="section.hypervideo" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="{
                            'position': 'absolute',
                            'background-color': getBarColor('hypervideo_completion', getRatio(section.hypervideo.complete, section.hypervideo.count)),
                            'color': getBarFontColor('hypervideo_completion', getRatio(section.hypervideo.complete, section.hypervideo.count)),
                            'display':'block',
                            'height': '100%',
                            'width': getRatio(section.hypervideo.complete, section.hypervideo.count, 100) + '%'
                        }">
                    </span>
                    <span class="p-1 d-none d-md-block"
                        style="z-index:10;position:absolute;color:#222;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                        {{ getRatio(section.hypervideo.complete, section.hypervideo.count).toFixed(1) }}% gesehen
                    </span>
                </span>
                <span v-if="section.longpage == null">-</span>
            </div>
            <div class="col-2 mb-1" style="border: solid #111 0pt;">
                <!-- Longpage -->
                <span v-if="section.longpage" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="{
                            'position': 'absolute',
                            'background-color': getBarColor('longpage_completion', getRatio(section.longpage.complete, section.longpage.count)),
                            'display': 'block',
                            'height': '100%',
                            'width': getRatio(section.longpage.complete, section.longpage.count, 100) + '%'
                        }">
                    </span>
                    <span class="p-1 d-none d-md-block"
                        :style="{
                            'z-index': 10,
                            'position': 'absolute',
                            'color': getBarFontColor('longpage_completion', getRatio(section.longpage.complete, section.longpage.count)),
                            'font-size': '0.7rem',
                            'vertical-align': 'middle',
                            'display': 'block',
                            'height': '100%'
                            }">
                        {{ Math.round(getRatio(section.longpage.complete, section.longpage.count, 100)) }}% gelesen
                    </span>
                </span>
                <span v-if="section.longpage == null">-</span>
            </div>
            <div v-if="is1801Course()" class="col-2 mb-1" style="border: solid #111 0pt;">
                <!-- Self Assessment -->
                <span v-if="section.quiz" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="{
                            'position': 'absolute',
                            'background-color': getBarColor('quiz_completion', getRatio(section.quiz.complete, section.quiz.count)),
                            'color': getBarFontColor('quiz_completion', getRatio(section.quiz.complete, section.quiz.count)),
                            'display':'block',
                            'height': '100%',
                            'width': getRatio(section.quiz.complete, section.quiz.count, 100) + '%'
                        }">
                    </span>
                    <span class="p-1 d-none d-md-block"
                        :style="{
                            'z-index': 10,
                            'position': 'absolute',
                            'color': getBarFontColor('quiz_completion', getRatio(section.quiz.complete, section.quiz.count)),
                            'font-size': '0.7rem',
                            'vertical-align': 'middle',
                            'display': 'block',
                            'height': '100%'
                            }">
                        {{ section.quiz.complete }} von {{ section.quiz.count }} bearbeitet
                    </span>
                </span>
                <span hidden v-if="section.quiz" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="'position:absolute;background-color:'+getBarColor('quiz_score', section.quiz.achieved_score)+';display:block;height:100%;width:'+ getRatio(section.quiz.achieved_score, section.quiz.max_score, 100) +'%;'">
                    </span>
                    <span class="p-1 d-none d-md-block"
                        :style="{
                            'z-index': 10,
                            'position': 'absolute',
                            'color': getBarFontColor('quiz_completion', getRatio(section.quiz.complete, section.quiz.count)),
                            'font-size': '0.7rem',
                            'vertical-align': 'middle',
                            'display': 'block',
                            'height': '100%'
                            }">
                        {{ section.quiz.achieved_score }} , {{section.quiz.max_score }}% korrekt
                    </span>
                </span>
                <span v-if="section.quiz == null">-</span>
            </div>
            <div class="col-2 mb-1" style="border: solid #111 0pt; height:40px;">
                <!-- Submission tasks -->
                <span v-if="section.assign" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="{
                            'position': 'absolute',
                            'background-color': getBarColor('assign_completion', getRatio(section.assign.complete, section.assign.count)),
                            'color': getBarFontColor('assign_completion', getRatio(section.assign.complete, section.assign.count)),
                            'display':'block',
                            'height': '100%',
                            'width': getRatio(section.assign.complete, section.assign.count, 100) + '%'
                        }">
                    </span>
                    <span class="p-1 d-none d-md-block"
                    :style="{
                            'z-index': 10,
                            'position': 'absolute',
                            'color': getBarFontColor('assign_completion', getRatio(section.assign.complete, section.assign.count)),
                            'font-size': '0.7rem',
                            'vertical-align': 'middle',
                            'display': 'block',
                            'height': '100%'
                            }">
                        {{ section.assign.complete }} von {{ section.assign.count }} bearbeitet
                    </span>
                </span>
                <span v-if="section.assign" class="mb-1"
                    style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                    <span
                        :style="'position:absolute;background-color:'+getBarColor('assign_score', getRatio(section.assign.achieved_score, section.assign.max_score))+';display:block;height:100%;width:'+ getRatio(section.assign.achieved_score, section.assign.max_score, 100) +'%;'">
                    </span>
                    <span class="p-1 d-none d-md-block" :style="{
                            'z-index': 10,
                            'position': 'absolute',
                            'color': getBarFontColor('assign_completion', getRatio(section.assign.complete, section.assign.count)),
                            'font-size': '0.7rem',
                            'vertical-align': 'middle',
                            'display': 'block',
                            'height': '100%'
                            }">
                        {{ Math.round(getRatio(section.assign.achieved_score, section.assign.max_score), 0) }}% korrekt
                    </span>
                </span>
                <span v-if="section.assign == null">-</span>
            </div>
            <div v-if="research_condition != 'control_group'" class="col-3 mb-1" style="border: solid #111 0pt;">
                <!-- Reflection task -->
                <button class="btn btn-default reflection-btn" :disabled="sectionMinimumAchived(section.id) == false"
                    :style="{
                        'color': getReflectionButtonFontColor(section.id),
                        'background-color': getReflectionButtonColor(section.id)  
                    }"
                    data-toggle="modal" data-target="#refelctionModal" @click="setCurrentReflectionSection(index)">
                    <span class="d-none d-md-block">Reflexion</span>
                </button>
            </div>
        </div>
        <div class="row col-12 mb-3" style="">
            <span class="col-3"></span>
            <span v-if="!is1801Course()" class="col-2">
                {{ Math.round(getRatio(sumScores.hypervideo.complete, sumScores.hypervideo.count)) }}% gesehen
            </span>
            <span class="col-2">
                {{ Math.round(getRatio(sumScores.longpage.complete, sumScores.longpage.count)) }}% gelesen
            </span>
            <span v-if="is1801Course()" class="col-2">
                {{  Math.round(getRatio(sumScores.quiz.complete, sumScores.quiz.count)) }}% erledigt
            </span>
            <span class="col-2">
                {{  Math.round(getRatio(sumScores.assign.complete, sumScores.assign.count)) }}% erledigt
            </span>
            <span v-if="research_condition != 'control_group'" class="col-3">
                {{ getNumberOfReflectedSections() }}/{{ sectionnames.length }} erledigt
            </span>
        </div>
        <div hidden class="right col-8 small mt-3 mr-3 mb-3">
            Beachten Sie auch die anderen Lernmaterialien wie die <a href="#">Virtuellen Treffen</a>, <a
                href="#">Praktischen Übungen</a> und <a href="#">Prüfungsvorbereitungen</a>
        </div>
        

        <!-- MODAL POPUP for REFLECTIONS -->
        <Teleport to="body">
        <div class="modal fade" id="refelctionModal" tabindex="-1" role="dialog" aria-labelledby="refelctionModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                <form @submit.prevent="saveReflection">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="refelctionModalLabel">Abschlussreflexion zu KE {{ currentReflectionSection }}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Schließen">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3 lead">
                                <!-- 
                        This assignment is designed to help you pause for a moment and think about your learning progress in the Devices and Processes unit. 
                        It is important that you answer these questions truthfully so that you can properly direct your learning.
                        -->
                                Diese Aufgabe soll Ihnen helfen einen Moment innezuhalten und über Ihren Lernfortschritt
                                in der Kurseinheit {{currentReflectionSection}} nachzudenken.
                                Es ist wichtig, dass Sie diese Aufgaben wahrheitsgemäß beantworten damit Sie Ihr Lernen
                                danach ausrichten können.
                                <br>
                                <ul>
                                    <li>
                                        <!-- 
                            After completing various self-assessment tasks and receiving feedback, are you satisfied with the results? 
                            Did you develop knowledge of the topic consistent with your learning goals? 
                        -->
                                        Sind Sie nach dem Abschluss mehrerer Selfsttest- oder Einsendeaufgaben mit den
                                        Ergebnissen zufrieden?
                                        Konnten Sie Ihr Wissen zum Thema der Kurseinheit im Hinblick auf die Lernziele
                                        ausbauen?
                                    </li>
                                    <li>
                                        <!-- 
                            Is it necessary to re-study Devices and Processes unit? 
                            Is there a need to change the current way of learning and planning, 
                            to better cope with the next learning chapter (allocate more time for 
                            learning, employ different approach, study material with more attention...)?
                        -->
                                        Ist es notwendig, die Kurseinheit noch einmal zu wiederholen?
                                        Ist es erforderlich, die derzeitige Vorgehensweise beim Lernen und Planen zu
                                        ändern, um die anderen Kurseinheiten besser bewältigen zu können
                                        (mehr Zeit für das Lernen einplanen, eine andere Lernstrategie wählen, das
                                        Material mit mehr Aufmerksamkeit studieren...)?
                                    </li>
                                    <li>
                                        <!--
                            Can you name any problem that has hindered your results and knowledge 
                            (lack of time, poor planning, prior knowledge, inability to understand a particular concept...)? 
                            Did you discover any faults in what you had previously believed to be right? Can you overcome it for the next unit?
                        -->
                                        Können Sie ein Problem nennen, das Ihre Lernergebnisse und Ihren Wissenserwerb
                                        beeinträchtigt haben (Zeitmangel, schlechte Planung, Vorwissen, Unfähigkeit, ein
                                        bestimmtes Konzept zu verstehen...)?
                                        Haben Sie Fehler in dem entdeckt, was Sie bisher für richtig hielten? Können Sie
                                        diese bei der nächsten Kurseinheit beheben?
                                    </li>
                                </ul>
                                <!-- Write a short note of no more than 300 words (approximately 100 per question) to this questions and submit it in the box provided below.   -->
                                Schreiben Sie eine kurze Notiz von nicht mehr als 300 Wörtern (ca. 100 Wörter pro Frage)
                                zu diesen Fragen in das folgende Textfeld.
                            </div>
                            <textarea v-model="reflection" class="mt-2"
                                style="width:100%; min-height:150px;font-size:20px;padding:10px;"></textarea>

                            <input type="hidden" name="version" :value="1" />
                            Sec: {{ currentReflectionSection }}
                            <div class="mt-2" v-for="(ref, index) in reflections">
                                <div v-if="ref.section==currentReflectionSection">
                                    <em>Version {{ index }} vom {{ ref.timecreated }}</em><br>
                                    {{ ref.reflection }}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div v-if="reflectionError" class="alert alert-danger">Entschuldigen Sie, es ist ein Fehler aufgetreten. Wir kümmern uns darum. Haben Sie bitte Geduld.</div>
                            <button type="button" class="btn btn-link mr-4" data-dismiss="modal">Schließen</button>
                            <button type="submit" class="btn btn-primary">Speichern</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        </Teleport>
    </div>
</template>



<script>

import WidgetHeading from "../WidgetHeading.vue";
import Communication from "../../scripts/communication";
import {mapState, mapGetters} from 'vuex';
import Teleport from 'vue2-teleport';


export default {
    name: 'WidgetCourseOverview',
    props: ['course', 'log', 'surveyRequired', 'surveyLink'],
    components: {
        WidgetHeading,
        Teleport
    },

    data: function () {
        return {
            currentGoal: 'mastery', // dummy
            color: {
                default: '#CED4DA',//'#7cc0d8',
                orange: '#B1D9F9',//'#e79c63',
                green: '#06375E',//'#88c2b7',
                yellow: '#2487D3',//'#e7c87a'
            },
            fontcolor: {
                default: '#222',//'#7cc0d8',
                orange: '#222',//'#e79c63',
                green: '#fff',//'#88c2b7',
                yellow: '#fff',//'#e7c87a'
            },
            sections: [],
            dashboardsectionexclude: [],
            sectionnames: [],
            activities: [],
            info: '',
            current: { id: 0, section: 0 },
            stats: [],
            sumScores: {
                longpage: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                quiz: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                assign: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                hypervideo: { count: 0, complete: 0, achieved_score: 0, max_score: 0 }
            },
            reflections: [],
            reflectionError: false, 
            currentReflectionSection: 0,
            
            goals: {
                mastery: {
                    hypervideo_completion: { low: 60, med: 85 },
                    hypervideo_score: { low: 60, med: 85 },
                    longpage_completion: { low: 60, med: 85 },
                    longpage_score: { low: 60, med: 85 },
                    assign_completion: { low: 60, med: 85 },
                    assign_score: { low: 60, med: 85 },
                    quiz_completion: { low: 60, med: 85 },
                    quiz_score: { low: 60, med: 85 },

                },
                passing: {
                    hypervideo_completion: { low: 45, med: 75 },
                    hypervideo_score: { low: 45, med: 75 },
                    longpage_completion: { low: 45, med: 75 },
                    longpage_score: { low: 45, med: 75 },
                    assign_completion: { low: 45, med: 75 },
                    assign_score: { low: 45, med: 75 },
                    quiz_completion: { low: 45, med: 75 },
                    quiz_score: { low: 45, med: 75 },

                },
                overview: {
                    hypervideo_completion: { low: 0, med: 100 },
                    hypervideo_score: { low: 0, med: 100 },
                    longpage_completion: { low: 0, med: 100 },
                    longpage_score: { low: 0, med: 100 },
                    assign_completion: { low: 0, med: 100 },
                    assign_score: { low: 0, med: 100 },
                    quiz_completion: { low: 0, med: 100 },
                    quiz_score: { low: 0, med: 100 },
                }
            }
        };
    },

    mounted: function () {
        this.loadCourseData();
        this.loadReflection();
    },

    computed: {
        ...mapState(['courseid', 'userid', 'research_condition']),
    },

    methods: {
        ...mapGetters(['is1801Course']),

        loadCourseData: async function () {
            const response = await Communication.webservice(
                'overview',
                { courseid: this.courseid }
            );
            if (response.success) {
                response.data = JSON.parse(response.data)
                console.log('LAD-DATA::input debug::', JSON.parse(response.data.debug));
                console.log('LAD-DATA::input completions::', JSON.parse(response.data.completions));

                this.sections = this.groupBy(JSON.parse(response.data.completions), 'section');
                console.log('LAD-DATA::sections', this.sections)
                this.stats = this.calcStats();
                console.log('LAD-DATA::stats', this.stats);

                //_this.dashboardsectionexclude = $('#dashboardsectionexclude').text().replace(' ','').split(',');
                //_this.dashboardsectionexclude = _this.dashboardsectionexclude.isArray() ? _this.dashboardsectionexclude : [];
                //_this.dashboardsectionexclude = _this.dashboardsectionexclude.map(function(d){ return parseInt(d, 10); });

                //console.log('ss',_this.sections);
                //_this.sections = _this.sections.filter(function(d, index){  
                //    return _this.dashboardsectionexclude.includes(index) == false; 
                //});
                //console.log('ss2',_this.sections);
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /overview/', response.data);
                } else {
                    console.log('No connection to webservice /overview/');
                }
            }
        },
        groupBy: function (data, key) {
            var arr = [];
            for (var val in data) {
                arr[data[val][key]] = arr[data[val][key]] || [];
                arr[data[val][key]].push(data[val]);
            }
            return arr.filter(function (el) {
                return el !== null;
            });
        },
        trackClick: function () {
            //let instance = this.getCurrent();
            //this.$emit('log', 'dashboard_overview_item_click', { type: instance.type, instance: instance.id });
        },
        calcStats: function () {
            let stats = [];
            for (var j = 0; j < this.sections.length; j++) {
                var section = this.sections[j];
                for (var i = 0; i < section.length; i++) {
                    if (section[i].visible == '0') {
                        continue;
                    }
                    if (stats[section[i].section] == undefined) {
                        stats[section[i].section] = {};
                    }
                    if (stats[section[i].section][section[i].type] == undefined) {
                        this.sectionnames[section[i].section] = section[i].sectionname
                        stats[section[i].section][section[i].type] = {
                            type: section[i].type,
                            count: 0,
                            achieved_score: 0,
                            max_score: 0,
                            complete: 0
                        };
                    }
                    section[i].count = section[i].count == undefined ? 1 : section[i].count;
                    if (section[i].type == "longpage" || section[i].type == "hypervideo") {
                        stats[section[i].section][section[i].type].count += parseInt(section[i].count, 10);
                        stats[section[i].section][section[i].type].complete += section[i].complete != undefined ? parseInt(section[i].complete, 10) : 0;

                    } else if(section[i].type == "assign"){
                        
                        stats[section[i].section][section[i].type].count = stats[section[i].section][section[i].type].count + 1;//parseInt(section[i].count, 10) + 1;
                        stats[section[i].section][section[i].type].complete += section[i].submission_time != null ? 1 : 0;
                        stats[section[i].section][section[i].type].achieved_score += section[i].achieved_score != null ? parseInt(section[i].achieved_score, 10) : 0;
                        stats[section[i].section][section[i].type].max_score += section[i].max_score != null ? parseInt(section[i].max_score, 10) : 0;

                    } else if(section[i].type == "quiz"){
                        stats[section[i].section][section[i].type].count = stats[section[i].section][section[i].type].count + 1;
                        stats[section[i].section][section[i].type].complete += section[i].submission_time != null ? 1 : 0;
                        if(section[i].achieved_score != null && section[i].max_score != null ){
                            // FIXME:
                            // section[i].achieved_score >= 0
                            stats[section[i].section][section[i].type].achieved_score += parseInt(section[i].achieved_score, 10) > parseInt(section[i].max_score, 10) ? parseInt(section[i].max_score, 10) : parseInt(section[i].achieved_score, 10);
                            stats[section[i].section][section[i].type].max_score += parseInt(section[i].max_score, 10);
                        
                        }
                    } else{
                        //
                    }
                }
            }
            stats = stats.filter(function (n) { return n; });
            
            
            //
            let out = [];
            let sum = {
                hypervideo: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                longpage: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                quiz: { count: 0, complete: 0, achieved_score: 0, max_score: 0 },
                assign: { count: 0, complete: 0, achieved_score: 0, max_score: 0 }
            };
            for (var i = 0; i < stats.length; i++) {
                var el = {
                    sectionname: this.sectionnames[i].replace(':', ':\n'),
                    id: i
                };
                if (stats[i] == null) {
                    continue;
                }
                if (stats[i].hypervideo) {
                    el.hypervideo = {
                        count: stats[i].hypervideo.count,
                        complete: stats[i].hypervideo.complete
                    }
                    sum.hypervideo.count += stats[i].hypervideo.count;
                    sum.hypervideo.complete += isNaN(stats[i].hypervideo.complete) ? stats[i].hypervideo.complete : 0;
                }
                if (stats[i].longpage) {
                    el.longpage = {
                        count: stats[i].longpage.count,
                        complete: stats[i].longpage.complete
                    }
                    sum.longpage.count += stats[i].longpage.count;
                    sum.longpage.complete += stats[i].longpage.complete;
                }
                if (stats[i].quiz) {
                    el.quiz = {
                        count: stats[i].quiz.count,
                        complete: stats[i].quiz.complete,
                        achieved_score: stats[i].quiz.achieved_score,
                        max_score: stats[i].quiz.max_score
                    }
                    sum.quiz.count += stats[i].quiz.count;
                    sum.quiz.complete += stats[i].quiz.complete;
                    sum.quiz.achieved_score += stats[i].quiz.achieved_score;
                    sum.quiz.max_score += stats[i].quiz.max_score;
                }
                if (stats[i].assign) {
                    el.assign = {
                        count: stats[i].assign.count,
                        complete: stats[i].assign.complete,
                        achieved_score: stats[i].assign.achieved_score,
                        max_score: stats[i].assign.max_score
                    };
                    sum.assign.count += stats[i].assign.count;
                    sum.assign.complete += stats[i].assign.complete;
                    sum.assign.achieved_score += stats[i].assign.achieved_score;
                    sum.assign.max_score += stats[i].assign.max_score;
                }
                out.push(el);
            }
            this.sumScores = sum;
            
            
            // reduce the number of sections
            for(let i = 0; i < this.sectionnames.length; i++) {
                if(!this.sectionnames[i].includes('Kurseinheit')){
                    this.sectionnames.splice(i, 1);
                }
            }
            

            return out;
        },
        shortenTitle: function(title){
            return title.replace('Kurseinheit', 'KE');
        },
        isNoExcludedSection: function(title){
            if(
                title == 'Willkommen!' || 
                title == 'Allgemeines' || 
                title == 'General' ||
                title == 'Prüfung' ||
                title == 'Praktische Übungen' ||
                title == 'Prüfungsvorbereitung' ||
                title == 'FAQs zu den Lernunterstützungen'
                ){
                return false;
            }
            return true;
        },
        getRatio: function (a, b, max = 0) {
            if (parseInt(a) > 0 && parseInt(b) > 0) {
                var ratio = (parseInt(a) / parseInt(b)) * 100;
                ratio = ratio < 0 ? 0 : ratio;
                ratio = max > 0 && ratio > max ? max : ratio;
                return ratio;
            }
            return 0;
        },
        getBarColor: function (type, ratio) {
            if (this.currentGoal == 'overview') {
                return this.color.default;
            }
            if (ratio < this.goals[this.currentGoal][type].low) {
                return this.color.orange;
            } else if (ratio > this.goals[this.currentGoal][type].med) {
                return this.color.green;
            } else {
                return this.color.yellow;
            }
        },
        getBarFontColor: function (type, ratio) {
            if (this.currentGoal == 'overview') {
                return this.fontcolor.default;
            }
            if (ratio < this.goals[this.currentGoal][type].low) {
                return this.fontcolor.orange;
            } else if (ratio > this.goals[this.currentGoal][type].med) {
                return this.fontcolor.green;
            } else {
                return this.fontcolor.yellow;
            }
        },
        /**
         * Green color – when Reflection task is done.
         * Yellow color – when the time is to reflect – assign_completion 45 (for passing) or 65 (for mastery).
         * Red color – when the time is to reflect, but student starts doing tasks from another unit 
         * – conditions from yellow + assign_completion 20 (for any other unit in which Reflection task is not done).
         * @param {*} section_id 
         */
        getReflectionButtonColor: function (section_id) {
            if (this.reflectionOfSectionDone(section_id)) {
                return this.currentGoal == 'overview' ? this.color.default : this.color.green;
            }
            if (this.sectionMinimumAchived(section_id)) {
                let sum = 0;
                for (let i = section_id + 1; i < this.sections.length; i++) {
                    var res = this.stats.filter(function (d) { return d.id == i })[0];
                    if (res == null) {
                        continue;
                    }
                    sum += res.hasOwnProperty('quiz') ? res.quiz.complete / res.quiz.count * 100 : 0;
                    sum += res.hasOwnProperty('assign') ? res.assign.complete / res.assign.count * 100 : 0;
                    if (sum > 20) {
                        return this.color.orange;
                    }
                }
                return this.color.yellow;
            }
            // default
            return '#ddd';
        },
        getReflectionButtonFontColor: function (section_id) {
            if (this.reflectionOfSectionDone(section_id)) {
                return this.currentGoal == 'overview' ? this.fontcolor.default : this.fontcolor.green;
            }
            if (this.sectionMinimumAchived(section_id)) {
                let sum = 0;
                for (let i = section_id + 1; i < this.sections.length; i++) {
                    var res = this.stats.filter(function (d) { return d.id == i })[0];
                    if (res == null) {
                        continue;
                    }
                    sum += res.hasOwnProperty('quiz') ? res.quiz.complete / res.quiz.count * 100 : 0;
                    sum += res.hasOwnProperty('assign') ? res.assign.complete / res.assign.count * 100 : 0;
                    if (sum > 20) {
                        return this.fontcolor.orange;
                    }
                }
                return this.fontcolor.yellow;
            }
            // default
            return '#222';
        },
        sectionMinimumAchived: function (sectionId) {
            return true;
            var res = this.stats.filter(function (d) { return d.id == sectionId })[0];
            var quiz_ratio = res.hasOwnProperty('quiz') ? res.quiz.complete / res.quiz.count * 100 : 0;
            var assign_ratio = res.hasOwnProperty('assign') ? res.assign.complete / res.assign.count * 100 : 0;
            if (this.currentGoal == 'mastery') {
                return quiz_ratio + assign_ratio > 65 ? true : false;
            }
            if (this.currentGoal == 'passing') {
                return quiz_ratio + assign_ratio > 45 ? true : false;
                //return ( quiz_ratio > 10 && assign_ratio > 10 ) || ( quiz_ratio > 30 || assign_ratio > 30 ) ? true : false;
            }
            if (this.currentGoal == 'overview') {
                return quiz_ratio + assign_ratio > 20 ? true : false;
            }

        },
        setCurrentReflectionSection: function (id) {
            this.currentReflectionSection = id;
        },
        loadReflection: async function () {
            const response = await Communication.webservice(
                'reflectionread',
                { 'courseid': this.courseid }
            );
            if (response.success) {
                this.reflections = JSON.parse(response.data);
            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /reflectionread/', response.data);
                } else {
                    console.log('No connection to webservice /reflectionread/');
                }
            }
        },
        saveReflection: async function (data) {
            var _this = this;
            this.reflectionError = false;  
            const response = await Communication.webservice(
                'reflectioncreate',
                {
                    data: {
                        'course': this.courseid,
                        'section': parseInt(this.currentReflectionSection, 10),
                        'reflection': this.reflection
                    }
                }
            );
            if (response.success) {
                this.loadReflection();
                this.reflection = '';
                this.reflectionError = false;
                $('#refelctionModal').modal('hide');
            } else {
                this.reflectionError = true; 
                if (response.data) {
                    console.log('Faulty response of webservice /reflectionread/', response.data);
                } else {
                    console.log('No connection to webservice /reflectionread/', response.data);
                }
            }
        },
        getNumberOfReflectedSections: function () {
            var _this = this;
            var t = [];
            for (var ref in this.reflections) {
                t.push(this.reflections[ref].section);
            }
            t = [...new Set(t)];
            return t.length;
        },
        reflectionOfSectionDone: function (section) {
            for (var ref in this.reflections) {
                if (parseInt(this.reflections[ref].section, 10) == section) {
                    return true;
                }
            }
            return false;
        }
    }
}
</script>


<style>
.word-wrap {

    /* These are technically the same, but use both */
    overflow-wrap: break-word;
    word-wrap: break-word;

    -ms-word-break: break-all;
    /* This is the dangerous one in WebKit, as it breaks things wherever */
    word-break: break-all;
    /* Instead use this non-standard one: */
    word-break: break-word;

    /* Adds a hyphen where the word breaks, if supported (No Blink) */
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
}

#select-goa .fa-caret-down::before {
  content: "\f0d7";
}

.modal-backdrop {
    z-index: -46  !important;
}

.modal {
    z-index: 1000;
}

.reflection-btn{
    display:block; width:100%; height:30px; color:#222; 
}
</style>

