<?php

require_once dirname(__FILE__) . '/../../../config.php';
require_once($CFG->libdir . '/externallib.php');

echo 1;


$context = context_system::instance();
global $USER, $PAGE, $DB;
$PAGE->set_context($context);
$PAGE->set_url($CFG->wwwroot . '/local/shorturldemux/edit.php');
require_login();


function get_meta($courseID)
{
    try {
        global $USER, $COURSE;
        $obj = new stdClass();
        $obj->course = new stdClass();
        $obj->course->id = (int)$courseID;
        require_login($obj->course->id);
        $obj->course->context = context_course::instance($obj->course->id);
        $obj->course->global = $COURSE;
        $obj->user = new stdClass();
        $obj->user->id = $USER->id;
        $obj->user->loggedin = isloggedin();
        $obj->user->siteadmin = is_siteadmin($USER->id);
        $obj->user->enrolled = is_enrolled($obj->course->context, $USER->id);
        $obj->user->guest = is_guest($obj->course->context, $USER->id);
        $obj->user->viewing = is_viewing($obj->course->context, $USER->id);
        $obj->user->roles = array();
        $obj->user->global = $USER;
        $roles = get_user_roles($obj->course->context, $USER->id);
        $obj->user->roles_raw = $roles;
        $obj->user->student = false;
        $obj->user->teacher = false;
        $obj->user->editingteacher = false;
        $obj->user->coursecreator = false;
        $obj->user->manager = false;
        foreach ($roles as $key => $value) {
            if (isset($value->shortname)) {
                switch ($value->shortname) {
                    case 'teacher':
                        $obj->user->teacher = true;
                        break;
                    case 'editingteacher':
                        $obj->user->editingteacher = true;
                        break;
                    case 'coursecreator':
                        $obj->user->coursecreator = true;
                        break;
                    case 'manager':
                        $obj->user->manager = true;
                        break;
                    case 'student':
                        $obj->user->student = true;
                        break;
                }
                $obj->user->roles[] = $value->shortname;
            }
        }
        return $obj;
    } catch (Exception $ex) {
        return null;
    }
}



$data = 2;

global $CFG, $DB, $USER, $COURSE;
$userid = (int)$USER->id;
$courseid = $data;
$debug = [];
$meta = get_meta($courseid);




// Step 1: obtain all course activities
$modinfo = get_fast_modinfo($courseid, $userid);
$sections = $modinfo->get_sections();
$activities = array();
echo 2;
print_r(get_string('pluginname', $module));
echo 0;

foreach ($modinfo->instances as $module => $instances) {
    $modulename = get_string('pluginname', $module);
    echo 0;
    foreach ($instances as $index => $cm) {
        echo 8;
        $url = is_string($cm->url) ? (method_exists($cm->url, 'out') ? $cm->url->out() : '') : '';
        $activities[] = array(
            'type'       => $module,
            'modulename' => $modulename,
            'id'         => $cm->id,
            'instance'   => $cm->instance,
            'name'       => format_string($cm->name),
            'expected'   => $cm->completionexpected,
            'section'    => $cm->sectionnum,
            'sectionname' => get_section_name($courseid, $cm->sectionnum),
            'position'   => array_search($cm->id, $sections[$cm->sectionnum]),
            'url'        => '', 
            'context'    => $cm->context,
            'icon'       => $cm->get_icon_url(),
            'available'  => $cm->available,
            'completion' => 0,
            'visible'     => $cm->visible,
            'rating'     => 0,
        );
    }
}


// Step 2: get completions
$completions = array();
$completion = new completion_info($COURSE);
// $completion->is_enabled($cm) TODO: We nee to check this
$cm = new stdClass();

foreach ($activities as $activity) {
    $cm->id = $activity['id'];
    $activitycompletion = $completion->get_data($cm, true, $userid);
    $completions[$activity['id']] = $activity;
}


// Step 3: Get scores
$query_activities = array(
    'assign' => "SELECT
                    m.name activity,
                    a.id activity_id,
                    cm.id module_id,
                    cm.section, 
                    (SELECT count(*) FROM {course_modules} cmm JOIN {modules} m ON m.id = cmm.module WHERE m.name = 'assign' AND cmm.course = cm.course AND cmm.section = cm.section) count,
                    a.grade max_score, 
                    ag.grade achieved_score,
                    asub.timemodified  submission_time,
                    ag.timemodified grading_time
                FROM {assign} a
                LEFT JOIN {assign_grades} ag ON a.id = ag.assignment
                LEFT JOIN {assign_submission} asub ON a.id = asub.assignment
                LEFT JOIN {course_modules} cm ON a.id = cm.instance
                LEFT JOIN {modules} m ON m.id = cm.module 
                WHERE 
                    a.course = :courseid AND 
                    ag.userid = :userid AND 
                    asub.status = 'submitted' AND 
                    asub.latest = 1 AND 
                    m.name = 'assign'
                ;",
    'quiz' => "SELECT
                    m.name activity,
                    q.id activity_id,
                    cm.id module_id,
                    cm.section,
                    (select count(*) from {course_modules} cmm JOIN {modules} m ON m.id = cmm.module WHERE m.name = 'quiz' AND cmm.course=cm.course AND cmm.section = cm.section) count,
                    q.grade max_score, 
                    qsub.sumgrades*10 achieved_score,
                    qsub.timemodified  submission_time,
                    qsub.timemodified grading_time
                FROM {quiz} q
                LEFT JOIN {quiz_attempts} qsub ON q.id = qsub.quiz
                LEFT JOIN {course_modules} cm ON q.id = cm.instance
                LEFT JOIN {modules} m ON m.id = cm.module 
                WHERE 
                    q.course = :courseid AND 
                    qsub.userid = :userid AND
                    qsub.state = 'finished' AND
                    m.name = 'quiz'
            ;",
    'longpage' => "SELECT DISTINCT 
                    m.name activity,
                    l.id activity_id,
                    cm.id module_id,
                    cm.section,
                    COUNT(DISTINCT lrp.section) complete,
                    AVG(lrp.sectioncount) count,
                    '0' AS max_score,
                    '0' AS achieved_score,
                    MAX(lrp.timemodified) AS submission_time,
                    '0' AS grading_time
                    FROM {longpage} l
                    JOIN {longpage_reading_progress} lrp ON l.id = lrp.longpageid
                    RIGHT JOIN {course_modules} cm ON l.id = cm.instance
                    RIGHT JOIN {modules} m ON m.id = cm.module 
                    WHERE 
                    l.course = :courseid AND
                    lrp.userid= :userid AND 
                    m.name = 'longpage'
                    Group by m.name, l.id, cm.id, cm.section 
            ;",
    'hypervideo' => "SELECT DISTINCT 
                    m.name activity,
                    h.id activity_id,
                    cm.id module_id,
                    cm.section,
                    SUM(hl.duration) count, 
                    COUNT(DISTINCT hl.values) * 2 complete, -- static parameter - attention
                    '0' AS max_score,
                    '0' AS achieved_score,
                    MAX(hl.timemodified) AS submission_time,
                    '0' AS grading_time
                FROM {hypervideo} h
                JOIN {hypervideo_log} hl ON h.id = hl.hypervideo
                RIGHT JOIN {course_modules} cm ON h.id = cm.instance
                RIGHT JOIN {modules} m ON m.id = cm.module 
                WHERE 
                    h.course = :courseid AND
                    hl.userid = :userid AND 
                    hl.actions = 'playback' AND
                    m.name = 'hypervideo'
                GROUP BY m.name, h.id, cm.id, cm.section
            ;"
);
/*
SELECT distinct
m.name activity,
l.id activity_id,
cm.id module_id,
cm.section,
COUNT(distinct lrp.section) / AVG(lrp.sectioncount) count,
'0' AS max_score,
'0' AS achieved_score,
MAX(lrp.timemodified) AS submission_time,
'0' AS grading_time
FROM mdl_longpage l
JOIN mdl_longpage_reading_progress lrp ON l.id = lrp.longpageid
RIGHT JOIN mdl_course_modules cm ON l.id = cm.instance
RIGHT JOIN mdl_modules m ON m.id = cm.module
WHERE
lrp.userid=2 AND
-- lrp.longpageid=1 AND
m.name = 'longpage'
Group by cm.id




;
;
        */



$params = array('courseid' => $courseid, 'userid' => $userid);
$res = [];
foreach ($query_activities as $moduletype => $query) {
    try {
        $resultset = $DB->get_recordset_sql($query, $params);
        foreach ($resultset as $key => $value) {
            if (!property_exists('value', 'activity')) {
                $res[] = $value;
            }
        }
    } catch (Exception $e) {
        //$res[$moduletype] = [];
        $debug[] = $e;
    }
}
$debug[] = "---resultset----";
$debug[] = $res;


// Step 4: add scores to completion
foreach ($completions as $sec => $activity) {
    foreach ($res as $type => $item) {
        //$debug[] = $item;
        if ($activity['type'] == $item->activity && $activity['instance'] == $item->activity_id) {
            $completions[$sec]['achieved_score'] = $item->achieved_score;
            $completions[$sec]['max_score'] = $item->max_score;
            $completions[$sec]['count'] = $item->count;
            $completions[$sec]['submission_time'] = $item->submission_time;
            $completions[$sec]['name'] = $activity['type'];
            if ($item->complete) {
                $completions[$sec]['complete'] = $item->complete;
            }
            $debug[] = $completions[$sec];
        }
    }
}




#echo json_encode($debug);



echo json_encode($completions);
