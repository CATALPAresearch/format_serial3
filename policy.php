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
    
    $entry = $DB->get_record("tool_policy_acceptances", 
        array(
            "userid" => (int)$USER->id,
            "policyversionid" => (int)$_GET['version']
        )
    );

    $time = time();
    if($entry === false){
        $lang = 'de_feu';
        $sql = '
            INSERT INTO '.$CFG->prefix.'tool_policy_acceptances (
                policyversionid,
                userid,
                status,
                lang,
                usermodified,
                timecreated,
                timemodified
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ';
        $res = $DB->execute($sql, 
            array(
                (int)$_GET['version'],
                (int)$USER->id,
                (int)$_GET['status'], 
                $lang,
                (int)$USER->id,
                $time, 
                $time
            )
        );
    } else {
        $sql = '
            UPDATE '.$CFG->prefix.'tool_policy_acceptances 
            SET status=?, timemodified=?
            WHERE policyversionid=? AND userid=?';
        $res = $DB->execute($sql, array((int)$_GET['status'], $time, (int)$_GET['version'], (int)$USER->id));
    }

    $message = 'Eine Richtlinie wurde aktualisiert.';
}

// fetch policies
$query = '
SELECT 	v.name, 
		a.status, 
		a.timecreated as acceptance, 
		v.timecreated as creation, 
		p.id as id, 
		v.id as version
FROM '.$CFG->prefix.'tool_policy as p
LEFT JOIN '.$CFG->prefix.'tool_policy_acceptances as a 
ON p.currentversionid = a.policyversionid
AND a.userid = ?
INNER JOIN '.$CFG->prefix.'tool_policy_versions as v 
ON p.currentversionid = v.id
'; 
$res = $DB->get_records_sql($query, array((int)$USER->id));
//get_records("tool_policy_acceptances", array("userid" => (int)$USER->id ));
echo '<policy-container></policy-container>';
$PAGE->requires->js_call_amd('format_ladtopics/Policy', 'init', array('policies'=>$res, 'message'=>$message));
echo $OUTPUT->footer();

