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
        //print_r($COURSE);
        $content = '
        <span hidden id="courseid">'. $COURSE->id .'</span>
        <div id="alert"></div>


    


<div class="container dc-chart" id="dc-chart">      
    <div class="row">
        <!-- Milestone chart -->
        <div id="milestone-chart" class="col-12">
            <!-- Chart -->
            <div class="chart"></div>
            <div id="theMilestoneModal" v-if="modalVisible" class="modal fade" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="MilestoneModalLabel" v-text="getSelectedMilestone().name"></h5>
                                <button @click="$emit(\'close\')" type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="form-group row">
                                        <label for="inputMSname" class="col-sm-2 col-form-label">Name</label>
                                        <div class="col-sm-10">
                                        <input v-model="getSelectedMilestone().name" type="text" class="form-control" id="inputMSname" placeholder="Name des Meilensteins">
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label for="inputObjectic" class="col-sm-2 col-form-label">Lernziel</label>
                                        <div class="col-sm-10">
                                        <input v-model="getSelectedMilestone().objective" type="text" class="form-control" id="inputPassword3" placeholder="Welches lernziel verfolgen Sie?">
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <!-- Ressourcen -->
                                        <div id="resources" class="col-md">
                                            <button type="button" class="btn btn-info"><i class="fa fa-plus"></i> Lernressource hinzufügren</button>
                                        </div>
                                        <!-- Strategien -->
                                        <div id="strategies" class="col-md">
                                            <ul>
                                                <li v-for="s in getSelectedMilestone().strategies" class="form-check">
                                                    <label class="form-check-label" for="defaultCheck1">{{ s.name }} <i class="fa fa-info"></i></label>
                                                    <input class="form-check-input" type="checkbox" value="" id="strategyCheck">
                                                </li>
                                            </ul>
                                            <div class="select-wrapper btn btn-info">
                                                <span id="before-select"><i class="fa fa-plus"></i> </span>
                                                <select @change="strategySelected" class="" id="modal_strategy-select" class="">
                                                    <option selected disabled>Lernstrategie</option>
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
                                    </div>
                                </form>
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
    <br>
    <div class="row">
        <ul class="nav nav-tabs">    
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
