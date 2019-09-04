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
 * @author N.D.Freear@open.ac.uk, and others.
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


//$PAGE->requires->css( '/course/format/ladtopics/css/bootstrap.min.css');
//$extra_css = $CFG->wwwroot.'/course/format/ladtopics/css/bootstrap.min.css';
//$extra_css_meta = '<link rel="stylesheet" type="text/css" href="'.$extra_css.'" />';
// function print_header_simple($title='', $heading='', $navigation='', $focus='', $meta='', $cache=true, $button='&nbsp;', $menu='', $usexml=false, $bodytags='', $return=false) {


//$PAGE->requires->css( '/course/format/ladtopics/css/dc.min.css');
//$PAGE->requires->css( '/course/format/ladtopics/styles.css', true );
//echo $OUTPUT->header();

//
$PAGE->requires->js_call_amd('format_ladtopics/ladtopics', 'init');//, array(array('data'=>$arr, 'user'=>$user_data)));

$renderer = $PAGE->get_renderer('format_ladtopics');

if (!empty($displaysection)) {
    $renderer->print_single_section_page($course, null, null, null, null, $displaysection);
} else {
    $renderer->print_multiple_section_page($course, null, null, null, null);
}

// Include course format js module
$PAGE->requires->js('/course/format/ladtopics/format.js');
