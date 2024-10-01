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


class format_serial3_teacher_activity extends external_api
{

    /*
     * Get the lastaccess of all teachers from a course
     **/
    public static function get_last_access_of_teachers_of_course_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }
    public static function get_last_access_of_teachers_of_course_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'success'),
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_last_access_of_teachers_of_course($courseid)
    {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction();
        //getting teachers of course
        $getCourseTeachersQuery = 'SELECT DISTINCT u.id
                    
        FROM mdl_course c
        JOIN mdl_context ct ON c.id = ct.instanceid
        JOIN mdl_role_assignments ra ON ra.contextid = ct.id
        JOIN mdl_user u ON u.id = ra.userid
        JOIN mdl_role r ON r.id = ra.roleid
        
        WHERE r.id IN (1,2,3,4) AND c.id = :courseid';

        //getting id, firstname, lastname and lastacces of teachers in the course
        $query = 'SELECT id, firstname, lastname, lastaccess FROM mdl_user WHERE id IN (' . $getCourseTeachersQuery . ');';
        $params = array('courseid' => $courseid);

        $data = $DB->get_records_sql($query, $params);
        $transaction->allow_commit();

        $arrayAcccess = array();
        foreach ($data as $line) {
            $entry = array(
                'id' => $line->id,
                'firstname' => $line->firstname,
                'lastname' => $line->lastname,
                'lastaccess' => $line->lastaccess,
            );
            array_push($arrayAcccess, $entry);
        }

        return array(
            'success' => true,
            'data' => json_encode($arrayAcccess),
        );
    }
    public static function get_last_access_of_teachers_of_course_is_allowed_from_ajax()
    {
        return true;
    }

    /*
     * Get all teachers of a course
     **/
    public static function get_all_teachers_of_course_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }
    public static function get_all_teachers_of_course_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'success'),
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_all_teachers_of_course($courseid)
    {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction();
        $query = 'SELECT DISTINCT u.id, u.firstname, u.lastname
                    
        FROM mdl_course c
        JOIN mdl_context ct ON c.id = ct.instanceid
        JOIN mdl_role_assignments ra ON ra.contextid = ct.id
        JOIN mdl_user u ON u.id = ra.userid
        JOIN mdl_role r ON r.id = ra.roleid
        
        WHERE r.id IN (1,2,3,4) AND c.id = :courseid;';

        $params = array('courseid' => $courseid);

        $data = $DB->get_records_sql($query, $params);
        $transaction->allow_commit();


        return array(
            'success' => true,
            'data' => json_encode($data),
        );
    }
    public static function get_all_teachers_of_course_is_allowed_from_ajax()
    {
        return true;
    }

    /*
     * Get added or changed resources of a course
     **/
    public static function get_added_or_changed_course_resources_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }
    public static function get_added_or_changed_course_resources_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'success'),
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_added_or_changed_course_resources($courseid)
    {
        global $CFG, $DB, $USER;

        //getting resources of course
        $transaction = $DB->start_delegated_transaction();
        $query = "SELECT f.filename, f.author, f.timecreated, f.timemodified, r.name, r.revision FROM mdl_files f
        INNER JOIN mdl_context ctx ON ctx.id = f.contextid
        inner join mdl_course_modules cm on cm.id = ctx.instanceid 
        inner join mdl_course c on c.id = cm.course 
        inner join mdl_resource r on r.id = cm.instance 
        WHERE c.id = :courseid
        AND f.filename NOT LIKE '.'";

        $params = array('courseid' => $courseid);

        $data = $DB->get_records_sql($query, $params);
        $transaction->allow_commit();

        $resources = array();
        foreach ($data as $line) {
            $entry = array(
                'filename' => $line->filename,
                'author' => $line->author,
                'timecreated' => $line->timecreated,
                'timemodified' => $line->timemodified,
                'name' => $line->name,
                'revision' => $line->revision,
            );
            array_push($resources, $entry);
        }

        return array(
            'success' => true,
            'data' => json_encode($resources),
        );
    }
    public static function get_added_or_changed_course_resources_is_allowed_from_ajax()
    {
        return true;
    }

    /*
     * Get deleted resources of a course
     **/
    public static function get_deleted_course_resources_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }
    public static function get_deleted_course_resources_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'success'),
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_deleted_course_resources($courseid)
    {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction();
        $query = "SELECT f.filename, f.userid, f.author, f.timecreated, f.timemodified, r.name, r.revision FROM mdl_files f
        INNER JOIN mdl_context ctx ON ctx.id = f.contextid
        inner join mdl_course_modules cm on cm.id = ctx.instanceid 
        inner join mdl_course c on c.id = cm.course 
        inner join mdl_resource r on r.id = cm.instance 
        INNER JOIN (
            SELECT *
            FROM mdl_logstore_standard_log
            WHERE ACTION = 'updated' AND target = 'course_module'
        ) l ON l.other LIKE CONCAT('%', r.name, '%')
        WHERE c.id = :courseid
        AND f.filename NOT LIKE '.';";

        $params = array('courseid' => $courseid);

        $data = $DB->get_records_sql($query, $params);
        $transaction->allow_commit();

        $deletedResources = array();
        foreach ($data as $line) {
            $entry = array(
                'filename' => $line->filename,
                'author' => $line->author,
                'timecreated' => $line->timecreated,
                'timemodified' => $line->timemodified,
                'name' => $line->name,
                'revision' => $line->revision,
            );
            array_push($deletedResources, $entry);
        }

        return array(
            'success' => true,
            'data' => json_encode($deletedResources),
        );
    }
    public static function get_deleted_course_resources_is_allowed_from_ajax()
    {
        return true;
    }

    /*
     * Get new forum discussions (since lastaccess -3600 seconds)
     **/
    public static function get_new_forum_discussions_parameters()
    {
        return new external_function_parameters([
            'courseid' => new external_value(PARAM_INT, 'id of course'),
            'userid' => new external_value(PARAM_INT, 'id of user'),

        ]);
    }
    public static function get_new_forum_discussions_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'success'),
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function get_new_forum_discussions($courseid, $userid)
    {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction();
        $query = "SELECT f.name AS forumname, fd.name AS discussionname, fd.timemodified, u.firstname AS teacherfirstname, u.lastname AS teacherlastname FROM mdl_forum_discussions fd 
        JOIN mdl_user AS u ON u.id = fd.userid
        JOIN mdl_forum as f ON f.id = fd.forum
        JOIN mdl_course as c ON c.id = f.course
        JOIN mdl_user_lastaccess as ul ON (c.id = ul.courseid AND ul.userid = :userid)
        WHERE fd.course = :courseid
        AND ul.userid IN (
        SELECT DISTINCT u.id
                            
                FROM mdl_course c
                JOIN mdl_context ct ON c.id = ct.instanceid
                JOIN mdl_role_assignments ra ON ra.contextid = ct.id
                JOIN mdl_user u ON u.id = ra.userid
                JOIN mdl_role r ON r.id = ra.roleid
                
                WHERE r.id IN (1,2,3,4) AND c.id = :courseid2
                  )
        AND fd.timemodified > ul.timeaccess -3600";

        $params = array('courseid' => $courseid, 'userid' => $userid, 'courseid2' => $courseid);

        $data = $DB->get_records_sql($query, $params);
        $transaction->allow_commit();

        $newDiscussions = array();
        foreach ($data as $line) {
            $entry = array(
                'forumname' => $line->forumname,
                'discussionname' => $line->discussionname,
                'timemodified' => $line->timemodified,
                'teacherfirstname' => $line->teacherfirstname,
                'teacherlastname' => $line->teacherlastname,
            );
            array_push($newDiscussions, $entry);
        }

        return array(
            'success' => true,
            'data' => json_encode($newDiscussions),
        );
    }
    public static function get_new_forum_discussions_is_allowed_from_ajax()
    {
        return true;
    }
}
