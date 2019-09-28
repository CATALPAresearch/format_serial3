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


        $initialSurvey = '<!-- Initial survey -->
                        <div id="planningsurvey">
                            <div v-if="!surveyComplete" class="row survey-btn">
                                <div class="col-sm-2 col-centered">
                                    <div @click="showModal()" class="survey-starter" data-toggle="modal" data-target="#theSurveyModal">
                                        <i class="fa fa-question"></i><br />
                                        <span>Lernen mit Plan</span>
                                    </div>
                                </div>
                            </div>
                            <div id="theSurveyModal" class="modal" tabindex="-1" role="dialog">
                                <div v-if="modalSurveyVisible" class="modal-dialog modal-lg" role="document">
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
                                            <div class="form-group row">
                                                <label for="inputMSname" class="col-10 col-form-label">Wie viele Stunden pro Woche planen Sie für das Lernen in diesem Kurs / Modul ein?</label>
                                                <div class="col-2">
                                                    <input :style="invalidAvailableTime ? \'border: solid 1px #ff420e;\' : \'\'" type="number" @change="updateAvailableTime()" class="form-control" id="inputMSname" placeholder="0" min="0"
                                                        v-model="availableTime">
                                                </div>
                                                <div class="col-12 alert-invalid" role="alert" v-if="invalidAvailableTime">Geben Sie bitte eine Anzahl an Stunden, die größer Null ist.</div>
                                            </div>
                                            <hr v-if="objectives === \'f1a\'">
                                            <div v-if="objectives === \'f1a\'" class="form-group row">
                                                <label for="inputObjectic" class="col-10 col-form-label">Wann beabsichtigen Sie die Prüfung
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
                                                        <select @change="resourceSelected" class="" id="modal_strategy-select" class="">
                                                            <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien
                                                                und Aktivitäten</option>
                                                            <optgroup v-for="section in resourceSections()" :label="section.name">
                                                                <option :value="\'complete-section-\'+section.id">Alles im Abschnitt: {{section.name}}</option>
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
                                                        <button @click="validateSurveyForm()" class="btn btn-primary btn-sm">Planung anzeigen</button>
                                                        <button class="right btn btn-link right" data-dismiss="modal"
                                                            aria-label="abbrechen">abbrechen</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>';






$milestoneList = '
<!-- Milestone list -->
<ul>
    <li>
        <div class="milestone-element-header">
            <div class="milestone-element-table-head name">Meilenstein</div>
            <div class="milestone-element-table-head due">Termin</div>
            <div class="milestone-element-table-head">Fortschritt</div>    
        </div>
    </li>
    <li v-for="m in milestones" class="milestone-element">
        <div :class="m.status == \'urgent\' ? \'milestone-urgent milestone-element-header\' : \'milestone-element-header\'">
            <a :class="m.status == \'missed\' ? \'milestone-missed milestone-element-name\' : \'milestone-element-name\'" data-toggle="collapse" :href="\'#milestone-entry-\' + m.id" role="button" aria-expanded="false" :aria-controls="\'milestone-entry-\' + m.id">
                <i class="element-collapsed fa fa-angle-right"></i> 
                <i class="element-not-collapsed fa fa-angle-down"></i> 
                {{ m.name }}
            </a>
            <span :class="m.status == \'missed\' ? \'milestone-missed milestone-element-due\' : \'milestone-element-due\'">{{ fromNow(m.end) }}</span>
            <a @click="showModal(m.id)" class="milestone-element-edit" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal">
                <span data-toggle="tooltip" data-placement="top" title="Meilenstein bearbeiten" class="fa fa-pencil"></span>
            </a>
            <div class="milestone-element-progress">
                <div class="milestone-element-progress-status" 
                    :style="\'width:\'+ m.progress * 100 + \'%;\'"
                    data-toggle="tooltip" data-placement="top" :title="\'Dieser Meilenstein ist zu \'+ m.progress*100 +\'% fertig.\'"
                ></div>
            </div>
            <div class="milestone-element-status">
                <i 
                    :class="m.status==\'ready\' || m.status==\'reflected\' ? \'fa fa-check milestone-ready\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'ready\' || m.status==\'reflected\' ? \'Dieser Meilenstein ist noch nicht abgeschlossen.\' : \'Sie haben diesen Meilenstein noch nicht abgeschlossen.\'"
                    ></i>
                <i 
                    :class="m.status==\'reflected\' ? \'fa fa-check milestone-reflected\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'reflected\' ? \'Großartig! Sie haben diesen Meilenstein bereits reflektiert.\' : \'Sie haben diesen Meilenstein noch nicht reflektiert.\'"
                    ></i>
            </div>
        </div>
        <div class="milestone-entry-details collapse" :id="\'milestone-entry-\' + m.id">
            <div class="">
                Aktivitäten und Materialien
                <ul>
                    <li v-for="s in m.resources" class="form-check">
                        <span :class="s.checked ? \'ms-wrapper-resource ms-done\' : \'ms-wrapper-resource ms-not-done\'">
                            <label class="form-check-label" for="defaultCheck1">
                                <input 
                                    class="s.checked ? \'form-check-input ms-done\' : \'form-check-input ms-not-done\'" 
                                    type="checkbox" v-model="s.checked"
                                    data-toggle="tooltip"
                                    title="Setzen Sie das Häkchen, wenn Sie diese Resource bereits bearbeitet haben."
                                    v-bind:id="s.id">
                                <a :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id">{{ s.name }} {{ done[s.id] }}</a>
                            </label>
                        </span>
                    </li>
                </ul>
                Lernstrategien
                <ul>
                    <li v-for="s in m.strategies" class="form-check">
                        <label :class="s.checked ? \'form-check-label ms-done ms-wrapper-resource\' : \'form-check-label ms-wrapper-resource ms-not-done\'" for="defaultCheck1">
                            <input :class="s.checked ? \'form-check-input ms-done\' : \'form-check-input ms-not-done\'" 
                                type="checkbox" value=""
                                data-toggle="tooltip"
                                title="Setzen Sie das Häkchen, wenn Sie diese Lernstrategie bereits angewendet haben."
                                id="strategyCheck" v-model="s.checked" v-bind:id="s.id">
                            <span class="list-label">{{ s.name }}</span>
                            <button type="button" class="btn btn-sm btn-link"
                                data-toggle="popover" :title="s.desc"><i
                                    class="fa fa-info"></i></button>
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
    <div class="chart-label-milestone"></div>
    <svg style="border: none;" :width="width" :height="height+margins.top">
        <g :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <rect v-for="m in milestones" @click="showModal(m.id)" class="milestone-learning-progress"
                :x="xx(m.end)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight"
                :width="barwidth * m.progress" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <rect v-for="m in milestones" @click="showModal(m.id)"
                :class="\'milestone-bar milestone-\'+ m.status" :id="\'milestoneBar_\'+m.id"
                :x="xx(m.end)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight"
                :width="barwidth" :data-legend="m.id" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <text v-for="m in milestones" @click="showModal(m.id)" class="milestone-label"
                :x="xx(m.end) + barwidth / 2" :y="getYLane(m.id) * (barheight + bardist) + (barheight)/2 + 2"
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
                <button @click="closeModal()" type="button" class="close" data-dismiss="modal"
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
                    <label for="inputObjectic" class="col-sm-2 col-form-label">Lernziel *</label>
                    <div class="col-sm-10">
                        <input @change="updateObjective" :style="invalidObjective ? \'border: solid 1px #ff420e;\' : \'\'" v-model="getSelectedMilestone().objective" type="text"
                            class="form-control" id="inputLearningObjective"
                            placeholder="Welches Lernziel verfolgen Sie?">
                    </div>
                    <div class="col-sm-10 alert-invalid" v-if="invalidObjective">Geben Sie bitte ein Lernziel an.</div>
                </div>
                <div class="form-group row">
                    <label for="inputObjectic" class="col-2 col-form-label">Termin *</label>
                    <div class="col-4">
                        <select @change="daySelected" id="select_day"
                            :style="dayInvalid ? \'border: solid 1px #ff420e;\' : \'none\'"
                            >
                            <option v-for="d in dayRange()"
                                
                                :value="d">{{ d }}
                            </option>
                        </select>

                        <select @change="monthSelected" id="select_month">
                            <option v-for="d in monthRange()"
                                
                                :value="d.num">{{ d.name }}</option>
                        </select>

                        <select @change="yearSelected" id="select_year">
                            <option v-for="d in yearRange()"
                                
                                :value="d">{{ d }}</option>
                        </select>
                    </div>
                    {{dayInvalid}}
                    <div v-if="dayInvalid" class="col-sm-10 alert-invalid">Wählen Sie bitte ein gültiges datum aus. Den {{ selectedDay }}. gibt es im ausgwählten Monat nicht. </div>
                </div>
                <hr />
                <div class="row">
                    <!-- Resourcen -->
                    <div id="resources" class="col-md-6">
                        <label for="" class="col-sm-12 col-form-label">Mit welchen Themen, Materialien und
                        Aktivitäten wollen Sie Ihr Lernziel erreichen?</label>
                        <ul>
                            <li v-for="s in getSelectedMilestone().resources" class="form-check">
                                <span :class="s.checked ? \'ms-wrapper-resource ms-done\' : \'ms-wrapper-resource ms-not-done\'">
                                    <label class="form-check-label" for="defaultCheck1">
                                        <input 
                                            class="s.checked ? \'form-check-input ms-done\' : \'form-check-input ms-not-done\'" 
                                            type="checkbox" v-model="s.checked"
                                            data-toggle="tooltip"
                                            title="Setzen Sie das Häkchen, wenn Sie diese Resource bereits bearbeitet haben."
                                            v-bind:id="s.id">
                                        <a :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id">{{ s.name }} {{ done[s.id] }} {{ s.checked }}</a>
                                        <!--<i class="fa fa-info"></i>-->
                                        <span class="remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                            <i class="fa fa-trash left" @click="resourceRemove(s.id)"></i>
                                        </span>
                                    </label>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div id="strategies" class="col-md-6">
                        <!-- Strategien -->
                        <label for="" class=" col-form-label">Welche Lernstrategien möchten Sie dabei anwenden?</label>
                        <ul>
                            <li v-for="s in getSelectedMilestone().strategies" class="form-check">
                                <label :class="s.checked ? \'form-check-label ms-done ms-wrapper-resource\' : \'form-check-label ms-wrapper-resource ms-not-done\'" for="defaultCheck1">
                                    <input :class="s.checked ? \'form-check-input ms-done\' : \'form-check-input ms-not-done\'" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie diese Lernstrategie bereits angewendet haben."
                                        id="strategyCheck" v-model="s.checked" v-bind:id="s.id">
                                    <span class="list-label">{{ s.name }}</span>
                                    <button type="button" class="btn btn-sm btn-link"
                                        data-toggle="popover" :title="s.desc"><i
                                            class="fa fa-info"></i></button>
                                    <span class="remove-btn" data-toggle="tooltip" title="Lernstrategie entferenen">
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
                            <select @change="resourceSelected" class="" id="modal_strategy-select"
                                class="">
                                <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien und Aktivitäten</option>
                                <optgroup v-for="section in resourceSections()" :label="section.name">
                                    <option v-for="s in resourcesBySection(section.id)" :value="s.id">{{ s.instance_type }}: {{ s.name }}</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="col-sm-10 alert-invalid" v-if="invalidResources">Wählen Sie bitte Themen, Materialien und Aktivitäten aus.</div>
                    </div>
                    <div class="col-md-6">
                        <div class="select-wrapper" :style="invalidStrategy ? \'border: solid 1px #ff420e;\' : \'none\'">
                            <span id="before-select"><i class="fa fa-plus"></i> </span>
                            <select @change="strategySelected" class="" id="modal_strategy-select"
                                class="">
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
                <div class="row">
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
                        <div><!-- v-if="selectedMilestone === -1" -->
                            <button @click="validateMilestoneForm()" class="btn btn-primary btn-sm">
                                Speichern
                            </button>
                            <!--<button class="right btn btn-link" data-dismiss="modal" aria-label="abbrechen">abbrechen</a>-->
                            <!--<button class="right btn btn-link red" data-dismiss="modal" ria-label="entfernen">entfernen</a>-->
                        </div>
                    </div>
                </div>
                <!-- Reflection form -->
                <div v-if="reflectionsFormVisisble" class="ms-reflection row">
                    <hr />
                    <h5 class="col-12">Reflexion des Meilenstein: {{ getSelectedMilestone().name }}</h5>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label" for="ref0">
                            Wie gut hat mir die Planung dieses Meilensteins bei der Erarbeitung meines Lernziels geholfen?
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
                        <label class="col-sm-12 col-form-label" for="ref2">
                            Wie gut passten die ausgewählten Lernstrategien zu den Arbeitsmaterialien, um mein Lernziel zu erreichen?
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
                        <label class="col-sm-12 col-form-label" for="ref2">
                            Wie gut konnte ich meinen Zeitplan einhalten?
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
                        <label class="col-sm-12 col-form-label" for="ref4">
                            Wie möchte ich meine Arbeitsweise verbessern? Das sind meine Lernhinweise für die Zukunft:
                        </label>
                        <div class="col-sm-12">
                            <textarea v-model="getSelectedMilestone().reflections[3]"
                                cass="form-control" id="ref4" rows="2"></textarea>
                        </div>
                    </div>
                </div>
                <button @click="submitReflections()" :disabled="validateReflectionForm() ? false : true"
                    v-if="reflectionsFormVisisble" class="btn btn-primary btn-sm"
                    data-dismiss="modal">Reflexion abschließen</button>
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
</section>
</div>
</div>


<div id="page-content" class="row">
    <div class="region-main-box col-12">
        <section id="region-main">
            <div class="card">
                <div class="card-body ladtopics">
                    <div id="ladtopic-container-0" class="course-content">
                        <span hidden id="courseid">'. $COURSE->id .'</span>
                        
                        '. $initialSurvey .'

                        <!-- Planing Component -->
                        <div id="planing-component" style="display:none;" v-cloak class="container dc-chart">
                            <div>
                            <div v-if="surveyDone" class="row">
                                <div class="col-12">
                                    <!-- Milestone chart -->
                                    <div class="chart ms-chart">
                                        <div class="ms-chart-header row">
                                            <div class="ms-title col-sm-12 col-md-4 col-lg-4">
                                                <ul class="nav nav-pills" id="viewPillsTab" role="tablist">
                                                    <li>Meine Semesterplanung</li>
                                                    <li class="nav-item">
                                                        <a class="nav-link active" @click="hideAdditionalCharts()" id="milestone-list-tab" data-toggle="tab" href="#view-list" role="tab" aria-controls="view-list" aria-selected="false">(list)</a>
                                                    </li>
                                                    <li class="nav-item">
                                                        <a class="nav-link" @click="showAdditionalCharts()" id="milestone-timeline-tab" data-toggle="pill" href="#view-timeline" role="tab" aria-controls="view-timeline" aria-selected="true">(timeline)</a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="col-sm-12 col-md-8 col-lg-8">
                                                <span data-toggle="modal" data-target="#theMilestoneModal">
                                                    <button @click="showEmptyMilestone()" class="btn btn-sm right btn-primary ms-btn"
                                                        data-toggle="tooltip" data-placement="bottom" title="Neuen Meilenstein hinzufügen"><i
                                                            class="fa fa-plus"></i></button>
                                                </span>
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
                                    <div class="tab-pane col-12 fade" id="view-timeline" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        ' . $milestoneTimeline . '
                                    </div>
                                    <div class="tab-pane fade show active milestone-list" id="view-list" role="tabpanel"aria-labelledby="view-list-tab">
                                        ' . $milestoneList . '
                                    </div>
                                </div>
                                <!-- End pill content -->
                            

                                ' . $modalMilestone . '
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
                            
                            <textarea>{{ milestones }}</textarea>
                        </div>    
                        </div>
                        <!-- End planing component -->


                        <div class="container row" hidden>
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
                    <!-- End ladtopic container -->
                </div>
            </div>
        </section>
    </div>
</div>

<div id="page-content" class="row">
    <div class="region-main-box col-12">
        <section id="region-main" class="has-blocks mb3">
            <div class="card">
                <div class="card-body">
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
