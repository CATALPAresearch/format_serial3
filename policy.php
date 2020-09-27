<?php

require_once(dirname(__FILE__) . '/../../../config.php');

$context = context_system::instance();
global $USER, $PAGE, $DB, $CFG;
$PAGE->set_context($context);
$PAGE->set_url($CFG->wwwroot.'/course/format/ladtopics/policy.php');
$PAGE->set_pagelayout('course');
$PAGE->set_title("Zustimmung und Richtlinien");
echo $OUTPUT->header();


global $DB, $USER;
$message = '';

// change policy status
if(isset($_GET['policy']) && isset($_GET['status']) && isset($_GET['version'])){
    
    $query = '
    UPDATE '.$CFG->prefix.'tool_policy_acceptances 
    SET status=? 
    WHERE policyversionid=? AND userid=?';
    $res = $DB->execute($query, array((int)$_GET['status'], (int)$_GET['version'], (int)$USER->id));
    $message = 'Eine Richtlinie wurde aktualisiert.';
    
}

// fetch policies
$query = '
SELECT v.name, a.status, a.timecreated as acceptance, v.timecreated as creation, p.id as id, v.id as version
From '.$CFG->prefix.'tool_policy as p
JOIN '.$CFG->prefix.'tool_policy_acceptances as a ON p.currentversionid = a.policyversionid
JOIN '.$CFG->prefix.'tool_policy_versions as v ON v.id = p.currentversionid
WHERE a.userid = ?
    '; 
$res = $DB->get_records_sql($query, array((int)$USER->id));
//get_records("tool_policy_acceptances", array("userid" => (int)$USER->id ));
echo '<policy-container></policy-container>';
$PAGE->requires->js_call_amd('format_ladtopics/Policy', 'init', array('policies'=>$res, 'message'=>$message));
echo $OUTPUT->footer();

