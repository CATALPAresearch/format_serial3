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


class format_serial3_dashboard extends external_api
{

/**
     * Obtain plugin name
     */
    public static function name_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array('courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL))
        );
    }

    public static function name_is_allowed_from_ajax()
    {
        return true;
    }

    public static function name_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_TEXT, 'Plugin name')
            )
        );
    }
    public static function name($data)
    {
        return array(
            'data' => 'Serial 3 Format'
        );
    }

   

    


    /*
     * Get logstore data
     **/
    public static function logstore_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function logstore_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data'),
                'user' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function logstore($data)
    {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction();
        $query = 'SELECT * FROM ' . $CFG->prefix . 'logstore_standard_log 
            WHERE userid=' . $USER->id . ' AND 
        ( 
            component=\'mod_glossary\' OR 
            component=\'mod_forum\' OR
            component=\'mod_wiki\' OR
            component=\'mod_studentquiz\' OR
            component=\'mod_assignment\' OR
            component=\'mod_quiz\'
        );';
        $data = $DB->get_records_sql($query);
        $transaction->allow_commit();
        $arr = array();
        foreach ($data as $bu) {
            $entry = array(
                'utc' => $bu->timecreated,
                'action_type' => $bu->component,
                'action' => $bu->action //,
                //'data' => json_encode($bu),
            );
            array_push($arr, $entry);
        }
        // log cleaning

        //
        $user_data = array(
            'username' => $USER->username,
            'firstname' => $USER->firstname,
            'lastname' => $USER->lastname,
            'userid' => $USER->id
        );

        return array('data' => json_encode($arr), 'user' => json_encode($user_data));
    }
    public static function logstore_is_allowed_from_ajax()
    {
        return true;
    }



   

    /**
     * Collects log data from the client
     */
    public static function logger_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'utc' => new external_value(PARAM_INT, 'utc time', VALUE_OPTIONAL),
                            'action' => new external_value(PARAM_TEXT, 'action', VALUE_OPTIONAL),
                            'entry' => new external_value(PARAM_RAW, 'log data', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function logger_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function logger($data)
    {
        global $CFG, $DB, $USER;

        $r = new stdClass();
        $r->name = 'format_serial3';
        $r->component = 'format_serial3';
        $r->eventname = '\format_serial3\event\\' . $data['action'];
        $r->action = $data['action'];
        $r->target = 'course_format';
        $r->objecttable = 'serial3';
        $r->objectid = 0;
        $r->crud = 'r';
        $r->edulevel = 2;
        $r->contextid = 120;
        $r->contextlevel = 70;
        $r->contextinstanceid = 86;
        $r->userid = $USER->id;
        $r->courseid = (int) $data['courseid'];
        //$r->relateduserid=NULL;
        $r->anonymous = 0;
        $r->other = $data['entry'];
        $r->timecreated = $data['utc'];
        $r->origin = 'web';
        $r->ip = $_SERVER['REMOTE_ADDR'];
        //$r->realuserid=NULL;

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_records("logstore_standard_log", array($r));
        $transaction->allow_commit();

        return array(
            'success' => true,
            'data' => json_encode($res)
        );
    }
    public static function logger_is_allowed_from_ajax()
    {
        return true;
    }


    



    


    



    /**
     * Interface to save dashboard layout settings for a user
     */
    public static function save_dashboard_settings_parameters()
    {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'if of user'),
            'course' => new external_value(PARAM_INT, 'id of course'),
            'settings' => new external_value(PARAM_TEXT, 'layout settings', VALUE_OPTIONAL)
        ]);
    }

    public static function save_dashboard_settings_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_TEXT, 'Data output')
            )
        );
    }

    public static function save_dashboard_settings($userid, $course, $settings)
    {
        global $DB;

        $params = [
            'userid' => $userid,
            'course' => $course,
            'settings' => $settings,
        ];

        $record = $DB->get_record('serial3_dashboard_settings', ['userid' => $userid, 'course' => $course]);

        if ($record) {
            $record->settings = $settings;
            $DB->update_record('serial3_dashboard_settings', $record);
        } else {
            $record = new stdClass();
            $record->userid = $userid;
            $record->course = $course;
            $record->settings = $settings;
            $DB->insert_record('serial3_dashboard_settings', $record);
        }

        return array(
            'success' => ($record !== false),
            'data' => json_encode($params)
        );
    }

    public static function save_dashboard_settings_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Interface to get dashboard settings for a user
     */
    public static function get_dashboard_settings_parameters()
    {
        return new external_function_parameters([
            'userid' => new external_value(PARAM_INT, 'user id'),
            'course' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_dashboard_settings_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_dashboard_settings_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_dashboard_settings($userid, $course)
    {
        global $DB;

        $result = $DB->get_record_sql(
            "SELECT settings
            FROM {serial3_dashboard_settings}
            WHERE
            	userid=:userid AND
            	course=:course",
            [
                "course" => (int) $course,
                "userid" => (int) $userid
            ]
        );

        return array(
            'success' => true,
            'data' => json_encode($result),
        );
    }
}