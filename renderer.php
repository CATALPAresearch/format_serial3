<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Renderer for outputting the topics course format.
 *
 * @package format_topics
 * @copyright 2012 Dan Poltawski
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since Moodle 2.3
 */


defined('MOODLE_INTERNAL') || die();
require_once($CFG->dirroot.'/course/format/renderer.php');

/**
 * Basic renderer for topics format.
 *
 * @copyright 2012 Dan Poltawski
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class format_ladtopics_renderer extends format_section_renderer_base {

    /**
     * Constructor method, calls the parent constructor
     *
     * @param moodle_page $page
     * @param string $target one of rendering target constants
     */
    public function __construct(moodle_page $page, $target) {
        parent::__construct($page, $target);
        
        // Since format_topics_renderer::section_edit_controls() only displays the 'Set current section' control when editing mode is on
        // we need to be sure that the link 'Turn editing mode on' is available for a user who does not have any other managing capability.
        $page->set_other_editing_capability('moodle/course:setcurrentsection');
    }


    /**
     * A Attribute to store if the user is a moderator for the course
     */
    private $_moderator = null;

    /**
     * A Method to test if the user is a moderator for the course
     */

    private function checkModeratorStatus(){
        if(!is_null($this->_moderator)) return $this->_moderator;
        global $CFG, $DB, $COURSE, $USER;
        $uid = (int)$USER->id;
        $cid = (int)$COURSE->id;
        $params[] = $uid;
        $transaction = $DB->start_delegated_transaction(); 
        $sql = 'SELECT '.$CFG->prefix.'role.shortname FROM '.$CFG->prefix.'role INNER JOIN '.$CFG->prefix.'role_assignments ON '.$CFG->prefix.'role_assignments.roleid = '.$CFG->prefix.'role.id WHERE userid = ?';         
        $res = $DB->get_records_sql($sql, $params);
        $transaction->allow_commit(); 
        foreach($res as $key => $value){
            if(!isset($value->shortname)) continue;
            $val = $value->shortname;            
            if($val === 'manager') {
                $this->_moderator = true;
                return true;
            }
        }
        $this->_moderator = false;
        return false;
    }

    /**
     * Generate the starting container html for a list of sections
     * @return string HTML to output.
     */
    protected function start_section_list() {
        global $CFG, $DB, $PAGE, $COURSE;
        require_once($CFG->libdir.'/completionlib.php');
        //$completion=new completion_info($COURSE);
        //$rr = $completion->get_completions(3);
        //print_r($rr);
        //print_r($COURSE);



        $moderationModal = '    
            <div class="modal fade" id="moderationModal" tabindex="-1" role="dialog" aria-labelledby="moderationModalLabel" aria-hidden="false">
                <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="moderationModalTitle">Planungsempfehlungen</h5>                                     
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                        <div class="alert collapse fade" id="moderationAlert" data-dismiss="alert" role="alert">
                            This is a success alert—check it out!
                        </div>              
                        <h5>Vorlagen</h5>           
                        <div class="my-2 mx-2">              
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveExam" value="0">
                                <label class="form-check-label" for="modSaveExam">
                                Prüfung
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveOrientation" value="1">
                                <label class="form-check-label" for="modSaveOrientation">
                                Orientierung
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveInterest" value="2">
                                <label class="form-check-label" for="modSaveInterest">
                                Interesse am Themengebiet
                                </label>
                            </div>  
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveLocal" value="3">
                                <label class="form-check-label" for="modSaveLocal">
                                Eigene Meilensteine
                                </label>
                            </div>                             
                        </div>
                        <button type="button" @click="modSaveSelect" class="btn btn-primary">Speichern</button>    
                        <button type="button" @click="modResetSelect" class="btn btn-danger">Zurücksetzen</button>                   
                        <hr>                        
                        <h5>Meilensteine laden</h5>                        
                        <div class="col mb-4 px-0">
                            <div class="custom-file">
                                <input type="file" class="custom-file-input" @input="modLoadPath" id="modImportedFile" lang="de">
                                <label id="modLoadPathLabel" class="custom-file-label" for="modImportedFile">Bitte wählen Sie eine Datei aus.</label>
                            </div>
                        </div>                        
                        <button type="button" @click="modLoadMilestones" class="btn btn-secondary">Laden</button>                        
                    </div>          
                    <div class="modal-footer">
                        <!-- Footer -->
                    </div>
                </div>
                </div>
            </div>
        ';



        $initialSurvey = '<!-- Initial survey -->
                        <div id="planningsurvey" display="visibility: hidden;">
                            <div v-if="!surveyComplete" hidden class="row survey-btn">
                                <div class="col-sm-2 col-centered">
                                    <div class="wrapper">
                                        <div @click="showModal()" class="survey-starter survey-animate" data-toggle="modal" data-target="#theSurveyModal">
                                            <span>Lernen mit Plan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="theSurveyModal" class="xmodal" tabindex="-1" role="dialog">
                                <div v-if="modalSurveyVisible" class="xmodal-dialog xmodal-lg" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="MilestoneModalLabel">Vorbereitung Ihrer Semesterplanung für diesen Kurs</h5>
                                            <button @click="closeModal()" type="button" class="close" data-dismiss="modal"
                                                aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="form-check row">
                                                <p>Teilen Sie uns bitte hier Ihre Ziele mit, dann können wir Sie in der Semesterplanung besser unterstützen.
                                                </p>
                                                <label for="" class="col-12 col-form-label survey-objective-label">Welches Ziel verfolgen
                                                    Sie in diesem Kurs/Modul?</label>
                                                <span :style="invalidObjective ? \'display:inline-block; border: solid 1px #ff420e;\' : \'\'">
                                                    <div class="form-check">
                                                        <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1"
                                                            value="f1a" v-model="objectives">
                                                        <label class="form-check-label" for="exampleRadios1">
                                                            Die Prüfung erfolgreich absolvieren
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2"
                                                            value="f1b" v-model="objectives">
                                                        <label class="form-check-label" for="exampleRadios2">
                                                            Orientierung im Themengebiet erlangen
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3"
                                                            value="f1c" v-model="objectives">
                                                        <label class="form-check-label" for="exampleRadios3">
                                                            Meinen eigenen Interessen bzgl. bestimmter Themengebiete nachgehen
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updateObjective" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios4"
                                                            value="f1d" v-model="objectives">
                                                        <label class="form-check-label" for="exampleRadios4">
                                                            keine Angaben
                                                        </label>
                                                    </div>
                                                </span>
                                                <div class="col-12 alert-invalid" role="alert" v-if="invalidObjective">Entscheiden Sie sich bitte für einer der Auswahlmöglichkeiten</div>
                                            </div>
                                            <hr>
                                            <div class="form-check row">
                                                <label for="inputMSname" class="col-10 col-form-label survey-objective-label">Wie viele Stunden pro Woche planen Sie für das Lernen in diesem Kurs / Modul ein?</label>
                                                <div class="col-2">
                                                    <input :style="invalidAvailableTime ? \'border: solid 1px #ff420e;\' : \'\'" type="number" @change="updateAvailableTime()" class="form-control" id="inputMSname" placeholder="0" min="0"
                                                        v-model="availableTime">
                                                </div>
                                                <div class="col-12 alert-invalid" role="alert" v-if="invalidAvailableTime">Geben Sie bitte eine Anzahl an Stunden, die größer Null ist.</div>
                                                <div class="col-12 alert-warning" role="warning">{{ isAvailableTimeSufficient() }}</div>
                                            </div>
                                            <hr>
                                            <div class="form-check row">
                                                <label for="" class="col-12 col-form-label survey-objective-label">
                                                    Wie detailliert planen Sie Ihre Lernaktivitäten?<br/>Ich plane meist 
                                                </label>
                                                <span :style="invalidPlaningStyle ? \'display:inline-block; border: solid 1px #ff420e;\' : \'\'">
                                                    <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios1"
                                                            value="planing-style-a" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios1">
                                                            nur für eine Woche.
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios2"
                                                            value="planing-style-b" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios2">
                                                            für die nächsten 4 Wochen.
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios3"
                                                            value="planing-style-c" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios3">
                                                            für das ganze Semester mit Arbeitspaketen für je eine Woche.
                                                        </label>
                                                    </div>
                                                     <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios4"
                                                            value="planing-style-d" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios4">
                                                            für das ganze Semester mit Arbeitspaketen für je 2 Wochen. 
                                                        </label>
                                                    </div>
                                                     <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios5"
                                                            value="planing-style-e" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios5">
                                                            für das ganze Semester mit Arbeitspaketen für je einen Monat.
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input @change="updatePlaningStyle" class="form-check-input" type="radio" name="planingRadios" id="planingRadios6"
                                                            value="planing-style-f" v-model="planingStyle">
                                                        <label class="form-check-label" for="planingRadios6">
                                                            keine Angaben
                                                        </label>
                                                    </div>
                                                </span>
                                                <div class="col-12 alert-invalid" role="alert" v-if="invalidPlaningStyle">Verraten Sie uns bitte wie detailliert Sie Ihre Lernaktivitäten planen.</div>
                                            </div>
                                            <hr v-if="objectives === \'f1a\'">
                                            <div v-if="objectives === \'f1a\'" class="form-check row">
                                                <label for="inputObjectic" class="col-10 col-form-label survey-objective-label">Wann beabsichtigen Sie die Prüfung
                                                    abzulegen?</label>
                                                <div class="col-4">
                                                    <select @change="monthSelected" id="select_month">
                                                        <option v-for="d in monthRange()"
                                                            :selected="d.num-1 === (new Date()).getMonth()"
                                                            :value="d.num">{{ d.name }}</option>
                                                    </select>

                                                    <select @change="yearSelected" id="select_year">
                                                        <option v-for="d in yearRange()" :selected="d === (new Date()).getFullYear()">
                                                            {{ d }}</option>
                                                    </select>
                                                </div>
                                                <div class="col-7"></div>
                                            </div>
                                            <hr v-if="objectives === \'f1c\'">
                                            <div v-if="objectives === \'f1c\'" class="row">
                                                <label class="col-12 col-form-label">Wählen Sie die Themen, Materialien und Aktivitäten aus,
                                                    die Sie besonders interessieren und sortieren Sie diese absteigend nach Ihrem
                                                    Interesse:</label>
                                                <div class="col-12 alert-invalid" role="alert" v-if="invalidResources">Wählen Sie bitte mindestens ein Thema, Material oder eine Aktivität aus.</div>
                                                <div id="resources" class="col-md">
                                                    <ul id="selected_resources">
                                                        <li v-for="s in resources" class="form-check">
                                                            <label class="form-check-label" for="defaultCheck1">
                                                                <i class="fa fa-sort" title="Reihenfolge ändern"></i>
                                                                {{ s.name }}
                                                                <span class="remove-btn">
                                                                    <i class="fa fa-trash" @click="resourceRemove(s.id)"
                                                                        title="entfernen"></i>
                                                                </span>
                                                            </label>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div v-if="objectives === \'f1c\'" class="row">
                                                <div class="col-md">
                                                    <div class="select-wrapper">
                                                        <span id="before-select"><i class="fa fa-plus"></i> </span>
                                                        <select @change="resourceSelected" id="modal_strategy-select">
                                                            <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien
                                                                und Aktivitäten</option>
                                                            <optgroup v-for="section in resourceSections()" :label="section.name">
                                                                <!--<option :value="\'complete-section-\'+section.id">Alles im Abschnitt: {{section.name}}</option>-->
                                                                <option v-for="s in resourcesBySection(section.id)" :value="s.id">{{ s.instance_type }}: {{ s.name }}</option>
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <br />
                                            <div class="row row-smooth">
                                                <div class="col-md">
                                                    <div>
                                                        <button @click="validateSurveyForm()" class="btn btn-primary btn-sm">{{ buttonText()}}</button>
                                                        <button class="right btn btn-link right" data-dismiss="modal"
                                                            aria-label="abbrechen">jetzt nicht</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>';




$milestoneArchiveList = '
<!-- Milestone list -->
<ul>    
    <li v-if="archivedMilestones.length > 0">
        <div class="milestone-element-header">
            <div class="milestone-element-table-head name">Meilenstein</div><div class="milestone-element-table-head due">Termin</div><div class="milestone-element-table-head">Fortschritt</div>
        </div>
    </li>
    <li v-for="m in archivedMilestones" class="milestone-element">
        <div :class="m.status == \'urgent\' ? \'milestone-urgent milestone-element-header\' : \'milestone-element-header\'">
            <a :class="m.status == \'missed\' ? \'milestone-missed milestone-element-name\' : \'milestone-element-name\'" data-toggle="collapse" :href="\'#milestone-entry-archive-\' + m.id" role="button" aria-expanded="false" :aria-controls="\'milestone-entry-\' + m.id">
                <i class="element-collapsed fa fa-angle-right angle"></i> 
                <i class="element-not-collapsed fa fa-angle-down angle"></i> 
                '.($this->checkModeratorStatus()?"<span v-if=\"m.mod\" class=\"fa fa-globe\"></span>":"").'
                {{ m.name }}
            </a>           
            <span
                data-toggle="tooltop" data-placement="top" :title="\'Beginn: \' + getReadableTime(m.start) + \'Ende: \' + getReadableTime(m.start)" 
                :class="m.status == \'missed\' ? \'milestone-missed milestone-element-due\' : \'milestone-element-due\'">
                {{ fromNow(m.end) }}
            </span>
            <a @click="showModal(m.id)" v-if="m.status !== \'reflected\'" class="milestone-element-edit" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal">
                <span data-toggle="tooltip" data-placement="top" title="Sie können diesen Meilenstein bearbeiten" class="fa fa-pencil"></span> bearbeiten
            </a>
            <div class="milestone-element-progress">
                <div class="milestone-element-progress-status" 
                    :style="\'width:\'+ m.progress * 100 + \'%;\'"
                    data-toggle="tooltip" data-placement="top" :title="\'Dieser Meilenstein ist zu \'+ (m.progress*100).toFixed(0) +\'% fertig.\'"
                ></div>
            </div>
            <div class="milestone-element-status">
                <i 
                    :class="m.status==\'ready\' || m.status==\'reflected\' ? \'fa fa-check milestone-ready\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'ready\' || m.status==\'reflected\' ? \'Diesen Meilenstein haben Sie bereits erreicht!.\' : \'Sie haben diesen Meilenstein noch nicht abgeschlossen.\'"
                    ></i>
                <i 
                    :class="m.status==\'reflected\' ? \'fa fa-check milestone-reflected\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'reflected\' ? \'Großartig! Sie haben diesen Meilenstein bereits reflektiert.\' : \'Sie haben diesen Meilenstein noch nicht reflektiert.\'"
                    ></i>
            </div>
            <div v-if="m.progress === 1" class="milestone-element-reflection">
                <button 
                    data-toggle="modal" 
                    data-target="#theReflectionModal" 
                    @click="showReflectionModal(m.id)" 
                    :class="m.status==\'reflected\' ? \'btn btn-sm reflection-done\' : \'btn btn-primary btn-sm\'"
                    >
                        <span v-if="m.status!=\'reflected\'">Jetzt reflektieren!</span>
                        <span v-if="m.status==\'reflected\'">Reflexion ansehen</span>
                </button>
            </div>
        </div>
        <div class="milestone-entry-details collapse" :id="\'milestone-entry-archive-\' + m.id">
            <div>
                <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="m.resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-2">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in m.resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check checkbox" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        :id="s.id"
                                        :disabled = "m.status === \'reflected\'"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <a 
                                        :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span hidden class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>
                                
                            </li>
                        </ul>

                <!-- Strategien -->
                        <label for="" class="strategy-title">Meine Lernstrategien für diesen Meilenstein</label>
                        <div v-if="m.strategies.length > 0" class="strategy-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-1">Meine Lernstrategien</span>
                        </div>
                        <ul class="strategy-list">
                            <li v-for="s in m.strategies" :class="s.checked ? \'strategy-selected-item ms-done\' : \'strategy-selected-item ms-not-done\'">
                                <label class="strategy-selected-label" for="defaultCheck1">
                                    <input class="strategy-selected-check" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie diese Lernstrategie bereits angewendet haben."
                                        v-model="s.checked"
                                        :id="s.id"
                                        :disabled = "m.status === \'reflected\'"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <span class="strategy-selected-name">{{ s.name }}</span>
                                    <button type="button" class="btn btn-sm btn-link"
                                        data-toggle="popover" :data-content="s.desc"><i
                                            class="fa fa-question"></i></button>
                                    <span hidden class="strategy-selected-remove remove-btn" data-toggle="tooltip" title="Lernstrategie entferenen">
                                        <i class="fa fa-trash" @click="strategyRemove(s.id)"></i>
                                    </span>
                                </label>
                            </li>
                        </ul>
            </div>
        </div>
    </li>
</ul>
<!-- End Milestone list -->
';

$milestoneList = '
<!-- Milestone list -->
<ul>
    <li v-if="remainingMilestones.length === 0">
        <span data-toggle="modal" data-target="#theMilestoneModal">
            <button @click="showEmptyMilestone()" class="btn btn-sm right btn-primary ms-btn ms-coldstart-btn"
                data-toggle="tooltip" data-placement="bottom" title="Neuen Meilenstein hinzufügen"><i
                    class="fa fa-plus"></i> Legen Sie einen neuen Meilenstein an!</button>
        </span>
    </li>
    <li v-if="remainingMilestones.length > 0">
        <div class="milestone-element-header">
            <div class="milestone-element-table-head name">Meilenstein</div><div class="milestone-element-table-head due">Termin</div><div class="milestone-element-table-head">Fortschritt</div>
        </div>
    </li>
    <li v-for="m in remainingMilestones" class="milestone-element">
        <div :class="m.status == \'urgent\' ? \'milestone-urgent milestone-element-header\' : \'milestone-element-header\'">
            <a :class="m.status == \'missed\' ? \'milestone-missed milestone-element-name\' : \'milestone-element-name\'" data-toggle="collapse" :href="\'#milestone-entry-\' + m.id" role="button" aria-expanded="false" :aria-controls="\'milestone-entry-\' + m.id">
                <i class="element-collapsed fa fa-angle-right angle"></i> 
                <i class="element-not-collapsed fa fa-angle-down angle"></i> 
                '.($this->checkModeratorStatus()?"<span v-if=\"m.mod\" class=\"fa fa-globe\"></span>":"").'
                {{ m.name }}                
            </a>
            <span
                data-toggle="tooltop" data-placement="top" :title="\'Beginn: \' + getReadableTime(m.start) + \'Ende: \' + getReadableTime(m.start)" 
                :class="m.status == \'missed\' ? \'milestone-missed milestone-element-due\' : \'milestone-element-due\'">
                {{ fromNow(m.end) }}
            </span>
            <a @click="showModal(m.id)" v-if="m.status !== \'reflected\'" class="milestone-element-edit" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal">
                <span data-toggle="tooltip" data-placement="top" title="Sie können diesen Meilenstein bearbeiten" class="fa fa-pencil"></span> bearbeiten
            </a>
            <div class="milestone-element-progress">
                <div class="milestone-element-progress-status" 
                    :style="\'width:\'+ m.progress * 100 + \'%;\'"
                    data-toggle="tooltip" data-placement="top" :title="\'Dieser Meilenstein ist zu \'+ (m.progress*100).toFixed(0) +\'% fertig.\'"
                ></div>
            </div>
            <div class="milestone-element-status">
                <i 
                    :class="m.status==\'ready\' || m.status==\'reflected\' ? \'fa fa-check milestone-ready\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'ready\' || m.status==\'reflected\' ? \'Diesen Meilenstein haben Sie bereits erreicht!.\' : \'Sie haben diesen Meilenstein noch nicht abgeschlossen.\'"
                    ></i>
                <i 
                    :class="m.status==\'reflected\' ? \'fa fa-check milestone-reflected\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'reflected\' ? \'Großartig! Sie haben diesen Meilenstein bereits reflektiert.\' : \'Sie haben diesen Meilenstein noch nicht reflektiert.\'"
                    ></i>
            </div>
            <div v-if="m.progress === 1" class="milestone-element-reflection">
                <button 
                    data-toggle="modal" 
                    data-target="#theReflectionModal" 
                    @click="showReflectionModal(m.id)" 
                    :class="m.status==\'reflected\' ? \'btn btn-sm reflection-done\' : \'btn btn-primary btn-sm\'"
                    >
                        <span v-if="m.status!=\'reflected\'">Jetzt reflektieren!</span>
                        <span v-if="m.status==\'reflected\'">Reflexion ansehen</span>
                </button>
            </div>
        </div>
        <div class="milestone-entry-details collapse" :id="\'milestone-entry-\' + m.id">
            <div>
                <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="m.resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-2">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in m.resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check checkbox" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        :id="s.id"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <a 
                                        :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span hidden class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>
                                
                            </li>
                        </ul>

                <!-- Strategien -->
                        <label for="" class="strategy-title">Meine Lernstrategien für diesen Meilenstein</label>
                        <div v-if="m.strategies.length > 0" class="strategy-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-1">Meine Lernstrategien</span>
                        </div>
                        <ul class="strategy-list">
                            <li v-for="s in m.strategies" :class="s.checked ? \'strategy-selected-item ms-done\' : \'strategy-selected-item ms-not-done\'">
                                <label class="strategy-selected-label" for="defaultCheck1">
                                    <input class="strategy-selected-check" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie diese Lernstrategie bereits angewendet haben."
                                        v-model="s.checked"
                                        :id="s.id"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <span class="strategy-selected-name">{{ s.name }}</span>
                                    <button type="button" class="btn btn-sm btn-link"
                                        data-toggle="popover" :data-content="s.desc"><i
                                            class="fa fa-question"></i></button>
                                    <span hidden class="strategy-selected-remove remove-btn" data-toggle="tooltip" title="Lernstrategie entferenen">
                                        <i class="fa fa-trash" @click="strategyRemove(s.id)"></i>
                                    </span>
                                </label>
                            </li>
                        </ul>
            </div>
        </div>
    </li>
</ul>
<!-- End Milestone list -->
';


$milestoneTimeline = '
<!-- Timeline charts -->
<div class="relative milestone-chart-container">
    <div class="chart-label-milestone" :style="\'height:\'+(height+margins.top)+\'px;\'"></div>
    <svg style="border: none;" :width="width" :height="height+margins.top">
        <g :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <rect v-for="m in milestones" @click="showModal(m.id)" class="milestone-learning-progress"
                :x="xx(m.start)" :y="m.yLane" * (barheight + bardist)" :height="barheight"
                :width="duration(m.start, m.end) * m.progress" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <rect v-for="m in milestones" @click="showModal(m.id)"
                :class="\'milestone-bar milestone-\'+ m.status" :id="\'milestoneBar_\'+m.id"
                :x="xx(m.start)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight"
                :width="duration(m.start, m.end)" :data-legend="m.id" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <text v-for="m in milestones" @click="showModal(m.id)" class="milestone-label"
                :x="xx(m.start) + duration(m.start, m.end) / 2" :y="getYLane(m.id) * (barheight + bardist) + (barheight)/2 + 2"
                data-toggle="modal"
                data-target="#theMilestoneModal">{{ limitTextLength( m.name, 14 ) }}</text>
        </g>
        <g class="grid-line horizontal"
            :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <line v-for="m in [0,1,2]" x1="1" :y1="m * (barheight + bardist) + barheight/2" :x2="width"
                :y2="m * (barheight + bardist) + barheight/2" opacity="0.5"></line>
        </g>
        <g class="today"
            :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <line class="today-line" :x1="xx(new Date())" y1="0" :x2="xx(new Date())" :y2="height"></line>
            <text class="today-label" y="10" :x="xx(new Date()) + 4">heute</text>                                               
        </g>
        <!--<g id="title-label">
        <text :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top+100 +\')\'"
                style="fill:#000000;" 
                transform="matrix(0,-1,1,0,0,0)" id="text3338" y="0" x="0">
            Meilenstein</text>    
        <rect
            y="0"
            x="0"
            :height="height + margins.top + margins.bottom"
            width="20"
            id="rect3336"
            style="opacity:1;fill:#004C97;fill-opacity:1;stroke:none;" />
            
        </g>-->
    </svg>
</div>
<!-- End Timeline charts -->';


$modalReflection = '
<!-- Reflection modal form -->
<div id="theReflectionModal" class="modal" tabindex="-1" role="dialog">
    <div v-if="modalReflectionVisible" class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="MilestoneModalLabel">Reflektion Meilensteins
                    "{{ getSelectedMilestone().name }}"</h5>
                <button @click="closeReflectionModal()" type="button" class="close" data-dismiss="modal"
                    aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body row">
                <div class="ms-reflection col-12">
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref0">
                            Frage 1: Wie gut hat mir die Planung dieses Meilensteins bei der Erarbeitung meines Lernziels geholfen?
                        </label>
                        <div class="col-sm-12">
                            <div class="row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1a" value="1" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1a">1 (sehr gut)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1b" value="2" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1c" value="3" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1d" value="4" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1e" value="5" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref2">
                            Frage 2: Wie gut passten die ausgewählten Lernstrategien zu den Arbeitsmaterialien, um mein Lernziel zu erreichen?
                        </label>
                        <div class="col-sm-12">
                            <div class="row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2a" value="1" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1a">1 (sehr gut)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2b" value="2" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2c" value="3" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2d" value="4" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2e" value="5" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref2">
                            Frage 3: Wie gut konnte ich meinen Zeitplan einhalten?
                        </label>
                        <div class="col-sm-12">
                            <div class="row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3a" value="1" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1a">1 (sehr gut)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3b" value="2" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3c" value="3" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3d" value="4" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3e" value="5" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref4">
                            Frage 4: Wie möchte ich meine Arbeitsweise verbessern? Das sind meine Lernhinweise für die Zukunft:
                        </label>
                        <div class="col-sm-12">
                            <textarea v-model="getSelectedMilestone().reflections[3]"
                                cass="form-control" id="ref4" rows="2"></textarea>
                        </div>
                    </div>
                </div>
                <div v-if="invalidReflections.length === 1" class="col-12 alert-invalid">Bitte beantworten Sie auch die Frage {{ invalidReflections[0] }}.</div>
                <div v-if="invalidReflections.length === 2" class="col-12 alert-invalid">Bitte beantworten Sie auch die Fragen {{ invalidReflections[0] }} und {{ invalidReflections[1] }}.</div>
                <div v-if="invalidReflections.length > 2" class="col-12 alert-invalid">Bitte beantworten Sie auch die Fragen {{ invalidReflections.join(", ") }}.</div>
                
                <div class="form-group col-12">
                    <button 
                        @click="validateReflectionForm()" 
                        class="btn btn-primary btn-sm"
                        >
                            Reflexion abschließen
                        </button>
                </div>
            </div>
        </div>
    </div>
</div>
';


$modalMilestone = '
<!-- Modal milestone -->
<div id="theMilestoneModal" class="modal" tabindex="-1" role="dialog">
    <div v-if="modalVisible" class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-header-completion"
                    :style="\'width:\'+ (getSelectedMilestone().progress * 100) +\'%;\'">
                    <div class="modal-header-completion-label">
                        {{ (getSelectedMilestone().progress * 100) }}%</div>
                </div>
                <h5 class="modal-title" id="MilestoneModalLabel">Meilenstein:
                    {{ getSelectedMilestone().name }}</h5>
                <span v-if="getSelectedMilestone().name !== \'\'">
                    <i @click="removeMilestone()" class="fa fa-trash ms-remove"
                        title="Meilenstein entfernen"></i>
                </span>
                <button id="close-modal" @click="closeModal()" type="button" class="close" data-dismiss="modal"
                    aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        Mit einem Meilenstein planen Sie eines Ihrer Lern- oder Arbeitsziele, welches zu
                        einem selbst gewählten Termin erreicht werden soll.
                    </div>
                </div>
                <hr />
                <div class="form-group row">
                    <label for="inputMSname" class="col-sm-2 col-form-label">Titel *</label>
                    <div class="col-sm-10">
                        <input @change="updateName" :style="invalidName ? \'border: solid 1px #ff420e;\' : \'\'" v-model="getSelectedMilestone().name" type="text" class="form-control"
                            id="inputMSname" placeholder="Name des Meilensteins">
                    </div>
                    <div class="col-sm-10 alert-invalid" v-if="invalidName">Geben Sie bitte einen Namen für den Meilenstein an.</div>
                </div>
                <div class="form-group row">
                    <label for="inputLearningObjective" class="col-sm-2 col-form-label">Lernziel *</label>
                    <div class="col-sm-10">
                        <input @change="updateObjective" :style="invalidObjective ? \'border: solid 1px #ff420e;\' : \'\'" v-model="getSelectedMilestone().objective" type="text"
                            class="form-control" id="inputLearningObjective"
                            placeholder="Welches Lernziel verfolgen Sie?">
                    </div>
                    <div class="col-sm-10 alert-invalid" v-if="invalidObjective">Geben Sie bitte ein Lernziel an.</div>
                </div>
                <div class="form-group row">
                    <label for="" class="col-2 col-form-label">Beginn *</label>
                    <div class="col-4">
                        <datepicker id="startDP" :value="startDate" format="dd MMMM yyyy" :language="DPde" :disabled-dates="dpRange" @input="validateStartDate"></datepicker>                       
                    </div>
                    <div v-if="invalidStartDate" class="col-sm-10 alert-invalid">Wählen Sie bitte ein passendes Datum aus.</div>
                </div>
                <div class="form-group row">
                    <label for="" class="col-2 col-form-label">Termin *</label>
                    <div class="col-4">
                        <datepicker id="endDP" :value="endDate" format="dd MMMM yyyy" :language="DPde" :disabled-dates="dpRange" @input="validateEndDate"></datepicker>                       
                    </div>                   
                    {{ endDate }}
                    <div v-if="invalidEndDate" class="col-sm-10 alert-invalid">Wählen Sie bitte ein passendes Datum aus. Der Termin muss nach dem Beginn liegen! </div>
                </div>
                <hr />
                <div class="row">
                    <div id="resources" class="col-md-6">
                        <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="getSelectedMilestone().resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-1">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in getSelectedMilestone().resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        v-bind:id="s.id"
                                        >
                                    <a 
                                        :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>
                            </li>
                        </ul>
                    </div>
                    <div id="strategies" class="col-md-6">
                        <!-- Strategien -->
                        <label for="" class="strategy-title">Meine Lernstrategien für diesen Meilenstein</label>
                        <div v-if="getSelectedMilestone().strategies.length > 0" class="strategy-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-1">Meine Lernstrategien</span>
                        </div>
                        <ul class="strategy-list">
                            <li v-for="s in getSelectedMilestone().strategies" :class="s.checked ? \'strategy-selected-item ms-done\' : \'strategy-selected-item ms-not-done\'">
                                <label class="strategy-selected-label" for="defaultCheck1">
                                    <input class="strategy-selected-check" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie diese Lernstrategie bereits angewendet haben."
                                        id="strategyCheck" v-model="s.checked" v-bind:id="s.id">
                                    <span class="strategy-selected-name">{{ s.name }}</span>
                                    <button type="button" class="btn btn-sm btn-link"
                                        data-toggle="popover" :data-content="s.desc"><i
                                            class="fa fa-question"></i></button>
                                    <span class="strategy-selected-remove remove-btn" data-toggle="tooltip" title="Lernstrategie entferenen">
                                        <i class="fa fa-trash" @click="strategyRemove(s.id)"></i>
                                    </span>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="select-wrapper" :style="invalidResources ? \'border: solid 1px #ff420e;\' : \'none\'">
                            <span id="before-select"><i class="fa fa-plus"></i> </span>
                            <select @change="resourceSelected" id="modal_strategy-select">
                                <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien und Aktivitäten</option>
                                <optgroup v-for="section in resourceSections()" :label="section.name">
                                    <option v-for="s in resourcesBySection(section.id)" :value="s.id">{{ s.instance_type }}: {{ s.name }}</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="col-sm-10 alert-invalid" v-if="invalidResources">Wählen Sie bitte Themen, Materialien und Aktivitäten aus.</div>
                    </div>
                    <div id="modal-strategies" class="col-md-6">
                        <span id="strategy-introduction" class="strategy-introduction">Welche Lernstrategien möchten Sie anwenden?</span>
                        <div :style="invalidStrategy ? \'border: solid 1px #ff420e;\' : \'none\'">
                            <div v-for="cat in strategyCategories" class="strategy-category">
                                <div class="strategy-category-title">{{cat.name}}</div>
                                <div 
                                    class="strategy-category-item" 
                                    v-for="s in strategiesByCategory(cat.id)" 
                                    :value="s.id"
                                    v-if="!isSelectedStrategy(s.id)"
                                    >
                                    <button @click="strategySelected(s.id)" type="button" class="btn btn-sm" title="Für den Meilenstein auswählen">
                                        <i class="fa fa-arrow-up"></i>
                                    </button>
                                    {{ s.name }}
                                    <button type="button" class="btn btn-sm btn-link"
                                        data-toggle="popover" :data-content="s.desc"><i
                                            class="fa fa-question"></i></button>
                                </div>
                            </div>
                            
                            <select hidden @change="strategySelected" id="modal_strategy-select">
                                <option :selected="true" disabled>Lernstrategie</option>
                                <optgroup label="Organisationsstrategien">
                                    <option v-for="s in strategiesByCategory(\'organization\')"
                                        :value="s.id">{{ s.name }}</option>
                                </optgroup>
                                <optgroup label="Elaborationsstrategien">
                                    <option v-for="s in strategiesByCategory(\'elaboration\')"
                                        :value="s.id">{{ s.name }}</option>
                                </optgroup>

                                <optgroup label="Wiederholungsstrategien">
                                    <option v-for="s in strategiesByCategory(\'repeatition\')"
                                        :value="s.id">{{ s.name }}</option>
                                </optgroup>
                                <!--<optgroup label="Sonstige">
                                    <option v-for="s in strategiesByCategory(\'misc\')" :value="s.id">{{ s.name }}</option>
                                    </optgroup>-->
                            </select>
                        </div>
                        <div class="col-sm-10 alert-invalid" v-if="invalidStrategy">Wählen Sie bitte mindestens eine Lernstrategie aus.</div>
                    </div>
                </div>
                <hr />
                <div hidden class="row">
                    <div class="col-md">
                        <button @click="toggleReflectionsForm()"
                            :class="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? \'btn btn-primary\' : \'btn disabled\'"
                            :disabled="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? false : true">
                            Reflexion beginnen
                        </button>
                    </div>
                </div>
                <!-- Save new milestone-->
                <div class="row row-smooth">
                    <div class="col-md">
                        <div>
                            <button @click="validateMilestoneForm()" class="btn btn-primary btn-sm">
                                Speichern
                            </button>
                            <!--<button class="right btn btn-link" data-dismiss="modal" aria-label="abbrechen">abbrechen</a>-->
                            <!--<button class="right btn btn-link red" data-dismiss="modal" ria-label="entfernen">entfernen</a>-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- End Modal milestone -->
';









        $content = '

            </div>
            </div>
                    </div>
                </div>
            </div>
        
        </section>
    </div>
</div>



<div id="page-content" class="row">
    <div class="region-main-box col-12 ladtopics-region-main">
        <section id="region-main" class="ladtopics-region">
            <div class="card">
                <div class="card-body ladtopics">
                    <div id="ladtopic-container-0" class="course-content">
                        <span hidden id="courseid">'. $COURSE->id .'</span>
                        
                        '. $initialSurvey .'

                        <!-- Planing Component -->
                        <div id="planing-component" style="display:none;" v-cloak class="container dc-chart">
                            '.($this->checkModeratorStatus()?$moderationModal:'').'
                            <div>
                                <div v-if="surveyDone > 0" class="row">
                                    <div class="col-12">
                                        <!-- Milestone chart -->
                                        <div class="chart ms-chart">
                                            <div class="ms-chart-header row">
                                                <h3 class="ms-headline">Meine Semesterplanung</h3>
                                                <div class="ms-title col-sm-12 col-xs-12 col-md-12 col-lg-12">
                                                    <ul class="nav nav-pills ladtopics-pills" id="viewPillsTab" role="tablist">
                                                        <li>                                                             
                                                            <span v-if="milestones.length > 0" data-toggle="modal" data-target="#theMilestoneModal">
                                                                <button @click="showEmptyMilestone()" id="add-milestone" class="btn btn-sm right btn-primary ms-btn ms-add"
                                                                    data-toggle="tooltip" data-placement="bottom" title="Neuen Meilenstein hinzufügen"><i
                                                                        class="fa fa-plus"></i> Neuer Meilenstein</button>
                                                            </span>
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link active" @click="hideAdditionalCharts()" id="milestone-list-tab" data-toggle="pill" href="#view-list" role="tab" aria-controls="view-list" aria-selected="false">
                                                                <i hidden class="fa fa-list"></i> Aktuelle Meilensteine
                                                            </a>
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link" @click="showAdditionalCharts()" id="milestone-timeline-tab" data-toggle="pill" href="#view-timeline" role="tab" aria-controls="view-timeline" aria-selected="true">
                                                                <i class="fa fa-clock"></i>Zeitleiste
                                                            </a>
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link" @click="hideAdditionalCharts()" id="milestone-archive-list-tab" data-toggle="pill" href="#view-archive-list" role="tab" aria-controls="view-archive-list" aria-selected="false">
                                                                <i hidden class="fa fa-list"></i> Archiv
                                                            </a>
                                                        </li>                                                                                                        
                                                    </ul>                                           
                                                    
                                    
                                                    <div class="dropdown settingsMenu" style="float: right;">
                                                        <button v-if="surveyDone > 0" class="btn btn-link" @click="startIntroJs()" style="padding: 0px 0px 5.5px 5px; margin: 0px -5px 0px 0px;">
                                                            <i class="fa fa-question-circle"></i>
                                                        </button>
                                                        <button class="btn btn-link dropdown-toggle" type="button" id="settingsMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expand="false">
                                                        <i class="fa fa-cog"></i>
                                                        </button>
                                                        <div class="dropdown-menu" aria-labeledby="settingsMenuButton">
                                                        '.($this->checkModeratorStatus()?'
                                                            <a class="dropdown-item" data-toggle="modal" data-target="#moderationModal" href="#">
                                                                <i class="fa fa-clock"></i>Vorlagen
                                                            </a>':'').'                                                            
                                                            <a class="dropdown-item" @click="exportToICal()" href="#">
                                                                <i class="fa fa-clock"></i>Exportieren
                                                            </a>                                                            
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                                <div id="filter-presets" class="col-sm-12 col-md-12 col-lg-12 time-filters">
                                                    <button @click="setFilterPreset(\'next-month\')" :style="filterPreset === \'next-month\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">nächster Monat</button>
                                                    <button @click="setFilterPreset(\'next-week\')" :style="filterPreset === \'next-week\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">nächste Woche</button>
                                                    <button @click="setFilterPreset(\'today\')" :style="filterPreset === \'today\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">heute</button>
                                                    <button @click="setFilterPreset(\'last-week\')" :style="filterPreset === \'last-week\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm btn-link ms-btn right">letzte
                                                        Woche</button>
                                                    <button @click="setFilterPreset(\'last-month\')" :style="filterPreset === \'last-month\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm btn-link ms-btn right">letzten 4
                                                        Wochen</button>
                                                    <button @click="setFilterPreset(\'semester\')" :style="filterPreset === \'semester\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-link btn-sm right">WS 19/20</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Pill content -->
                                    <div class="tab-content" id="pills-tabContent">
                                        <div class="tab-pane col-12 fade" id="view-timeline" role="tabpanel" aria-labelledby="view-timeline">
                                            ' . $milestoneTimeline . '
                                        </div>
                                        <div class="tab-pane col-12 fade show active milestone-list" id="view-list" role="tabpanel" aria-labelledby="view-list">
                                            ' . $milestoneList . '
                                        </div>
                                        <div class="tab-pane col-12 fade milestone-list" id="view-archive-list" role="tabpanel" aria-labelledby="view-archive-list">
                                            ' . $milestoneArchiveList . '
                                        </div>
                                    </div>
                                    <!-- End pill content -->
                                

                                    ' . $modalMilestone . '
                                    ' . $modalReflection . '
                                </div>
                                <!-- end row -->

                                <div id="additionalCharts" class="row">
                                    <div class="activity-chart-container">
                                        <div class="relative">
                                            <div class="chart-label-activities"></div>
                                            <div id="timeline-chart"></div>
                                        </div>
                                    </div>
                                    <div class="filter-chart-container">
                                        <div class="relative">
                                            <div class="chart-label-filter"></div>
                                        </div>
                                        <div id="filter-chart"></div>
                                    </div>
                                </div>
                                
                                <textarea style="display:none;">{{ milestones }}</textarea>
                            </div>    
                        </div>
                        <!-- End .planing-component -->

                        <div class="container row" style="display:none;">
                            <div class="col-md-12">
                                <ul class="nav">
                                    <li class="nav-item active"><a class="nav-link active" data-toggle="tab" href="#timemanagement"
                                            role="tab">Zeitmanagement</a></li>
                                    <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#strategy" role="tab">Strategie</a>
                                    </li>
                                    <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#quiz" role="tab">Quiz</a></li>
                                    <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#learningstatus"
                                            role="tab">Lernstand</a></li>
                                </ul>
                                <br>
                                <div class="tab-content" style="display:block;">
                                    <div class="tab-pane fade active" id="timemanagement" role="tabpanel">Zeitmanagement</div>
                                    <div class="tab-pane fade" id="strategy" role="tabpanel">Strategie</div>
                                    <div class="tab-pane fade" id="quiz" role="tabpanel">Quiz</div>
                                    <div class="tab-pane fade" id="learningstatus" role="tabpanel">Status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- End .ladtopic-container-0 -->
                </div>
                <!-- End .card-body -->
            </div>
            <!-- End .card -->
        </section>
    </div>
</div>

<div id="page-content" class="row">
    <div class="region-main-box col-12">
        <section id="region-main" class="has-blocks mb3">
            <div class="card">
                <div class="card-body">
                <div>
		        <div>

                    <div class="course-content">
';
        return 
            html_writer::start_tag('div', array('class' => 'container chart-container')) 
            . $content . html_writer::end_tag('div') 
            . html_writer::start_tag('ul', array('class' => 'topics'))
            ;
    }

    /**
     * Generate the closing container html for a list of sections
     * @return string HTML to output.
     */
    protected function end_section_list() {
        return html_writer::end_tag('ul');
    }

    /**
     * Generate the title for this section page
     * @return string the page title
     */
    protected function page_title() {
        return get_string('topicoutline');
    }

    /**
     * Generate the section title, wraps it in a link to the section page if page is to be displayed on a separate page
     *
     * @param stdClass $section The course_section entry from DB
     * @param stdClass $course The course entry from DB
     * @return string HTML to output.
     */
    public function section_title($section, $course) {
        return $this->render(course_get_format($course)->inplace_editable_render_section_name($section));
    }

    /**
     * Generate the section title to be displayed on the section page, without a link
     *
     * @param stdClass $section The course_section entry from DB
     * @param stdClass $course The course entry from DB
     * @return string HTML to output.
     */
    public function section_title_without_link($section, $course) {
        return $this->render(course_get_format($course)->inplace_editable_render_section_name($section, false));
    }

    /**
     * Generate the edit control items of a section
     *
     * @param stdClass $course The course entry from DB
     * @param stdClass $section The course_section entry from DB
     * @param bool $onsectionpage true if being printed on a section page
     * @return array of edit control items
     */
    protected function section_edit_control_items($course, $section, $onsectionpage = false) {
        global $PAGE;

        if (!$PAGE->user_is_editing()) {
            return array();
        }

        $coursecontext = context_course::instance($course->id);

        if ($onsectionpage) {
            $url = course_get_url($course, $section->section);
        } else {
            $url = course_get_url($course);
        }
        $url->param('sesskey', sesskey());

        $controls = array();
        if ($section->section && has_capability('moodle/course:setcurrentsection', $coursecontext)) {
            if ($course->marker == $section->section) {  // Show the "light globe" on/off.
                $url->param('marker', 0);
                $markedthistopic = get_string('markedthistopic');
                $highlightoff = get_string('highlightoff');
                $controls['highlight'] = array('url' => $url, "icon" => 'i/marked',
                                               'name' => $highlightoff,
                                               'pixattr' => array('class' => '', 'alt' => $markedthistopic),
                                               'attr' => array('class' => 'editing_highlight', 'title' => $markedthistopic,
                                                   'data-action' => 'removemarker'));
            } else {
                $url->param('marker', $section->section);
                $markthistopic = get_string('markthistopic');
                $highlight = get_string('highlight');
                $controls['highlight'] = array('url' => $url, "icon" => 'i/marker',
                                               'name' => $highlight,
                                               'pixattr' => array('class' => '', 'alt' => $markthistopic),
                                               'attr' => array('class' => 'editing_highlight', 'title' => $markthistopic,
                                                   'data-action' => 'setmarker'));
            }
        }

        $parentcontrols = parent::section_edit_control_items($course, $section, $onsectionpage);

        // If the edit key exists, we are going to insert our controls after it.
        if (array_key_exists("edit", $parentcontrols)) {
            $merged = array();
            // We can't use splice because we are using associative arrays.
            // Step through the array and merge the arrays.
            foreach ($parentcontrols as $key => $action) {
                $merged[$key] = $action;
                if ($key == "edit") {
                    // If we have come to the edit key, merge these controls here.
                    $merged = array_merge($merged, $controls);
                }
            }

            return $merged;
        } else {
            return array_merge($controls, $parentcontrols);
        }
    }
}
