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


class format_serial3_deadlines extends external_api
{

    /**
     * Get calendar data
     */
    public static function get_calendar_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function get_calendar_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_calendar($data)
    {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction();
        $cid = (int) $data;
        $uid = (int) $USER->id;
        $sql = '
            SELECT * FROM ' . $CFG->prefix . 'event
            WHERE (' . $CFG->prefix . 'event.eventtype = \'site\') 
            OR (' . $CFG->prefix . 'event.eventtype = \'user\' AND ' . $CFG->prefix . 'event.userid = ' . $uid . ')
            OR (' . $CFG->prefix . 'event.eventtype = \'group\'
                AND ' . $CFG->prefix . 'event.courseid = ' . $cid . '
                AND ' . $CFG->prefix . 'event.groupid in 
                (SELECT ' . $CFG->prefix . 'groups.id 
                    FROM ' . $CFG->prefix . 'groups
                    INNER JOIN ' . $CFG->prefix . 'groups_members
                    ON ' . $CFG->prefix . 'groups.id = ' . $CFG->prefix . 'groups_members.groupid
                WHERE ' . $CFG->prefix . 'groups_members.userid = ' . $uid . ')
            )
            OR (' . $CFG->prefix . 'event.eventtype = \'course\' AND ' . $CFG->prefix . 'event.courseid = ' . $cid . ')
            OR (' . $CFG->prefix . 'event.eventtype = \'category\' AND ' . $CFG->prefix . 'event.categoryid in
   		        (SELECT ' . $CFG->prefix . 'course_categories.id
                    FROM ' . $CFG->prefix . 'course_categories
                    INNER JOIN ' . $CFG->prefix . 'course
                    ON ' . $CFG->prefix . 'course_categories.id = ' . $CFG->prefix . 'course.category
                WHERE ' . $CFG->prefix . 'course.id = ' . $cid . ')
            )
            ORDER BY ' . $CFG->prefix . 'event.timestart ASC';
        $data = $DB->get_records_sql($sql);
        $transaction->allow_commit();
        return array('data' => json_encode($data));
    }
    public static function get_calendar_is_allowed_from_ajax()
    {
        return true;
    }


    /**
     * Get assignment and quiz deadlines
     */
    public static function get_deadlines_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_deadlines_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_deadlines_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_deadlines($courseid)
    {
        global $DB;

        try {
            $sql = "SELECT a.id, cm.id AS coursemoduleid, a.allowsubmissionsfromdate AS timestart, a.name, a.duedate AS timeclose, 'assignment' AS type
				FROM {assign} a
				JOIN {course_modules} cm ON cm.instance = a.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'assign')
				WHERE a.course = :course AND a.duedate != 0
				UNION
				SELECT q.id, cm.id AS coursemoduleid, q.timeopen AS timestart, q.name, q.timeclose, 'quiz' AS type
				FROM {quiz} q
				JOIN {course_modules} cm ON cm.instance = q.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'quiz')
				WHERE q.course = :courseid AND q.timeclose != 0";

            $params = array('courseid' => $courseid, 'course' => $courseid);
            $data = $DB->get_records_sql($sql, $params);

            return array(
                'success' => true,
                'data' => json_encode($data)
            );
        } catch (Exception $e) {
            error_log("Error fetching deadlines: " . $e->getMessage());
            return null;
        }
    }
}
