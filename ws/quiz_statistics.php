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


require_login();


class format_serial3_quiz_statistics extends external_api
{
     /**
     * Interface to fetch all quizzes and assignments
     */
    public static function get_assignments_parameters()
    {
        return new external_function_parameters([
            'course' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_assignments_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_assignments_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_assignments($course)
    {
        global $DB, $USER;

        $userid = $USER->id;

        $sql = "SELECT a.name, a.intro, a.allowsubmissionsfromdate, a.duedate, a.grade as max_grade, g.grade as user_grade, g.attemptnumber, cs.section,
				(SELECT COUNT(*) FROM {assign_submission} WHERE assignment = a.id AND userid = :userid) as user_attempts,
				(SELECT AVG(grade) FROM {assign_grades} WHERE assignment = a.id) as avg_grade,
				(SELECT COUNT(DISTINCT userid) FROM {assign_grades} WHERE assignment = a.id) as num_participants
				FROM {assign} a
				JOIN {assign_grades} g ON g.assignment = a.id
				JOIN {course_modules} cm ON cm.instance = a.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'assign')
				JOIN {course_sections} cs ON cs.id = cm.section
				WHERE a.course = :course AND g.userid = :userid2";

        $params = array('course' => $course, 'userid' => $userid, 'userid2' => $userid);
        $assignments = $DB->get_records_sql($sql, $params);


        return array(
            'success' => true,
            'data' => json_encode($assignments)
        );
    }


    /**
     * Interface to fetch all quizzes
     */
    public static function get_quizzes_parameters()
    {
        return new external_function_parameters([
            'course' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_quizzes_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_quizzes_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_quizzes($course)
    {
        global $DB, $USER;

        $userid = $USER->id;

        $sql = "SELECT q.name, q.intro, q.timeopen, q.timeclose, q.sumgrades, q.grade as max_grade, g.grade as user_grade, cs.section,
            (SELECT AVG(grade) FROM {quiz_grades} WHERE quiz = q.id) as avg_grade,
            (SELECT COUNT(*) FROM {quiz_attempts} WHERE quiz = q.id AND userid = :userid) as user_attempts,
            (SELECT COUNT(DISTINCT userid) FROM {quiz_grades} WHERE quiz = q.id) as num_participants
            FROM {quiz} q
            JOIN {quiz_grades} g ON g.quiz = q.id
            JOIN {course_modules} cm ON cm.instance = q.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'quiz')
            JOIN {course_sections} cs ON cs.id = cm.section
            WHERE q.course = :course AND g.userid = :user";

        $params = array('course' => $course, 'userid' => $userid, 'user' => $userid);
        $quizrecords = $DB->get_records_sql($sql, $params);

        return array(
            'success' => true,
            'data' => json_encode($quizrecords)
        );
    }
}