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
    $records = $DB->get_records_sql('SELECT * FROM '.$CFG->prefix.'limesurvey_assigns WHERE course_id = ?', array(+$sess->c));   
    $pending = false;
    $list = '<div class="list-group">';
    foreach($records as $record){
        $record->done = $DB->record_exists_sql('SELECT * FROM '.$CFG->prefix.'limesurvey_submissions WHERE user_id = ? AND survey_id = ?', array($USER->id, $record->survey_id));        
        if($record->done === true) {          
            $list .= '<a href="#" class="list-group-item list-group-item-action disabled" style="background-color: rgb(195,230,203);"><span class="text-success"><i class="icon fa fa-check fa-fw"></i>'.$record->name.'</span></a>';
        } else {
            $show = true;
            $icon = 'fa-share'; // fa-check
            $color = '';
            if(isset($record->startdate) && !is_null($record->startdate)){
                if(time($record->startdate) > time()){
                    $show = false;
                }
            }
            if(isset($record->stopdate) && !is_null($record->stopdate)){
                if(time($record->stopdate) <= time()){
                    $show = false;
                }
            }
            if(isset($record->warndate) && !is_null($record->warndate)){
                if(time($record->warndate) <= time()){
                    $icon = 'fa-exclamation';
                    $color = 'text-danger';
                }
            } else {
                $icon = 'fa-exclamation';
                $color = 'text-danger';
            }
            if($show){
                $pending = true;
                $list .= '<a href="'.$link.$record->survey_id.'" class="list-group-item list-group-item-action list-group-item-light"><span class="'.$color.'"><i class="icon fa '.$icon.' fa-fw"></i>'.$record->name.'</span></a>';
            }            
        }
    }
    $list .= '</div>';
    if($pending === false){        
        redirect(new moodle_url('/course/view.php', array('id' => +$sess->c)));
    }   

    // OUTPUT
    $PAGE->set_pagelayout('course');
    $PAGE->set_title(get_string('surveyTitle', 'format_ladtopics'));
    $PAGE->set_heading(get_string('surveyHeadline', 'format_ladtopics'));
    echo $OUTPUT->header();    
    echo '<p class="mb-2">'.get_string('surveyDescription', 'format_ladtopics').'</p>';   
    echo $list;
    echo '<p class="mt-2"><i>'.get_string('surveyRequired', 'format_ladtopics').'</i></p>';
    echo '<p>'.time().'</p>'; 
    echo '<div class="mt-1 text-center"><button onClick="'.new moodle_url('/').'" class="btn btn-primary center-block">'.get_string('surveyButton', 'format_ladtopics').'</button></div>';
    echo $OUTPUT->footer();
} else {    
    redirect(new moodle_url('/'));
}
