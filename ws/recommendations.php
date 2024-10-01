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


function get_meta($courseID)
{
    try {
        global $USER, $COURSE;
        $obj = new stdClass();
        $obj->course = new stdClass();
        $obj->course->id = (int) $courseID;
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


class format_serial3_recommendations extends external_api
{
    //set_rule_response
    public static function set_rule_response_parameters()
    {
        return new external_function_parameters([
            'course_id' => new external_value(PARAM_INT, 'course id'),
            'action_id' => new external_value(PARAM_TEXT, 'id of the rule action'),
            'response_type' => new external_value(PARAM_TEXT, 'user response to a rule action'),
            'user_response' => new external_value(PARAM_RAW, 'user response to a rule action'),
        ]);
    }

    public static function set_rule_response_is_allowed_from_ajax()
    {
        return true;
    }
    public static function set_rule_response_returns()
    {
        return new external_single_structure(['success' => new external_value(PARAM_BOOL, 'Success Variable')]);
    }
    public static function set_rule_response($course_id, $action_id, $response_type, $user_response)
    {
        global $DB, $USER;
        $date = new DateTime();
        $record = new stdClass();
        $record->user_id = (int) $USER->id;
        $record->course_id = (int) $course_id;
        $record->action_id = $action_id;
        $record->response_type = $response_type;
        $record->response = $user_response;
        $record->timecreated = $date->getTimestamp();

        //$DB->insert_record('ari_response_rule_action', $record);

        return array(
            'success' => true
        );
    }

    // TODO
     public static function sendmail_parameters()
     {
         return new external_function_parameters(
             array(
                 'courseid' => new external_value(PARAM_INT, 'course id'),
                 'subject' => new external_value(PARAM_TEXT, 'course id'),
                 'text' => new external_value(PARAM_TEXT, 'course id')
             )
         );
     }
 
     public static function sendmail($courseid, $subject, $message)
     {
         global $CFG, $DB, $USER;
         $out = array();
         try {
             if (is_null($courseid) || is_null($subject) || is_null($message)) {
                 throw new Exception("Missing Parameter");
             }
             $meta = get_meta($courseid);
             $out['result'] = email_to_user($USER, $USER, $subject, $message, "", "", "", true);
         } catch (Exception $ex) {
             $out['debug'] = $ex->getMessage();
         }
         return array('data' => json_encode($out));
     }
 
     public static function sendmail_is_allowed_from_ajax()
     {
         return true;
     }
 
     public static function sendmail_returns()
     {
         return new external_single_structure(
             array(
                 'data' => new external_value(PARAM_RAW, 'data')
             )
         );
     }

     // TODO
     public static function notification_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id'),
                'subject' => new external_value(PARAM_TEXT, 'course id'),
                'short' => new external_value(PARAM_TEXT, 'course id'),
                'text' => new external_value(PARAM_TEXT, 'course id')
            )
        );
    }

    public static function notification($courseid, $subject, $short, $text)
    {
        global $CFG, $DB, $USER;
        $out = array();
        try {
            if (is_null($courseid) || is_null($subject) || is_null($text)) {
                throw new Exception("Invalid Parameter");
            }
            $meta = get_meta($courseid);
            $message = new \core\message\message();
            $message->component = 'moodle';
            $message->name = 'instantmessage';
            $message->userfrom = $USER;
            $message->userto = $USER;
            $message->subject = $subject;
            //$message->fullmessage = $text;
            $message->fullmessageformat = FORMAT_MARKDOWN;
            $message->fullmessagehtml = $text;
            $message->smallmessage = $short;
            $message->notification = "0";
            //$message->contexturl = 'http://GalaxyFarFarAway.com';
            //$message->contexturlname = 'Context name';
            //$message->replyto = "random@example.com";
            $message->courseid = $courseid;
            $result = message_send($message);
            $out['result'] = $result;
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($out));
    }

    public static function notification_is_allowed_from_ajax()
    {
        return true;
    }

    public static function notification_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
}