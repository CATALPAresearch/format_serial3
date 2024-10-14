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
        $sql = "SELECT * 
                FROM {event} event
                WHERE 
                    (event.eventtype = 'site') 
                    OR 
                    (event.eventtype = 'user' AND event.userid = :uid1)
                    OR 
                    (event.eventtype = 'group'
                        AND event.courseid = :cid1
                        AND event.groupid IN 
                            (SELECT ggroups.id 
                            FROM {groups} ggroups
                            INNER JOIN m_groups_members groups_members
                            ON ggroups.id = groups_members.groupid
                            WHERE groups_members.userid = :uid2)
                    )
                    OR 
                    (event.eventtype = 'course' AND event.courseid = :cid2)
                    OR 
                    (event.eventtype = 'category' 
                        AND event.categoryid IN
                            (SELECT course_categories.id
                            FROM {course_categories} course_categories
                            INNER JOIN {course} course
                            ON course_categories.id = course.category
                            WHERE course.id = :cid3)
                    )
                ORDER BY event.timestart ASC;
            ;";
        $data = $DB->get_records_sql(
            $sql,
            [
                'cid1' => $cid,
                'cid2' => $cid,
                'cid3' => $cid,
                'uid1' => $uid,
                'uid2' => $uid
            ]
        );
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
            $sql = "SELECT 
                        cm.id AS coursemoduleid, 
                        a.id, 
                        a.allowsubmissionsfromdate AS timestart, 
                        a.name, 
                        a.duedate AS timeclose, 
                        'assignment' AS type
                    FROM {assign} a
                    JOIN {course_modules} cm ON cm.instance = a.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'assign')
                    WHERE a.course = :cid1 AND a.duedate != 0
                    UNION
                    SELECT 
                        cm.id AS coursemoduleid, 
                        q.id, 
                        q.timeopen AS timestart, 
                        q.name, q.timeclose, 
                        'quiz' AS type
                    FROM {quiz} q
                    JOIN {course_modules} cm ON cm.instance = q.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'quiz')
                    WHERE q.course = :cid2 AND q.timeclose != 0
                ;";

            $params = ['cid1' => $courseid, 'cid2' => $courseid];
            $data = $DB->get_records_sql($sql, $params);

            return array(
                'success' => true,
                'data' => json_encode(array_values($data))
            );
        } catch (Exception $e) {
            error_log("Error fetching deadlines: " . $e->getMessage());
            return null;
        }
    }
}
