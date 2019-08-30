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
        $content = '
        <span hidden id="courseid">'. $COURSE->id .'</span>
        <div id="alert"></div>

<!-- Initial survey -->
<div id="planningsurvey">
    <div class="row survey-btn">
        <div class="col-sm-2 col-centered">
            <div @click="showModal()" class="survey-starter" data-toggle="modal" data-target="#theSurveyModal">
                <i class="fa fa-question"></i><br/>
                <span>Lernen mit Plan</span>
            </div>
        </div>
    </div>
    <div id="theSurveyModal" class="modal" tabindex="-1" role="dialog">
        <div v-if="modalSurveyVisible" class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="MilestoneModalLabel">Eingangsbefragung</h5>
                    <button @click="closeModal()" type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-check row">
                        <label for="" class="col-12 col-form-label survey-objective-label">Welches Ziel verfolgen Sie in diesem Kurs/Modul?</label>
                        <div class="form-check">
                            <input :checked="objectives == \'f1a\'" @change="e => objectives = e.target.value" class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="f1a">
                            <label class="form-check-label" for="exampleRadios1">
                                Die Prüfung erfolgreich absolvieren
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="f1b" v-model="objectives">
                            <label class="form-check-label" for="exampleRadios2">
                                Orientierung im Themengebiet erlangen
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios3" value="f1c" v-model="objectives">
                            <label class="form-check-label" for="exampleRadios3">
                                Meinen eigenen eigenen Interessen bzgl. bestimmter Themengebiete nachgehen
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios4" value="f1d" v-model="objectives">
                            <label class="form-check-label" for="exampleRadios4">
                                keine Angaben
                            </label>
                        </div>
                    </div> 
                    <hr>
                    <div class="form-group row">
                        <label for="inputMSname" class="col-10 col-form-label">Wie viele Stunden können Sie voraussichtlich für das Lernen in diesem Kurs/Modul aufwenden?</label>
                        <div class="col-2">
                            <input type="number" class="form-control" id="inputMSname" placeholder="0" v-model="availableTime">
                        </div>
                    </div>
                    <hr v-if="objectives === \'f1a\'">
                    <div v-if="objectives === \'f1a\'" class="form-group row">
                        <label for="inputObjectic" class="col-10 col-form-label">Wann beabsichtigen Sie die Prüfung abzulegen bzw. die Klausur zu schreiben?</label>
                        <div class="col-4">
                            <select @change="monthSelected" id="select_month">
                                <option v-for="d in monthRange()" :selected="d.num-1 === (new Date(getSelectedMilestone().end)).getMonth()" :value="d.num">{{ d.name }}</option>
                            </select>
                        
                            <select @change="yearSelected" id="select_year">
                                <option v-for="d in yearRange()" :selected="d === (new Date()).getFullYear()">{{ d }}</option>
                            </select>
                        </div>
                        <div class="col-7"></div>
                    </div>
                    <hr v-if="objectives === \'f1c\'">
                    <div v-if="objectives === \'f1c\'" class="row">
                        <label class="col-12 col-form-label">Wählen Sie die Themen, Materialien und Aktivitäten aus, die Sie besonders interessieren und sortieren Sie diese absteigend nach Ihrem Interesse:</label>
                        <div id="resources" class="col-md">
                            <ul id="selected_resources">
                                <li v-for="s in resources" class="form-check">
                                    <label class="form-check-label" for="defaultCheck1">
                                        <i class="fa fa-sort" title="Reihenfolge ändern"></i>
                                        {{ s.name }} 
                                        <span class="remove-btn">
                                            <i class="fa fa-trash" @click="resourceRemove(s.id)" title="entfernen"></i>
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
                                    <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien und Aktivitäten</option>
                                    <option v-for="s in availableResources" :value="s.id">{{ s.name }}</option>
                                </select>
                            </div> 
                        </div> 
                    </div>
                    <br />
                    <div class="row row-smooth">
                        <div class="col-md">
                            <div>
                                <button :disabled="objectives !== \'\' && availableTime > 0 ? false : true" @click="saveSurvey()" class="btn btn-primary btn-sm" data-dismiss="modal">Speichern</button>
                                <button class="right btn btn-link right" data-dismiss="modal" aria-label="abbrechen">abbrechen</a>
                            </div>
                        </div>
                    </div>   
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container dc-chart" id="dc-chart"> 
    <div class="row">
        <!-- Milestone chart -->
        <div id="milestone-chart" class="col-12">
            <!-- Chart -->
            <div class="chart ms-chart">
                <button @click="showEmptyMilestone()" class="btn btn-sm right btn-primary ms-btn" data-toggle="modal" data-target="#theMilestoneModal"><i class="fa fa-plus"></i></button>
                <button @click="setFilterPreset(\'today\')" class="btn btn-sm ms-btn btn-link right" >heute</button>
                <button @click="setFilterPreset(\'last-week\')" class="btn btn-sm btn-link ms-btn right" >letzte Woche</button>
                <button @click="setFilterPreset(\'last-month\')" class="btn btn-sm btn-link ms-btn right" >letzten 4 Wochen</button>
                <button @click="setFilterPreset(\'semester\')" class="btn btn-link btn-sm right" >WS 19/20</button>
                <svg :width="width" :height="height+margins.top">
                    <g :transform="\'translate(\'+( margins.left + 10 ) +\',\'+ margins.top +\')\'">
                        <rect v-for="m in milestones" @click="showModal(m.id)" class="milestone-learning-progress" :x="xx(m.end)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight" :width="barwidth * m.progress" data-toggle="modal" data-target="#theMilestoneModal"></rect>
                        <rect v-for="m in milestones" @click="showModal(m.id)" :class="\'milestone-bar milestone-\'+ m.status" :id="\'milestoneBar_\'+m.id" :x="xx(m.end)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight" :width="barwidth" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal"></rect>
                        <text v-for="m in milestones" @click="showModal(m.id)" class="milestone-label" :x="xx(m.end) + barwidth / 2" :y="getYLane(m.id) * (barheight + bardist) + barheight/2" data-toggle="modal" data-target="#theMilestoneModal">{{ limitTextLength( m.name, 14 ) }}</text>
                    </g>
                    <g class="grid-line horizontal" transform="translate(60,10)">
                        <line v-for="m in [0,1,2]" x1="1" :y1="m * (barheight + bardist) + barheight/2" x2="1060" :y2="m * (barheight + bardist) + barheight/2" opacity="0.5"></line>
                    </g>
                </svg>
            </div>

            <!-- Modal milestone window -->
            <div id="theMilestoneModal" class="modal" tabindex="-1" role="dialog">
                <div v-if="modalVisible" class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <div class="modal-header-completion" :style="\'width:\'+ (getSelectedMilestone().progress * 100) +\'%;\'">
                                    <div class="modal-header-completion-label"> {{ (getSelectedMilestone().progress * 100) }}%</div>
                                </div>
                                <h5 class="modal-title" id="MilestoneModalLabel">Meilenstein: {{ getSelectedMilestone().name }}</h5>
                                <span v-if="getSelectedMilestone().name !== \'\'">
                                    <i @click="removeMilestone()" class="fa fa-trash ms-remove" title="Meilenstein entfernen"></i>
                                </span>
                                <button @click="closeModal()" type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="form-group row">
                                    <label for="inputMSname" class="col-sm-2 col-form-label">Name *</label>
                                    <div class="col-sm-10">
                                    <input v-model="getSelectedMilestone().name" type="text" class="form-control" id="inputMSname" placeholder="Name des Meilensteins">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="inputObjectic" class="col-sm-2 col-form-label">Lernziel *</label>
                                    <div class="col-sm-10">
                                    <input v-model="getSelectedMilestone().objective" type="text" class="form-control" id="inputLearningObjective" placeholder="Welches Lernziel verfolgen Sie?">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label for="inputObjectic" class="col-2 col-form-label">Termin *</label>
                                    <div class="col-4">
                                    <select @change="daySelected" id="select_day" :class="dayInvalid == true ? \' red-border \' : \'\'">
                                        <option v-for="d in dayRange()" :selected="d==(new Date(getSelectedMilestone().end)).getDate()">{{ d }}</option>
                                    </select>
                                    
                                    <select @change="monthSelected" id="select_month">
                                        <option v-for="d in monthRange()" :selected="d.num-1 === (new Date(getSelectedMilestone().end)).getMonth()" :value="d.num">{{ d.name }}</option>
                                    </select>
                                    
                                    <select @change="yearSelected" id="select_year">
                                        <option v-for="d in yearRange()" :selected="d === (new Date()).getFullYear()">{{ d }}</option>
                                    </select>
                                    </div>
                                    <div class="col-7"></div>
                                </div>
                                <div class="row">
                                    <!-- Resourcen -->
                                    <div id="resources" class="col-md">
                                        <ul>
                                            <li v-for="s in getSelectedMilestone().resources" class="form-check">
                                                <label class="form-check-label" for="defaultCheck1">
                                                    <input class="form-check-input" type="checkbox" v-model="s.checked" v-bind:id="s.id">
                                                    <a :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id">{{ s.name }}</a>
                                                    <!--<i class="fa fa-info"></i>-->
                                                    <span class="remove-btn">
                                                        <i class="fa fa-trash left" @click="resourceRemove(s.id)"></i>
                                                    </span>
                                                </label>
                                            </li>
                                        </ul>
                                    </div>  
                                    <!-- Strategien -->
                                    <div id="strategies" class="col-md">
                                        <ul>
                                            <li v-for="s in getSelectedMilestone().strategies" class="form-check">
                                                <label class="form-check-label" for="defaultCheck1">
                                                    <input class="form-check-input" type="checkbox" value="" id="strategyCheck">
                                                    {{ s.name }}
                                                    <i class="fa fa-info"></i>
                                                    <span class="remove-btn">
                                                        <i class="fa fa-trash" @click="strategyRemove(s.id)"></i>
                                                    </span>
                                                </label>
                                            </li>
                                        </ul>
                                        
                                    </div>
                                </div>
                                <!-- Select Buttons -->
                                <div class="row">
                                    <div class="col-md">
                                        <div class="select-wrapper">
                                            <span id="before-select"><i class="fa fa-plus"></i> </span>
                                            <select @change="resourceSelected" class="" id="modal_strategy-select" class="">
                                                <option :selected="true" disabled value="default">Lernressource *</option>
                                                <option v-for="s in resources" :value="s.id">{{ s.name }}</option>
                                            </select>
                                        </div> 
                                    </div>
                                    <div class="col-md">
                                        <div class="select-wrapper">
                                            <span id="before-select"><i class="fa fa-plus"></i> </span>
                                            <select @change="strategySelected" class="" id="modal_strategy-select" class="">
                                                <option :selected="true" disabled>Lernstrategie</option>
                                                <optgroup label="Fachbegriffe">
                                                    <option v-for="s in strategiesByCategory(\'terms\')" :value="s.id">{{ s.name }}</option>
                                                </optgroup>
                                                <optgroup label="Zusammenhänge">
                                                    <option v-for="s in strategiesByCategory(\'relations\')" :value="s.id">{{ s.name }}</option>
                                                </optgroup>
                                                <optgroup label="Abläufe">
                                                    <option v-for="s in strategiesByCategory(\'processes\')" :value="s.id">{{ s.name }}</option>
                                                </optgroup>
                                                <optgroup label="Sonstige">
                                                    <option v-for="s in strategiesByCategory(\'misc\')" :value="s.id">{{ s.name }}</option>
                                                </optgroup>
                                            </select>
                                        </div>    
                                    </div>
                                    <div class="col-md">
                                        <button @click="toggleReflectionsForm()" 
                                            :class="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? \'btn btn-primary\' : \'btn disabled\'"
                                            :disabled="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? false : true"
                                            >
                                            Reflexion beginnen
                                            </button>
                                    </div>
                                </div>
                                <!-- Save new milestone-->
                                <div class="row row-smooth">
                                    <div class="col-md">
                                        <div v-if="selectedMilestone === -1">
                                            <button
                                                :disabled="validateMilestoneForm() ? false : true"
                                                @click="createMilestone" 
                                                class="btn btn-primary btn-sm" 
                                                data-dismiss="modal">
                                                Speichern
                                            </button>
                                            <!--<button class="right btn btn-link" data-dismiss="modal" aria-label="abbrechen">abbrechen</a>-->
                                            <!--<button class="right btn btn-link red" data-dismiss="modal" ria-label="entfernen">entfernen</a>-->
                                        </div>
                                    </div>
                                </div>
                                <!-- Reflection form -->
                                <div v-if="reflectionsFormVisisble" class="ms-reflection">
                                    <hr />
                                    <h5>Reflexion des Meilenstein: {{ getSelectedMilestone().name }}</h5>
                                    <div class="form-group row">
                                        <label class="col-sm-12 col-form-label" for="ref0">Eine zweite Reflexionsfrage</label>
                                        <div class="col-sm-12">
                                            <textarea v-model="getSelectedMilestone().reflections[0]" class="orm-control" id="ref0" rows="2"></textarea>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-sm-12 col-form-label" for="ref1">Eine zweite Reflexionsfrage</label>
                                        <div class="col-sm-12">
                                            <textarea v-model="getSelectedMilestone().reflections[1]" cass="form-control" id="ref1" rows="2"></textarea>
                                        </div>    
                                    </div>
                                </div>
                                <button @click="submitReflections()" :disabled="validateReflectionForm() ? false : true" v-if="reflectionsFormVisisble" class="btn btn-default btn-sm" data-dismiss="modal">Reflexion abschließen</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
        <!-- DC charts -->
        <div id="timeline-chart" class="col-12"></div>
        <div id="filter-chart" class="col-12"></div>
        <div id="date-chart" class="col-12"></div>
    </div>
    <div class="container row" hidden>
        <div class="col-md-12">
            <ul class="nav">    
                <li class="nav-item active"><a class="nav-link active" data-toggle="tab" href="#timemanagement" role="tab">Zeitmanagement</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#strategy" role="tab">Strategie</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#quiz" role="tab">Quiz</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#learningstatus" role="tab">Lernstand</a></li>
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
    
    <br>
</div>';
        return 
            html_writer::start_tag('div', array('class' => 'container dc-chart')) 
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
