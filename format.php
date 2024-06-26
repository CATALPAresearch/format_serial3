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
 * Topics course format.  Display the whole course as "topics" made of modules.
 *
 * @package format_topics
 * @copyright 2006 The Open University
 * @author Niels Seidel, N.D.Freear@open.ac.uk, and others.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir.'/filelib.php');
require_once($CFG->libdir.'/completionlib.php');

// Horrible backwards compatible parameter aliasing..
if ($topic = optional_param('topic', 0, PARAM_INT)) {
    $url = $PAGE->url;
    $url->param('section', $topic);
    debugging('Outdated topic param passed to course/view.php', DEBUG_DEVELOPER);
    redirect($url);
}
// End backwards-compatible aliasing..

$context = context_course::instance($course->id);
// Retrieve course format option fields and add them to the $course object.
$course = course_get_format($course)->get_course();

if (($marker >=0) && has_capability('moodle/course:setcurrentsection', $context) && confirm_sesskey()) {
    $course->marker = $marker;
    course_set_marker($course->id, $marker);
}

// Make sure section 0 is created.
course_create_sections_if_missing($course, 0);

/*
if (format_serial3\blocking::tool_policy_accepted()) {
    $PAGE->requires->js_call_amd('format_serial3/serial3', 'init', array('courseid'=>$course->id));//, array(array('courseid'=>$course->id, 'user'=>$user_data)));
} else{
    $PAGE->requires->js_call_amd('format_serial3/serial3Cleaner', 'init');
}
*/


/**
 * A Attribute to store if the user is a moderator for the course
 */
$_moderator = null;
$courseid;
$found;
$islogged;

/**
 * A Method to test if the user is a moderator for the course
 */

function checkModeratorStatus(){
    try{
        global $USER, $COURSE;
        $context = context_course::instance($COURSE->id);
        $loggedIn = isloggedin();
        $roles = get_user_roles($context, $USER->id);
        $found = false;
        if(is_siteadmin($USER->id)){
            return true;
        }
        foreach($roles as $key => $value){
            if(isset($value->shortname)){
                if($value->shortname === "manager" || $value->shortname === "coursecreator" || $value->shortname === "teacher" || $value->shortname === "editingteacher"){
                    $found = true;
                    break;
                }
            }
        }
        if($found === true && $loggedIn === true){
            return true;
        }
        return false;
    } catch(Exception $ex){
        var_dump($ex);
        return false;
    }
}

echo '<pre>';
//print_r($course->sectioncollapsenabled);
//print_r($course);
echo '</pre>';
$PAGE->requires->js_call_amd('format_serial3/app-lazy', 'init', [
    'courseid' => $COURSE->id,
    'fullPluginName' => 'format_serial3',
    'userid' => $USER->id,
    'isModerator' => checkModeratorStatus(),
    'policyAccepted' => format_serial3\blocking::tool_policy_accepted(),
    'sectioncollapsenabled' => $course->sectioncollapsenabled ? $course->sectioncollapsenabled : 0,
    'sectioninitiallycollapsed' => $course->sectioninitiallycollapsed ? $course->sectioninitiallycollapsed : 0
]);

echo html_writer::start_tag('div', array('class' => ''))
    . '<div id="app"></div>' . html_writer::end_tag('div')
;

$renderer = $PAGE->get_renderer('format_serial3');

if (!empty($displaysection)) {
    $renderer->print_single_section_page($course, null, null, null, null, $displaysection);
} else {
    $renderer->print_multiple_section_page($course, null, null, null, null);
}

// Include course format js module
$PAGE->requires->js('/course/format/serial3/format.js');
