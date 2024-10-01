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


class format_serial3_survey extends external_api
{


/**
     * Interface to get survey data of the individual user
     */
    public static function get_surveys_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id'),
                'moduleid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function get_surveys($courseid, $moduleid)
    {
        global $DB, $USER;

        $res = $DB->get_record_sql(
            "SELECT qr.submitted 
            FROM {questionnaire_response} qr
            JOIN {course_modules} cm ON qr.questionnaireid = cm.instance
            WHERE
            cm.id=:moduleid AND
            cm.course=:courseid AND
            qr.userid=:userid AND 
            qr.complete='y'",
            [
                "courseid" => (int) $courseid,
                "moduleid" => (int) $moduleid,
                "userid" => (int) $USER->id
            ]
        );

        return array(
            'success' => true,
            'data' => json_encode($res)
        );
    }
    public static function get_surveys_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }
    public static function get_surveys_is_allowed_from_ajax()
    {
        return true;
    }
}