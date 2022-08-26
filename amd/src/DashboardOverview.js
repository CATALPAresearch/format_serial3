/**
 * DashboardOverview
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      DashboardOverview
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @description Shows per course section a row of rectangles indicating the completion of assigned activities.
 * @license    MIT
 * @since      3.1
 * 
 * @todo
 * - display repetition of activities
 * - provide additional information for each activity using a popover or tooltip
 * - fix empty section names
 */

 define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    // 'd3v4',
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/utils/Utils.js"
], function ($, Vue, Utils) {
    Utils = new Utils();
    return Vue.component('dashboard-overview',
        {
            props: ['course', 'log', 'milestones'],

            data: function () {
                return {
                    sections: [],
                    sectionnames: [],
                    activities: [],
                    info: '',
                    current: { id: 0, section: 0 },
                    milestoneResources: [],
                    stats: [],
                    sumScores: {},
                    reflections: [],
                    currentReflectionSection: 0
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
                getSectionName: function(index){

                },
                setCurrent: function (id, section) {
                    this.current = { id: id, section: section };
                    this.$emit('log', 'dashboard_overview_item_hover', { url: this.getLink(), completion: this.getCurrent().completion });
                },
                getCurrent: function () {
                    return this.sections[this.current.section][this.current.id];
                },
                getLink: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return M.cfg.wwwroot + '/mod/' + instance.type + '/view.php?id=' + instance.id;
                },
                getStatus: function (instance) {
                    instance = instance == undefined ? this.getCurrent() : instance;
                    return instance.completion === 0 ? '<i class="fa fa-times-square"></i>Nicht abgeschlossen' : '<i class="fa fa-check"></i> Abgeschlossen';
                },
                getMilestoneResources: function () {
                    this.milestoneResources = {};
                    for (var i = 0; this.milestones.length; i++) {
                        for (j = 0; j < this.milestones[i].resources.length; j++) {
                            let id = parseInt(this.milestones[i].resources[j].instance_id, 10);
                            if(id !== undefined){
                                this.milestoneResources.push(id);
                            }
                        }
                    }
                },
                isPartOfMilestone: function (instance) {
                    return this.milestoneResources.indexOf(parseInt(instance, 10)) !== -1 ? true : false;
                },
                trackClick: function () {
                    let instance = this.getCurrent();
                    this.$emit('log', 'dashboard_overview_item_click', { type: instance.type, instance: instance.id });
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
                    //
                    let out = [];
                    let sum = { assign: {count: 0, complete: 0, achieved_score:0, max_score:0 }, quiz: {count: 0, complete: 0, achieved_score:0, max_score:0 } };
                    for(var i = 0; i < stats.length; i++){
                        el = {
                            sectionname: this.sectionnames[i].replace(':',':\n'),
                            id: i
                        };
                        if(stats[i].page){
                            el.page = {
                                count: stats[i].page.count, 
                                complete: stats[i].page.complete
                            };
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
                        out.push(el);
                    } 
                    console.log('calccc: ', out)   
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
                    console.log('ratio',ratio)
                    if(ratio < 33){
                        return '#e79c63'; // orange
                    }else if(ratio > 80){
                        return '#88c2b7'; // green
                    }else{
                        return '#e7c87a'; // yellow
                    }
                },
                setCurrentReflectionSection: function(id){ 
                    this.currentReflectionSection = id; 
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
                }
            },

            template: `
            <div id="dashboard-overview">
                    <h3 hidden>Semesterübersicht</h3>
                    <p class="w-75"></p>
                    <div class="row mb-3 form-group">
                        <div class="col-3">
                            <label for="select-goal">Mein Ziel:</label>
                            <select 
                                id="select-goal" 
                                class="pt-1 pb-1 fa-caret-down" aria-label=".form-select-sm example" 
                                style="display:inline-block;border:none;background-color:#ddeeff;width:120px;height:20px;font-weigth:bold;font-size:12px;">
                                <option selected value="1">den Kurs meistern</option>
                                <option value="2">den Kurs bestehen</option>
                                <option value="3">einen Überblick erhalten</option>
                            </select>
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
                        <span class="col-2" style="text-align:right;"><strong>Kurseinheit</strong></span>
                        <span class="col-2"><strong>Kurstext lesen und verstehen</strong></span>
                        <span class="col-2"><strong>Selbsttests lösen und Lerninhalte anwenden</strong></span>
                        <span class="col-2"><strong>Einsendeaufgaben bearbeiten, um in der Klausur Zeit sparen</strong></span>
                        <span class="col-2"><strong>Abschlussreflexion bearbeiten und besser in der Klausur abschneiden</strong></span>    
                    </div>
                    <div v-for="(section, sIndex) in stats" class="row col-10 mb-0">
                        <div class="col-2 mb-1" style="border: solid #111 0pt;text-align:right;">
                            <!-- Course Unit -->
                            {{ section.sectionname }}
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                            <!-- Longpage -->
                            -
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                            <!-- Self Assessment -->
                            <span v-if="section.quiz" class="mb-1" style="display:block;position:relative;width:100px;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'quiz_completion\', getRatio(section.quiz.complete, section.quiz.count))+';display:block;height:100%;width:'+ getRatio(section.quiz.complete, section.quiz.count, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ section.quiz.complete }} von {{ section.quiz.count }} bearbeitet
                                </span>
                            </span>
                            <span v-if="section.quiz" class="mb-1" style="display:block;position:relative;width:100px;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'quiz_score\', getRatio(section.quiz.achieved_score, section.quiz.max_score))+';display:block;height:100%;width:'+ getRatio(section.quiz.achieved_score, section.quiz.max_score, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ Math.round(getRatio(section.quiz.achieved_score, section.quiz.max_score), 0) }}% korrekt xxx
                                </span>
                            </span>
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt; height:40px;">
                            <!-- Submission tasks -->
                            <span v-if="section.assign" class="mb-1" style="display:block;position:relative;width:100px;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'assign_completion\', getRatio(section.assign.complete, section.assign.count))+';display:block;height:100%;width:'+ getRatio(section.assign.complete, section.assign.count, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ section.assign.complete }} von {{ section.assign.count }} bearbeitet
                                </span>
                            </span>
                            <span v-if="section.assign" class="mb-1" style="display:block;position:relative;width:100px;height:15px;background-color:#eee;">
                                <span :style="'position:absolute;background-color:'+getBarColor(\'assign_score\', getRatio(section.assign.achieved_score, section.assign.max_score))+';display:block;height:100%;width:'+ getRatio(section.assign.achieved_score, section.assign.max_score, 100) +'%;'">
                                </span>
                                <span class="p-1" style="z-index:10;position:absolute;color:#333;font-size:0.7rem;vertical-align:middle;display:block;height:100%;">
                                    {{ Math.round(getRatio(section.assign.achieved_score, section.assign.max_score), 0) }}% korrekt
                                </span>
                            </span>
                        </div>
                        <div class="col-2 mb-1" style="border: solid #111 0pt;">
                           <!-- Reflection task -->
                           <div 
                                class="btn btn-default" 
                                style="display:block; width:130px; height:30px; background-color:#ddd; color:#222;"
                                data-toggle="modal" 
                                data-target="#refelctionModal" 
                                @click="setCurrentReflectionSection(section.id)">
                                Reflexion
                            </div>
                        </div>
                    </div>
                    <div class="row col-10 mb-3" style="">
                        <span class="col-2">Lernfortschritt insgesamt</span>
                        <span class="col-2">xxx Minuten gelesen</span>
                        <span class="col-2">{{ getRatio(sumScores.quiz.complete, sumScores.quiz.count) }}% erledigt<br></span>
                        <span class="col-2">{{ getRatio(sumScores.assign.complete, sumScores.assign.count) }}% erledigt<br></span>
                        <span class="col-2">xxx/xxx</span>  
                    </div>
                    <div class="right col-8 small mt-3 mr-3">
                        Beachten Sie auch die anderen Lernmaterialien wie die <a href="#">Virtuellen Treffen</a>, <a href="#">Praktischen Übungen</a> und <a href="#">Prüfungsvorbereitungen</a>
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
                                    This assignment is designed to help you pause for a moment and think about your learning progress in the Devices and Processes unit. It is important that you answer these questions truthfully so that you can properly direct your learning.<br>
                                    <ul>
                                    <li>After completing various self-assessment tasks and receiving feedback, are you satisfied with the results? Did you develop knowledge of the topic consistent with your learning goals?</li>
                                    <li>Is it necessary to re-study Devices and Processes unit? Is there a need to change the current way of learning and planning, to better cope with the next learning chapter (allocate more time for learning, employ different approach, study material with more attention...)?</li>
                                    <li>Can you name any problem that has hindered your results and knowledge (lack of time, poor planning, prior knowledge, inability to understand a particular concept...)? Did you discover any faults in what you had previously believed to be right? Can you overcome it for the next unit?</li>
                                    </ul>
                                    Write a short note of no more than 300 words (approximately 100 per question) to this questions and submit it in the box provided below.
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