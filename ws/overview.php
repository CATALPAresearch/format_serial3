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


class format_serial3_overview extends external_api
{
    /**
     * Reflections
     **/
    public static function reflection_read_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id'),
            )
        );
    }

    public static function reflection_read_is_allowed_from_ajax()
    {
        return true;
    }

    public static function reflection_read_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function reflection_read($data)
    {
        global $DB, $USER;
        $debug = [];
        $userid = (int) $USER->id;
        $courseid = $data;
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql(
            "SELECT * FROM {serial3_reflections} WHERE courseid=:course AND userid=:user ORDER BY timecreated ASC",
            array("course" => (int) $courseid, "user" => (int) $userid)
        );
        $transaction->allow_commit();

        // TODO json_encode($debug)

        return array(
            'success' => true,
            'data' => json_encode($res)
        );
    }


    public static function reflection_create_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'course' => new external_value(PARAM_INT, 'course id'),
                            'section' => new external_value(PARAM_INT, 'section id'),
                            'reflection' => new external_value(PARAM_TEXT, 'reflection text submitted by the learner')
                        )
                    )
            )
        );
    }

    public static function reflection_create_is_allowed_from_ajax()
    {
        return true;
    }

    public static function reflection_create_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function reflection_create($data)
    {
        global $CFG, $DB, $USER, $COURSE;
        $debug = [];
        $userid = (int) $USER->id;
        $date = date_create();

        $r = new stdClass();
        $r->userid = (int) $userid;
        $r->courseid = (int) $data['course'];
        $r->section = $data['section'];
        $r->reflection = $data['reflection'];
        $r->timecreated = date_timestamp_get($date);
        $r->timemodified = date_timestamp_get($date);

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_record("serial3_reflections", $r);
        $transaction->allow_commit();

        return array(
            'success' => true,
            'data' => json_encode($data)
        );
    }
}