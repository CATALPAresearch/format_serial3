<?php
/**
 *
 * @package    format_serial3
 * @copyright  2024 niels seidel <niels.seidel@fernuni-hagen.de>, CATALPA, FernUniversität Hagen
 * 
 */
 
 
defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . "/filelib.php");
require_once($CFG->libdir . "/externallib.php");
require_once($CFG->dirroot . "/lib/moodlelib.php");
require_once($CFG->dirroot . "/lib/pagelib.php");
require_once($CFG->libdir . "/completionlib.php");

require_login();


class format_serial3_progress_overview extends external_api
{
    /**
     * Interface to obtain all activities completion and progress
     */
    public static function progress_overview_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT,'course id')
            )
        );
    }

    public static function progress_overview_is_allowed_from_ajax()
    {
        return true;
    }

    public static function progress_overview_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function progress_overview($courseid)
    {
        global $CFG, $DB, $USER, $COURSE;
        $userid = $USER->id;
        $activities = array();
        $debug = [];

        // Step 1: obtain all course activities whether they have been viewed/submitted by the students or _not_.
        $modinfo = get_fast_modinfo($courseid, $userid);
        $sections = $modinfo->get_sections();
        foreach ($modinfo->instances as $module => $instances) {
            $module_name = get_string('pluginname', $module);
            foreach ($instances as $index => $cm) {
                $activities[$cm->id] = array(
                    'module_name' => $module_name,
                    'type' => $cm->modname,
                    'module_id' => (int)$cm->id,
                    'instance' => (int)$cm->instance,
                    'name' => $cm->name,
                    'section' => (int)$cm->sectionnum,
                    'sectionname' => get_section_name($courseid, $cm->sectionnum),
                    'position' => array_search($cm->id, $sections[$cm->sectionnum]),
                    'completion' => 0,
                    'visible' => $cm->visible,
                    'available' => $cm->available, // available on course overview page
                    'rating' => 0,
                    'url' => $CFG->wwwroot . "/mod/" . $cm->modname . "/view.php/" .  $cm->id,
                    //'icon' => $cm->get_icon_url(),
                    //'context' => $cm->context,
                    //'expected' => $cm->completionexpected,
                );
            }
        }

        // Step 2: Expand quiz and safran tasks, because on the course page the included tasks are not listed seperately
        $activities_expanded = [];
        foreach ($activities as $activity) {
            if($activity['type'] == "quiz"){
                $params = [
                    "courseid" => $courseid,
                ];
                $query = "SELECT
                        q.id as question_id,
                        q.name as question_title,
                        sq.id as quiz_id,
                        con.instanceid
                    FROM {quiz} sq
                    JOIN {context} con ON con.instanceid = :courseid
                    JOIN {question_categories} qc ON qc.contextid = con.id
                    JOIN {question_bank_entries} qbe ON qc.id = qbe.questioncategoryid
                    JOIN {question_versions} qv ON qv.questionbankentryid = qbe.id
                    JOIN {question} q ON q.id = qv.questionid
                    WHERE q.parent = 0
                    ";
                $items = $DB->get_records_sql($query, $params);
                foreach($items as $item){
                    $activity['name'] = $item->question_title;
                    $activity['url'] = $CFG->wwwroot . "/mod/quiz/view.php/" . $activity['module_id'];// . "/task/" . $item->safran_question_id;
                    $activities_expanded[] = $activity;
                }
            } elseif($activity['type'] == "safran"){
                $params = [
                    "courseid" => $courseid
                ];
                $query = "SELECT 
                    sq.id as safran_question_id, 
                    s.id as quiz_id, 
                    sq.question_title
                FROM {safran} s
                JOIN {safran_question} sq ON sq.safranid = s.id
                WHERE s.course = :courseid
                ";
                $items = $DB->get_records_sql($query, $params);
                foreach($items as $item){
                    $activity['name'] = $item->question_title;
                    $activity['url'] = $CFG->wwwroot . "/mod/safran/view.php/" . $activity['module_id'] . "/task/" . $item->safran_question_id;
                    $activities_expanded[] = $activity;
                }
            }else{
                $activities_expanded[] = $activity;
            }
        }
        $activities = $activities_expanded;

        // Step 3: get completions using the Completion API
        $completions = [];
        $completion = new completion_info(get_course($courseid));
        foreach ($activities as $activity) {
            $cm = get_coursemodule_from_id(null, $activity['module_id'], $courseid, false, MUST_EXIST);
            $activity['completion'] = $completion->is_enabled($cm) ? (int)$cm->completion : -1;
            $completions[] = $activity;
        }
        $activities = $completions;


        // Step 4: Get scores
        $query_activities = array(
            'assign' => "SELECT
                    m.name module_name,
                    cm.id module_id,
                    a.id instance_id,
                    -- cm.section, 
                    -- cs.name as sectionname,
                    (SELECT count(*) FROM {course_modules} cmm JOIN {modules} m ON m.id = cmm.module WHERE m.name = 'assign' AND cmm.course = cm.course AND cmm.section = cm.section) count,
                    a.grade max_score, 
                    ag.grade achieved_score,
                    asub.timemodified  submission_time,
                    ag.timemodified grading_time
                FROM {assign} a
                LEFT JOIN {assign_grades} ag ON a.id = ag.assignment
                LEFT JOIN {assign_submission} asub ON a.id = asub.assignment
                LEFT JOIN {course_modules} cm ON a.id = cm.instance
                LEFT JOIN {course_sections} cs ON cs.section = cm.section
                LEFT JOIN {modules} m ON m.id = cm.module 
                WHERE 
                    a.course = :courseid AND 
                    cs.course = :courseid2 AND
                    ag.userid = :userid AND 
                    asub.status = 'submitted' AND 
                    asub.latest = 1 AND 
                    m.name = 'assign'
                ;",
        // TODO: get results per quiz tasks
        'quiz' => "SELECT
                m.name module_name,
                cm.id module_id,
                q.id instance_id,
                q.name name,
                -- cm.section,
                -- cs.name sectionname,
                -- 0 position,
                -- 0 complete,
                -- cm.visible,
                -- 0 rating,
                (select count(*) from {course_modules} cmm JOIN {modules} m ON m.id = cmm.module WHERE m.name = 'quiz' AND cmm.course=cm.course AND cmm.section = cm.section) count,
                q.grade max_score,
                qsub.sumgrades*10 achieved_score,
                qsub.timemodified  submission_time,
                qsub.timemodified grading_time
            FROM {quiz} q
            LEFT JOIN {quiz_attempts} qsub ON q.id = qsub.quiz
            LEFT JOIN {course_modules} cm ON q.id = cm.instance
            LEFT JOIN {course_sections} cs ON cs.section = cm.section
            LEFT JOIN {modules} m ON m.id = cm.module 
            WHERE
                q.course = :courseid AND 
                cs.course = :courseid2 AND
                qsub.userid = :userid AND
                qsub.state = 'finished' AND
                m.name = 'quiz'
                ;",
        'safran' => "SELECT
                m.name module_name,
                cm.id module_id,
                s.id instance_id,
                sq.id as safran_question_id, 
                sq.question_title
            FROM {safran} s
            JOIN {safran_question sq ON sq.safranid = s.id
            JOIN {safran_q_attempt} sa ON sa.questionid = s.id
            LEFT JOIN {course_modules} cm ON s.id = cm.instance
            LEFT JOIN {course_sections} cs ON cs.section = cm.section
            LEFT JOIN {modules} m ON m.id = cm.module
            WHERE 
                s.course = 2 AND
                sa.userid = 2 AND
                m.name = 'safran'
                ;",
        'longpage' => "SELECT DISTINCT 
                m.name module_name,
                cm.id module_id,
                l.id instance_id,
                l.name name,
                -- cm.section,
                -- cs.name sectionname,
                -- 0 position,
                -- 0 complete,
                -- cm.visible,
                -- 0 rating
            FROM m_longpage l
            JOIN m_longpage_reading_progress lrp ON l.id = lrp.longpageid
            RIGHT JOIN m_course_modules cm ON l.id = cm.instance
            JOIN m_course_sections cs ON cs.section = cm.section
            RIGHT JOIN m_modules m ON m.id = cm.module 
            WHERE 
                l.course = :courseid AND
                cs.course = :courseid2 AND
                lrp.userid= :userid AND 
                m.name = 'longpage'
                ;",
        'hypervideo' => "SELECT DISTINCT 
                m.name module_name,
                cm.id module_id,
                h.id instance_id,
                -- cm.section,
                -- cs.name AS sectionname,
                SUM(hl.duration) count, 
                COUNT(DISTINCT hl.values) * 2 complete, -- static parameter - attention
                0 AS max_score,
                0 AS achieved_score,
                MAX(hl.timemodified) AS submission_time,
                '0' AS grading_time
            FROM {hypervideo} h
            JOIN {hypervideo_log} hl ON h.id = hl.hypervideo
            RIGHT JOIN {course_modules} cm ON h.id = cm.instance
            JOIN {course_sections} cs ON cs.section = cm.section
            RIGHT JOIN {modules} m ON m.id = cm.module 
            WHERE 
                h.course = :courseid AND
                cs.course = :courseid2 AND
                hl.userid = :userid AND 
                hl.actions = 'playback' AND
                m.name = 'hypervideo'
            GROUP BY m.name, h.id, cm.id, cm.section
                ;"
        );

        // execute queries to get the scores
        $scores = [];
        $params = array('courseid' => $courseid, 'courseid2' => $courseid, 'userid' => $userid);
        foreach ($query_activities as $moduletype => $query) {
            try {
                $resultset = $DB->get_recordset_sql($query, $params);
                foreach ($resultset as $key => $value) {
                    if (!property_exists('value', 'activity') && $value->module_id != null) {
                        $scores[$value->module_id] = (array)$value;
                    }
                }
            } catch (Exception $e) {
                $debug[] = $e;
            }
        }
        
        
        // add scores to the activities
        $activities_score = [];
        foreach($activities as $activity){
            if(isset($scores[$activity['module_id']])){
                $activity['count'] = (int)$scores[$activity['module_id']]['count'];
                $activity['achieved_score'] = (double)$scores[$activity['module_id']]['achieved_score'];
                $activity['max_score'] = (double)$scores[$activity['module_id']]['max_score'];
                $activity['submission_time'] = (int)$scores[$activity['module_id']]['submission_time'];
                $activity['grading_time'] = (int)$scores[$activity['module_id']]['grading_time'];
            }else {
                $activity['count'] = 0;
                $activity['achieved_score'] = 0.0;
                $activity['max_score'] = 0.0;
                $activity['submission_time'] = 0;
                $activity['grading_time'] = 0;
            }
            $activities_score[] = $activity;
        }
        $activities = $activities_score;

        /* Data structure of the output 
        "5706": {
          "type": "assign",
          "module_name": "Aufgabe",
          "module_id": "5706",
          "instance": "625",
          "name": "Praktische Aufgabe: Traceroute und ping",
          "position": 2,
          "url": "https://aple.fernuni-hagen.de/mod/assign/view.php?id=5706",
          "completion": 0,
          "visible": "1",
        }
        */

        return array(
            'success' => true,
            'data' => json_encode(
                array(
                    'debug' => json_encode($debug),
                    'completions' => json_encode($activities)
                )
            )
        );
    }
}
