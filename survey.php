<?php

require_once(dirname(__FILE__) . '/../../../config.php');

$context = context_system::instance();
global $USER, $PAGE, $DB, $CFG;
$PAGE->set_context($context);
$PAGE->set_url($CFG->wwwroot.'/course/format/ladtopics/survey.php');

$link = 'https://umfrage.fernuni-hagen.de/v3/';


if(!isset($_SESSION['s'])) $_SESSION['s'] = new stdClass();

$sess = $_SESSION['s'];

if(isset($_GET['c'])){
    $sess->c = $_GET['c'];
} else if(isset($_GET['a'], $_GET['s']) && is_numeric($_GET['a']) && is_numeric($_GET['s'])){
    if(!isset($sess->s)) $sess->s = array();       
    // @LS => ?s={SID}&a={SAVEDID}
    $obj = new stdClass();
    $obj->survey_id = +$_GET['s'];
    $obj->submission_id = +$_GET['a'];     
    $obj->complete_date = time();
    array_push($sess->s, $obj);  
}

require_login();

if(isset($sess->s)){
    if(is_array($sess->s)){
        foreach($sess->s as $survey){
            $survey->user_id = $USER->id;            
            $DB->insert_record('limesurvey_submissions', $survey);
        }
        //\core\notification::success("gespeichert");
    }  
    unset($sess->s);  
    $url = new moodle_url('/course/format/ladtopics/survey.php');
    redirect($url);
} 

if(isset($sess->c)){  
    $id = 1;  
    $records = $DB->get_records_sql('SELECT * FROM '.$CFG->prefix.'limesurvey_assigns WHERE course_id = ?', array(+$sess->c));   
    $pending = false;
    $list = '';
    foreach($records as $record){    
        
        if(isset($record->startdate) && is_int(+$record->startdate) && !is_null($record->startdate)) {            
            if(time() < $record->startdate) {
                continue;
            }
        }

        if(isset($record->stopdate) && is_int(+$record->stopdate) && !is_null($record->stopdate)){
            if(time() > $record->stopdate) {
                continue;
            };
        }

        $record->done = $DB->record_exists_sql('SELECT * FROM '.$CFG->prefix.'limesurvey_submissions WHERE user_id = ? AND survey_id = ?', array($USER->id, $record->survey_id));        
        // Insert values.
        $title = $record->name;        
        if(isset($record->startdate) && !is_null($record->startdate) && is_int(+$record->startdate) && $record->startdate > 0){
            $start = date("d.m.Y H:i", $record->startdate);
        } else {
            $start = "-";
        }

        if(isset($record->stopdate) && !is_null($record->stopdate) && is_int(+$record->stopdate) && $record->stopdate > 0){
            $stop = date("d.m.Y H:i", $record->stopdate);
        } else {
            $stop = "-";
        }
        if(isset($record->warndate) && !is_null($record->warndate) && is_int(+$record->warndate) && $record->warndate > 0){
            $warn = date("d.m.Y H:i", $record->warndate);
        } else {
            $warn = "-";
        }     

        if($record->done === true){
            $state = "<span class=\"text-success font-weight-bold\">".get_string('surveyDone', 'format_ladtopics')."</span>";
        } else {
            $pending = true;
            if(isset($record->warndate) && is_int(+$record->warndate) && $record->warndate <= time()){
                $state = "<span class=\"text-danger font-weight-bold\">".get_string('surveyRequired', 'format_ladtopics')."</span>"; 
            } else {
                $state = "<span class=\"text-warning font-weight-bold\">".get_string('surveyPending', 'format_ladtopics')."</span>"; 
            }
        }     
        
        $surveyID = $record->survey_id;      
       
        $list .=    "<tr>
            <th class=\"align-middle\">{$id}</th>
                <td class=\"align-middle\">{$title}</td>
                <td class=\"align-middle\">{$start}</td>
                <td class=\"align-middle\">{$warn}</td>
                <td class=\"align-middle\">{$stop}</td>
                <td class=\"align-middle\">{$state}</td>
                <td class=\"align-middle\"><button class=\"btn btn-primary center-block\" onClick=\"javascript:window.location.href='{$link}{$surveyID}'\">Zur Umfrage</button></td>
            </tr>";
        $id++;    

    }   

    if($pending === false){        
        redirect(new moodle_url('/course/view.php', array('id' => +$sess->c)));
    }

    // OUTPUT
    $PAGE->set_pagelayout('course');
    $PAGE->set_title(get_string('surveyTitle', 'format_ladtopics'));
    $PAGE->set_heading(get_string('surveyHeadline', 'format_ladtopics'));
    echo $OUTPUT->header();  
    echo '<div style="display: inline-block;"><p class="mt-2 mb-4">'.get_string('surveyDescription', 'format_ladtopics').'</p>';   
    echo "<table class=\"table table-striped\">
                    <thead class=\"thead-dark\">
                        <tr>
                            <th scope=\"col\">".get_string('surveyID', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyTitle', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyStart', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyWarn', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyStop', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyState', 'format_ladtopics')."</th>
                            <th scope=\"col\">".get_string('surveyLink', 'format_ladtopics')."</th>
                        </tr>
                    <thead>
                    <tbody>
                        {$list}
                    </tbody>
                </table>";       
    $courseURL = new moodle_url('/course/view.php', array('id' => +$sess->c));
    echo '<p class="text-center">'.get_string('surveyReqText', 'format_ladtopics').'</p>';
    echo '<div class="text-center"><button onClick="javascript:window.location.href=\''.$courseURL->__toString().'\';" class="btn btn-secondary center-block">'.get_string('surveyButton', 'format_ladtopics').'</button></div></div>';
    echo $OUTPUT->footer();
} else {    
    redirect(new moodle_url('/'));
}
