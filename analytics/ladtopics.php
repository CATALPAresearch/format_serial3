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
 * 
 * @author Marc Burchart <marc.burchart@fernuni-hagen.de>
 * 
 */

require_once(dirname(__FILE__) . '/../../../../config.php');
$context = context_system::instance();
$PAGE->set_context($context);
$PAGE->set_url($CFG->wwwroot.'/course/format/ladtopics/analytics/ladtopics.php');
require_login();

$PAGE->set_pagelayout('course');
$PAGE->set_title(get_string('surveyTitle', 'format_ladtopics'));
$PAGE->set_heading(get_string('surveyHeadline', 'format_ladtopics'));

if(!isset($_GET['c']) || $DB->count_records('course', array('id' => $_GET['c'])) !== 1){
    // Kurs nicht gefunden
    redirect(new moodle_url("/"), 'Es wurde kein passender Kurs übergeben!', null, \core\output\notification::NOTIFY_WARNING);
} else {
    $courseid = $_GET['c'];
    // Kurs gefunden
    $permission = new format_ladtopics\permission\course((int)$USER->id, $courseid);   
    if(!$permission->isAnyKindOfModerator()){
        // Keine Berechtigung
        redirect(new moodle_url("/"), 'Sie haben keine Berechtigung das Dashboard einzusehen!', null, \core\output\notification::NOTIFY_WARNING);
    } else {
        // Zugriff gewährt
        echo $OUTPUT->header();
        echo '<analytics-dashboard></analytics-dashboard>';  
        $PAGE->requires->js_call_amd('format_ladtopics/ladAnalytics', 'init', array('course' => $courseid));      
        echo $OUTPUT->footer();
    }
}
