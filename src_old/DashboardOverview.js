/**
 * DashboardOverview
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      DashboardOverview
 * @copyright  2022 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @description Provides an overview of course activities in terms of their completion and achieved scrores. Additionally stude
 * @license    MIT
 * @since      3.1
 * 
 * @todo
 
 */

 define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/utils/Utils.js"
], function ($, Vue, Utils) {
    Utils = new Utils();
    return Vue.component('dashboard-overview',
        {
            props: ['course', 'log'],

            data: function () {
                return {
                    color: {
                        orange: '#e79c63',
                        green: '#88c2b7',
                        yellow: '#e7c87a'
                    },
                    sections: [],
                    dashboardsectionexclude: [],
                    sectionnames: [],
                    activities: [],
                    info: '',
                    current: { id: 0, section: 0 },
                    stats: [],
                    sumScores: {},
                    reflections: [],
                    currentReflectionSection: 0,
                    currentGoal: 'mastery',
                    goals: {
                        mastery: {
                            page_completion: { low: 50, med: 90 },
                            page_score: { low: 0, med: 0 },
                            assign_completion: { low: 61, med: 90 },
                            assign_score: { low: 61, med: 90 },
                            quiz_completion: { low: 50, med: 90 },
                            quiz_score: { low: 60, med: 100 },
                        },
                        passing: {
                            page_completion: { low: 50, med: 90 },
                            page_score: { low: 0, med: 0 },
                            assign_completion: { low: 30, med: 80 },
                            assign_score: { low: 50, med: 80 },
                            quiz_completion: { low: 30, med: 80 },
                            quiz_score: { low: 50, med: 80 },
                        },
                        overview: {
                            page_completion: { low: 50, med: 90 },
                            page_score: { low: 0, med: 0 },
                            assign_completion: { low: 10, med: 40 },
                            assign_score: { low: 40, med: 70 },
                            quiz_completion: { low: 10, med: 40 },
                            quiz_score: { low: 50, med: 70 },
                        }
                    }
                };
            },

            mounted: function () {
                var _this = this;
                // get data
                Utils.get_ws('overview', {
                    'courseid': parseInt(this.course.id, 10)
                }, function (e) {
                    try {
                        console.log('input activities::', JSON.parse(e.activities));
                        console.log('input completions::', JSON.parse(e.completions));

                        _this.sections = _this.groupBy(JSON.parse(e.completions), 'section');
                        _this.stats = _this.calcStats();

                        //_this.dashboardsectionexclude = $('#dashboardsectionexclude').text().replace(' ','').split(',');
                        //_this.dashboardsectionexclude = _this.dashboardsectionexclude.isArray() ? _this.dashboardsectionexclude : [];
                        //_this.dashboardsectionexclude = _this.dashboardsectionexclude.map(function(d){ return parseInt(d, 10); });
                        
                        //console.log('ss',_this.sections);
                        //_this.sections = _this.sections.filter(function(d, index){  
                        //    return _this.dashboardsectionexclude.includes(index) == false; 
                        //});
                        //console.log('ss2',_this.sections);
                        
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                });
                
                this.loadReflection();
            },

            methods: {
                groupBy: function(data, key) {
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
                calcStats: function(){
                    stats = [];
                    for(var j = 0; j < this.sections.length; j++){
                        var section = this.sections[j];
                        for(var i = 0; i < section.length; i++){
                            if(stats[section[i].section] == undefined){
                                stats[section[i].section] = {};
                            }
                            if(stats[section[i].section][section[i].type] == undefined){
                                this.sectionnames[section[i].section] = section[i].sectionname
                                stats[section[i].section][section[i].type] = { 
                                    type: section[i].type, 
                                    count: 0, 
                                    achieved_score: 0,
                                    max_score: 0,
                                    complete:0 
                                };
                            }
                            section[i].count = section[i].count == undefined ? 1 : section[i].count;
                            stats[section[i].section][section[i].type].count = section[i].type == "assign" ? parseInt(section[i].count, 10) : stats[section[i].section][section[i].type].count + 1;
                            stats[section[i].section][section[i].type].achieved_score += section[i].achieved_score != null ? parseInt(section[i].achieved_score, 10) : 0;
                            stats[section[i].section][section[i].type].max_score += section[i].max_score != null ? parseInt(section[i].max_score, 10) : 0;
                            stats[section[i].section][section[i].type].complete += section[i].submission_time != null ? 1 : 0;
                        }
                    }
                    stats = stats.filter(function(n){return n; });
                    this.sectionnames = this.sectionnames.filter(function(n){return n; });
                    //
                    let out = [];
                    let sum = { 
                        page: {count: 0, complete: 0, achieved_score:0, max_score:0 }, 
                        quiz: {count: 0, complete: 0, achieved_score:0, max_score:0 }, 
                        assign: {count: 0, complete: 0, achieved_score:0, max_score:0 } 
                    };
                    for(var i = 0; i < stats.length; i++){
                        var el = {
                            sectionname: this.sectionnames[i].replace(':',':\n'),
                            id: i
                        };
                        if (stats[i] == null){
                            continue;
                        }
                        if(stats[i].quiz){ // xxx for demo only // if(stats[i].page){
                            el.page = {
                                count: stats[i].quiz.count, 
                                complete: stats[i].quiz.complete,
                                //achieved_score: stats[i].quiz.achieved_score,
                                //max_score: stats[i].quiz.max_score
                            }
                            sum.page.count += stats[i].quiz.count;
                            sum.page.complete += stats[i].quiz.complete;
                            //sum.page.achieved_score += stats[i].quiz.achieved_score;
                            //sum.page.max_score += stats[i].quiz.max_score;
                            
                        }
                        if(stats[i].quiz){
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
                        if(stats[i].assign){
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
                    console.log('calc__: ', out)   
                    this.sumScores = sum;
                    return out;
                },
                getRatio: function(a, b, max=0){
                    if(parseInt(a) > 0 && parseInt(b) > 0){ 
                        var ratio = ( parseInt(a) / parseInt(b) ) * 100;
                        return max > 0 && ratio > max ? max : ratio;
                    }
                    return 0;
                },
                getBarColor: function(type, ratio){
                    if(ratio < this.goals[this.currentGoal][type].low){
                        return this.color.orange; // orange
                    }else if(ratio > this.goals[this.currentGoal][type].med){
                        return this.color.green; // green
                    }else{
                        return this.color.yellow; // yellow
                    }
                },
                setCurrentReflectionSection: function(id){ 
                    this.currentReflectionSection = id; 
                },
                switchGoal(event) {
                    this.currentGoal = event.target.value;
                    this.$forceUpdate();
                },
                loadReflection: function(){
                    var _this = this;
                    // get data
                    Utils.get_ws('reflectionread', {
                        'courseid': parseInt(this.course.id, 10)
                    }, function (e) {
                        try {
                            _this.reflections =  JSON.parse(e.data);
                            console.log("Reflection-data ", _this.reflections);
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error(e);
                        }
                    });
                },
                saveReflection(data){
                    var _this = this;
                    Utils.get_ws('reflectioncreate', { data:{
                        'course': parseInt(this.course.id, 10),
                        'section': parseInt(this.currentReflectionSection, 10),
                        'reflection': this.reflection
                        }
                    }, function (e) {
                        try {
                            _this.loadReflection();
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.log(e);
                        }
                    });
                },
                sectionMinimumAchived:  function(sectionId){
                    var res = this.stats.filter(function(d){ return d.id == sectionId})[0];
                    var quiz_ratio = res.hasOwnProperty('quiz') ? res.quiz.complete / res.quiz.count * 100 : 0;
                    var assign_ratio = res.hasOwnProperty('assign') ? res.assign.complete / res.assign.count * 100 : 0;
                    //console.log('bam', res.hasOwnProperty('quiz') ? res.quiz.complete +'__'+ res.quiz.count : 0);
                    //console.log(res);
                    return quiz_ratio > 10 && assign_ratio > 10 || quiz_ratio > 30 || assign_ratio > 30 ? true : false; 
                },
                getNumberOfReflectedSections: function(){
                    var _this = this;
                    var t = [];
                    for(var ref in this.reflections){
                        t.push(this.reflections[ref].section);
                    }
                    t = [...new Set(t)];
                    return t.length;
                },
                reflectionOfSectionDone: function(section){
                    for(var ref in this.reflections){
                        if(parseInt(this.reflections[ref].section, 10) == section){
                            return true;
                        }
                    }
                    return false;
                }
            },

            template: `
            <div id="dashboard-overview">
                    <h3>Semesterübersicht</h3>
                    <p class="w-75"></p>
                    <div class="row mb-3 form-group">
                        <div class="col-3">
                            <label for="select-goal" style="font-size:11px;">Mein Ziel ist es </label>
                            <div style="background-color:#ddeeff; color:#333; display:inline-block; width:140px; height:20px;">
                                <select 
                                    id="select-goal" 
                                    @change="switchGoal($event)"
                                    class="pt-1 pb-1 fa-caret-down lad-select mr-0" 
                                    aria-label=".form-select-sm example" 
                                    style="display:inline-block; color:#333; border:none;width:128px;height:20px;font-weigth:bold;font-size:11px;">
                                    <option selected value="mastery">den Kurs zu meistern</option>
                                    <option value="passing">den Kurs zu bestehen</option>
                                    <option value="overview">einen Überblick zu bekommen</option>
                                </select>
                                <i 
                                    class="fa fa-caret fa-caret-down mr-0" 
                                    style="color:#333; padding-right:2px; font:FontAwesome; height:20px; text-rendering: auto;-moz-osx-font-smoothing: grayscale;"></i>
                            </div>
                        </div>
                        <div class="col-2"></div>
                        <div class="col-4 form-group">
                            <nav hidden class="nav nav-pills nav-sm flex-column flex-sm-row">
                                <label for="select-timerange">Zeitraum filtern:</label>
                                <div class="flex-sm-fill text-sm-center nav-link active">etzten 24 Stunden</div>
                                <div class="text-sm-center nav-link">7 Tage</div>
                                <div class="flex-sm-fill text-sm-center ">14 Tage</div>
                                <div class="flex-sm-fill text-sm-center nav-link">letzter Monat</div>
                                <div class="flex-sm-fill text-sm-center nav-link">Semester</div>
                            </nav>
                            <select hidden id="select-timerange" class="form-control w-50 form-control-sm" aria-label=".form-select-sm example"  style="margin-left:15px;display:inline-block;">
                                <option selected>letzten 24 Stunden</option>
                                <option value="1">letzten 7 Tage</option>
                                <option value="2">letzten 14 Tage</option>
                                <option value="3">letzter Monat</option>
                                <option value="3">seit Semesterbeginn</option>
                            </select>
                        </div>
                    </div>
                    <div class="row col-10 mb-2">    
                        <span class="col-3" style="text-align:right;"><strong>Kurseinheit</strong></span>
                        <span class="col-2"><strong>Kurstext</strong> lesen und verstehen</span>
                        <span class="col-2"><strong>Selbsttests</strong> lösen und Lerninhalte anwenden</span>
                        <span class="col-2"><strong>Einsendeaufgaben</strong> bearbeiten, um in der Klausur Zeit sparen</span>
                        <span class="col-2"><strong>Abschlussreflexion</strong> bearbeiten und besser in der Klausur abschneiden</span>    
                    </div>
                    
                    <div v-for="section in stats" class="row col-10 mb-0">
                        <div class="col-3 mb-1" style="border: solid #111 0pt;text-align:right;">
                            <!-- Course Unit -->
                            {{ section.sectionname }}
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                            <!-- Longpage -->
                            <span v-if="section.page" class="mb-1" style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'page_completion\', getRatio(section.page.complete, section.page.count))+';display:block;height:100%;width:'+ getRatio(section.page.complete, section.page.count, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ section.page.complete }} von {{ section.page.count }} bearbeitet
                                </span>
                            </span>
                            <span v-if="section.page == null">-</span>
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                            <!-- Self Assessment -->
                            <span v-if="section.quiz" class="mb-1" style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'quiz_completion\', getRatio(section.quiz.complete, section.quiz.count))+';display:block;height:100%;width:'+ getRatio(section.quiz.complete, section.quiz.count, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ section.quiz.complete }} von {{ section.quiz.count }} bearbeitet
                                </span>
                            </span>
                            <span v-if="section.quiz" class="mb-1" style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'quiz_score\', getRatio(section.quiz.achieved_score, section.quiz.max_score))+';display:block;height:100%;width:'+ getRatio(section.quiz.achieved_score, section.quiz.max_score, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ Math.round(getRatio(section.quiz.achieved_score, section.quiz.max_score), 100) }}% korrekt
                                </span>
                            </span>
                            <span v-if="section.quiz == null">-</span>
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt; height:40px;">
                            <!-- Submission tasks -->
                            <span v-if="section.assign" class="mb-1" style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'assign_completion\', getRatio(section.assign.complete, section.assign.count))+';display:block;height:100%;width:'+ getRatio(section.assign.complete, section.assign.count, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ section.assign.complete }} von {{ section.assign.count }} bearbeitet
                                </span>
                            </span>
                            <span v-if="section.assign" class="mb-1" style="display:block;position:relative;width:100%;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'assign_score\', getRatio(section.assign.achieved_score, section.assign.max_score))+';display:block;height:100%;width:'+ getRatio(section.assign.achieved_score, section.assign.max_score, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ Math.round(getRatio(section.assign.achieved_score, section.assign.max_score), 0) }}% korrekt
                                </span>
                            </span>
                            <span v-if="section.assign == null">-</span>
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                        <!-- Reflection task -->
                        <div 
                                class="btn btn-default" 
                                :style="'display:block; width:100%; height:30px; color:#222; background-color:' + (sectionMinimumAchived(section.id) ? (reflectionOfSectionDone(section.id) ? color.green : color.orange) : '#ddd') +';' "
                                data-toggle="modal" 
                                data-target="#refelctionModal" 
                                @click="setCurrentReflectionSection(section.id)">
                                Reflexion
                            </div>
                        </div>
                    </div>
                    <div class="row col-10 mb-3" style="">
                        <span class="col-3"></span>
                        <span class="col-2">{{ getRatio(sumScores.page.complete, sumScores.page.count) }}% gelesen</span>
                        <span class="col-2">{{ getRatio(sumScores.quiz.complete, sumScores.quiz.count) }}% erledigt<br></span>
                        <span class="col-2">{{ getRatio(sumScores.assign.complete, sumScores.assign.count) }}% erledigt<br></span>
                        <span class="col-2">{{ getNumberOfReflectedSections() }}/{{ sectionnames.length }} erledigt</span>  
                    </div>
                    <div class="right col-8 small mt-3 mr-3 mb-3">
                        Beachten Sie auch die anderen Lernmaterialien wie die <a href="#">Virtuellen Treffen</a>, <a href="#">Praktischen Übungen</a> und <a href="#">Prüfungsvorbereitungen</a>
                    </div>
                    <div hidden style="margin: 50px 0;" class="col-10 d-flex justify-content-center">
                        <button
                            type="button" 
                            style="border-radius:10px; font-weight:bold; color:#fff;"
                            class="btn btn-warning btn-lg">
                            Ich helfe das Lernen zu verbessern
                        </button>
                    </div>
                    



                    <!-- MODAL POPUP for REFLECTIONS -->
                    <div class="modal fade" id="refelctionModal" tabindex="-1" role="dialog" aria-labelledby="refelctionModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                            <form @submit.prevent="saveReflection">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="refelctionModalLabel">Abschlussreflektion</h5>
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
                                    Diese Aufgabe soll Ihnen helfen einen Moment innezuhalten und über Ihren Lernfortschritt in der Kurseinheit xxx nachzudenken. 
                                    Es ist wichtig, dass Sie diese Aufgaben wahrheitsgemäß beantworten damit Sie Ihr Lernen danach ausrichten können.
                                    <br>
                                    <ul>
                                    <li>
                                    <!-- 
                                        After completing various self-assessment tasks and receiving feedback, are you satisfied with the results? 
                                        Did you develop knowledge of the topic consistent with your learning goals? 
                                    -->
                                        Sind Sie nach dem Abschluss mehrerer Selfsttest- oder Einsendeaufgaben mit den Ergebnissen zufrieden?
                                        Konnten Sie Ihr Wissen zum Thema der Kurseinheit im hins
                                    </li>
                                    <li>
                                    <!-- 
                                        Is it necessary to re-study Devices and Processes unit? 
                                        Is there a need to change the current way of learning and planning, 
                                        to better cope with the next learning chapter (allocate more time for 
                                        learning, employ different approach, study material with more attention...)?
                                    -->
                                        Ist es notwendig, die Kurseinheit noch einmal zu wiederholen? 
                                        Ist es erforderlich, die derzeitige Vorgehensweise beim Lernen und Planen zu ändern, um die anderen Kurseinheiten besser bewältigen zu können 
                                        (mehr Zeit für das Lernen einplanen, eine andere Lernstrategie wählen, das Material mit mehr Aufmerksamkeit studieren...)?
                                        </li>
                                    <li>
                                    <!--
                                        Can you name any problem that has hindered your results and knowledge 
                                        (lack of time, poor planning, prior knowledge, inability to understand a particular concept...)? 
                                        Did you discover any faults in what you had previously believed to be right? Can you overcome it for the next unit?
                                    -->
                                    Können Sie ein Problem nennen, das Ihre Lernergebnisse und Ihren Wissenserwerb beeinträchtigt haben (Zeitmangel, schlechte Planung, Vorwissen, Unfähigkeit, ein bestimmtes Konzept zu verstehen...)? 
                                    Haben Sie Fehler in dem entdeckt, was Sie bisher für richtig hielten? Können Sie diese bei der nächsten Kurseinheit beheben?
                                        </li>
                                    </ul>
                                    <!-- Write a short note of no more than 300 words (approximately 100 per question) to this questions and submit it in the box provided below.   -->
                                    Schreiben Sie eine kurze Notiz von nicht mehr als 300 Wörtern (ca. 100 Wörter pro Frage) zu diesen Fragen in das folgende Textfeld.
                                    </div>
                                    <textarea v-model="reflection" class="mt-2" style="width:100%; min-height:150px;font-size:20px;padding:10px;"></textarea>
                                    
                                    <input type="hidden" name="version" :value="1"/> 
                                    Sec: {{ currentReflectionSection }}
                                    <div class="mt-2" v-for="(ref, index) in reflections">
                                        <div v-if="ref.section==currentReflectionSection">
                                            <em>Version {{ index }} vom {{ ref.timecreated }}</em><br>
                                            {{ ref.reflection }}
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Schließen</button>
                                    <button type="submit" class="btn btn-primary">Speichern</button>
                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>    
            `
        });
});


