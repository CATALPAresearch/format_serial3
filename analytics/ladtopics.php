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
        // Alle User erhalten
        $context = $permission->getCourseContext();
        $enrollments = get_enrolled_users($context);       
        $users = array();
        $stop = 0;
        try{
            set_time_limit(120);
            foreach($enrollments as $user){  
                $stop++;
                //if($stop>20){
                //break;
                //}
                try{
                    $u = new stdClass();
                    $u->id = $user->id;
                    $u->firstname = ucfirst(strtolower($user->firstname));
                    $u->lastname = ucfirst(strtolower($user->lastname));
                    $u->username = $user->username;
                    $u->email = strtolower($user->email);
                    $u->lang = $user->lang;
                    $u->deleted = $user->deleted;
                    $u->suspended = $user->suspended;
                    $u->firstaccess = $user->firstaccess;
                    $u->lastaccess = $user->lastaccess;
                    // Milestones
                    $sql = '
                        SELECT t.milestones, t.settings, t.timemodified 
                        FROM '.$CFG->prefix.'ladtopics_milestones AS t
                        WHERE   
                            t.course = ' . (int)$courseid . ' 
                            AND t.userid = ' . (int)$user->id . '
                        ORDER BY t.timemodified DESC
                        LIMIT 1';
                    //$ms = $DB->get_record_sql($sql);               
                    if(is_object($ms)){
                        $u->milestones = new stdClass();
                        $mse = json_decode($ms->milestones);                    
                        if(!is_array($mse) || is_null($mse)){
                            $u->milestones->modified = date();
                            $u->milestones->elements = array();
                            $u->milestones->count = 0;
                        } else {
                            $u->milestones->modified = $ms->timemodified;
                            $u->milestones->elements = $mse;
                            $u->milestones->count = count($u->milestones->elements);
                        }                  
                    } else {
                        $u->milestones->modified = time();
                        $u->milestones->count = 0;
                        $u->milestones->elements = array();
                    }
                    // Preferences
                    $surveyDone = $DB->get_record("user_preferences", array(
                        'name' => 'ladtopics_survey_done-course-' . (int)$courseid,
                        'userid'=>(int)$user->id
                    ));
                    $surveyData = $DB->get_record("user_preferences", array(
                        'name' => 'ladtopics_survey_results-course-' . (int)$courseid,
                        'userid'=>(int)$user->id
                    ));
                    if($surveyDone !== false && is_object($surveyData) && isset($surveyData->value)){
                        $data = json_decode($surveyData->value);
                        if($data === null){
                            $u->initialSurvey = new stdClass();
                            $u->initialSurvey->planingStyle = 'unknown';
                            $u->initialSurvey->objectives = 'f1d';
                            $u->initialSurvey->availableTime = -1;
                        } else {
                            $u->initialSurvey = $data;
                        }
                    } else {
                        $u->initialSurvey = new stdClass();
                        $u->initialSurvey->planingStyle = 'unknown';
                        $u->initialSurvey->objectives = 'f1d';
                        $u->initialSurvey->availableTime = -1;
                    }    
                    // LimeSurvey
                    $sql = 'SELECT a.id, a.name, a.survey_id, s.complete_date, s.submission_id
                     FROM '.$CFG->prefix.'limesurvey_submissions AS s
                     INNER JOIN '.$CFG->prefix.'limesurvey_assigns AS a
                     ON s.survey_id = a.survey_id 
                        AND a.course_id = ? 
                     LIMIT 1';
                    //$lime = $DB->get_records_sql($sql, array((int)$courseid));
                    if(is_array($lime) && count($lime) > 0){
                        $u->lime = $lime;
                    } else {
                        $u->lime = array();
                    }                     
                    $users[] = $u;
                } catch(Exception $ne){
                    var_dump($ne);                  
                }
            }     
            $send = array(
                'users' => $users
            );        
            $PAGE->requires->js_call_amd('format_ladtopics/ladAnalytics', 'init', $send);    
        } catch(Exception $ex){
            var_dump($ex);
        }       
        // The Array which should be send to vue.
        echo $OUTPUT->footer();
    }
}
