<?php

defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . '/externallib.php');

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

class format_ladtopics_external extends external_api
{
    // Analytics

    public static function analytics_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function analytics($courseid)
    {
        $out = array();
        try {
            global $USER, $CFG, $DB;
            $permission = new format_ladtopics\permission\course((int)$USER->id, $courseid);
            if (!$permission->isAnyKindOfModerator()) throw new Exception("No permission");
            $context = $permission->getCourseContext();
            $enrollments = get_enrolled_users($context);
            $users = array();
            foreach ($enrollments as $user) {
                try {
                    $u = new stdClass();
                    // Get the personal informations
                    $u->id = $user->id;
                    /*$u->firstname = ucfirst(strtolower($user->firstname));
                    $u->lastname = ucfirst(strtolower($user->lastname));
                    $u->username = $user->username;
                    $u->email = strtolower($user->email);
                    $u->lang = $user->lang;
                    $u->deleted = $user->deleted;
                    $u->suspended = $user->suspended;*/
                    $u->firstaccess = $user->firstaccess;
                    $u->lastaccess = $user->lastaccess;
                    // Get milestones from the person

                    $sql = 'SELECT t.milestones, t.settings, t.timemodified 
                            FROM ' . $CFG->prefix . 'ladtopics_milestones AS t
                            WHERE   
                                t.course = ' . (int)$courseid . ' 
                                AND t.userid = ' . (int)$user->id . '
                            ORDER BY t.timemodified DESC
                            LIMIT 1';
                    $ms = $DB->get_record_sql($sql);
                    if ($ms !== false && is_object($ms)) {
                        $u->milestones = new stdClass();
                        $mse = json_decode($ms->milestones);
                        if (!is_array($mse) || is_null($mse)) {
                            $u->milestones->modified = date();
                            $u->milestones->elements = array();
                            $u->milestones->count = 0;
                        } else {
                            $u->milestones->modified = $ms->timemodified;
                            $u->milestones->elements = $mse;
                            $u->milestones->count = count($u->milestones->elements);
                        }
                    } else {
                        $u->milestones->modified = time();
                        $u->milestones->count = 0;
                        $u->milestones->elements = array();
                    }


                    // Get the planing
                    // Preferences

                    $surveyDone = $DB->get_record("user_preferences", array(
                        'name' => 'ladtopics_survey_done-course-' . (int)$courseid,
                        'userid' => (int)$user->id
                    ));
                    $surveyData = $DB->get_record("user_preferences", array(
                        'name' => 'ladtopics_survey_results-course-' . (int)$courseid,
                        'userid' => (int)$user->id
                    ));
                    if ($surveyDone !== false && is_object($surveyData) && isset($surveyData->value)) {
                        $data = json_decode($surveyData->value);
                        if ($data === null) {
                            $u->initialSurvey = new stdClass();
                            $u->initialSurvey->planingStyle = 'unknown';
                            $u->initialSurvey->objectives = 'f1d';
                            $u->initialSurvey->availableTime = -1;
                        } else {
                            $u->initialSurvey = $data;
                        }
                    } else {
                        $u->initialSurvey = new stdClass();
                        $u->initialSurvey->planingStyle = 'unknown';
                        $u->initialSurvey->objectives = 'f1d';
                        $u->initialSurvey->availableTime = -1;
                    }

                    // Get the lime survey data

                    $sql = 'SELECT a.id, a.name, a.survey_id, s.complete_date, s.submission_id
                     FROM ' . $CFG->prefix . 'limesurvey_submissions AS s
                     INNER JOIN ' . $CFG->prefix . 'limesurvey_assigns AS a
                     ON s.survey_id = a.survey_id 
                        AND a.course_id = ? 
                     LIMIT 1';
                    $lime = $DB->get_records_sql($sql, array((int)$courseid));
                    if (is_array($lime) && count($lime) > 0) {
                        $u->lime = $lime;
                    } else {
                        $u->lime = array();
                    }


                    // Add user to the array
                    $users[] = $u;
                } catch (Exception $uex) {
                    continue;
                }
            }
            $out['users'] = $users;
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($users));
    }

    public static function analytics_is_allowed_from_ajax()
    {
        return true;
    }

    public static function analytics_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }

    // End Analytics

    public static function limesurvey_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function limesurvey($courseid)
    {
        global $CFG, $DB, $USER;
        $out = array();
        try {
            $perm = new format_ladtopics\permission\course($USER->id, $courseid);
            if ($perm->isAnyKindOfModerator()) return array('data' => json_encode($out));

            $out['warnSurvey'] = false;
            $records = $DB->get_records_sql('SELECT * FROM ' . $CFG->prefix . 'limesurvey_assigns WHERE course_id = ?', array($courseid));
            foreach ($records as $record) {

                if (isset($record->startdate) && is_int(+$record->startdate) && !is_null($record->startdate)) {
                    if (time() < $record->startdate) {
                        continue;
                    }
                }

                if (isset($record->stopdate) && is_int(+$record->stopdate) && !is_null($record->stopdate)) {
                    if (time() > $record->stopdate) {
                        continue;
                    };
                }

                if ($DB->record_exists_sql('SELECT * FROM ' . $CFG->prefix . 'limesurvey_submissions WHERE user_id = ? AND survey_id = ?', array($USER->id, $record->survey_id)) === false) {
                    $out['warnSurvey'] = true;

                    if (isset($record->warndate) && is_int(+$record->warndate) && !is_null($record->warndate)) {
                        $warn = $record->warndate;
                        if (isset($out['warnDate'])) {
                            if ($warn < $out['warnDate']) {
                                $out['warnDate'] = $warn;
                            }
                        } else {
                            $out['warnDate'] = $warn;
                        }
                    }

                    //$url = new moodle_url('/course/format/ladtopics/survey.php', array('c' => $courseid));
                    //$out['link'] = $url->__toString();
                }
            }
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($out));
    }

    public static function limesurvey_is_allowed_from_ajax()
    {
        return true;
    }

    public static function limesurvey_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }


    public static function statistics_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function statistics($courseid)
    {
        global $CFG, $DB;
        $out = array();
        try {
            if (is_null($courseid)) {
                throw new Exception("No course specified");
            }
            $context = get_meta($courseid);
            if ($context->user->loggedin === false || ($context->user->manager === false && $context->user->siteadmin === false && $context->user->coursecreator === false)) {
                throw new Exception("No Admin");
            }
            $users = get_enrolled_users($context->course->context);
            $num_users = count_enrolled_users($context->course->context);
            $out['users'] = array();
            $out['num_survey'] = 0;
            foreach ($users as $user) {
                $uo = new stdClass();
                $uo->firstaccess = $user->firstaccess;
                $uo->lastaccess = $user->lastaccess;
                $uo->lastlogin = $user->lastlogin;
                $uo->isEnrolled = is_enrolled($context->course->context, $user->id);
                $uo->currentLogin = $user->currentlogin;
                $uo->firstname = $user->firstname;
                $uo->lastname = $user->lastname;
                $uo->email = $user->email;
                // milesones
                $transaction = $DB->start_delegated_transaction();
                $sql = '
                    SELECT t.milestones, t.settings, t.timemodified 
                    FROM ' . $CFG->prefix . 'ladtopics_milestones AS t
                    WHERE   
                        t.course = ' . (int)$courseid . ' 
                        AND t.userid = ' . (int)$user->id . '
                    ORDER BY t.timemodified DESC
                    LIMIT 1
                    ;';
                $uo->milestones = $DB->get_record_sql($sql);
                $transaction->allow_commit();
                // numbers
                $transaction = $DB->start_delegated_transaction();
                $sql = '
                    SELECT t.timemodified 
                    FROM ' . $CFG->prefix . 'ladtopics_milestones AS t
                    WHERE   
                        t.course = ' . (int)$courseid . ' 
                        AND t.userid = ' . (int)$user->id . '
                    ORDER BY t.timemodified DESC                 
                    ;';
                $uo->milestonesChanged = $DB->get_records_sql($sql);
                $transaction->allow_commit();
                // preferences
                $transaction = $DB->start_delegated_transaction();
                $resSD = $DB->get_record("user_preferences", array(
                    'name' => 'ladtopics_survey_done-course-' . (int)$courseid,
                    'userid' => (int)$user->id
                ));
                $transaction->allow_commit();
                $uo->surveyDone = $resSD;
                $transaction = $DB->start_delegated_transaction();
                $res = $DB->get_record("user_preferences", array(
                    'name' => 'ladtopics_survey_results-course-' . (int)$courseid,
                    'userid' => (int)$user->id
                ));
                $transaction->allow_commit();
                $uo->survey = $res;
                $out['users'][] = $uo;
                if (!is_bool($resSD) && !is_bool($res)) {
                    $out['num_survey']++;
                }
                //$out[] = $user;
            }
            $out['num_users'] = $num_users;
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($out));
    }

    public static function statistics_is_allowed_from_ajax()
    {
        return true;
    }

    public static function statistics_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }

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

    // sss

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

    public static function getalluser_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function getalluser($param)
    {
        $out = array();
        try {
            if (is_null($param)) {
                throw new Exception("No courseid");
            }
            $context = get_meta((int)$param);
            if ($context->user->loggedin === false || ($context->user->manager === false && $context->user->siteadmin === false && $context->user->coursecreator === false)) {
                throw new Exception("No Admin");
            }
            $enrolled = get_enrolled_users($context->course->context);
            $array = array();
            foreach ($enrolled as $key => $value) {
                if (!isset($value->id)) {
                    continue;
                }
                $user = new stdClass();
                $user->id = $value->id;
                if ($user->id === $context->user->id) {
                    $user->self = true;
                } else {
                    $user->self = false;
                }
                if (isset($value->username) && strlen($value->username) > 0) {
                    $username = ucfirst(strtolower($value->username));
                    $user->username = $username;
                    // Admin; marc.burchart@tu
                }
                if (isset($value->lastname) && strlen($value->lastname) > 0) {
                    $name = ucfirst(strtolower($value->lastname));
                    if (isset($value->middlename) && strlen($value->middlename) > 0) {
                        $name = ucfirst(strtolower($value->middlename)) . " " . $name;
                    }
                    if (isset($value->firstname) && strlen($value->firstname) > 0) {
                        $name = ucfirst(strtolower($value->firstname)) . " " . $name;
                    }
                    $user->name = $name;
                }
                if (isset($value->email) && strlen($value->email) > 0) {
                    $email = strtolower($value->email);
                    $user->email = $email;
                }
                $array[] = $user;
            }
            $out['user'] = $array;
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($out, JSON_PARTIAL_OUTPUT_ON_ERROR));
    }

    public static function getalluser_is_allowed_from_ajax()
    {
        return true;
    }

    public static function getalluser_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }


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
            'data' => 'LAD Topics Format'
        );
    }

    /**
     * Update user
     */
    public static function updateuser_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'data' => new external_value(PARAM_RAW, 'id of course')
            )
        );
    }

    public static function updateuser($data)
    {
        global $CFG, $DB, $USER;
        $out = array();
        try {
            if (is_null($data)) {
                throw new Exception("Keine Daten erhalten.");
            }
            $data = json_decode($data);
            if (!is_int($data->courseid)) {
                throw new Exception("Keine Kurse-ID");
            }
            $userid = $meta->user->id;
            $meta = get_meta($data->courseid);
            if (is_null($meta)) {
                throw new Exception("Keine Meta-Daten erhalten");
            }
            if ($meta->user->loggedin === true && ($meta->user->manager === true || $meta->user->siteadmin === true || $meta->user->coursecreator === true)) {
                if (is_int($data->userid)) {
                    $userid = $data->userid;
                }
            }
            $out['data'] = $data;
            if (!is_null($data->milestones)) {
                $date = new DateTime();
                $r = new stdClass();
                $r->userid = (int)$userid;
                $r->course = (int)$data->courseid;
                $r->milestones = $data->milestones;
                $r->settings = [];
                $r->timemodified = (int)$date->getTimestamp();
                $transaction = $DB->start_delegated_transaction();
                $res = $DB->insert_record("ladtopics_milestones", $r);
                $transaction->allow_commit();
                $out['milestones'] = $data->milestones;
            }
            if (!is_null($data->plan)) {
                function func($field, $courseid, $userid, $value)
                {
                    global $CFG, $DB, $USER;
                    $r = new stdClass();
                    $r->userid = $userid;
                    $r->name = $field . '-course-' . (int)$courseid;
                    $exists = $DB->record_exists('user_preferences', array(
                        'name' => $field . '-course-' . (int)$courseid,
                        'userid' => $userid
                    ));
                    $res = 'nix';
                    if ($exists != true) {
                        $r->value = $value == null ? 0 : $value;
                        $transaction = $DB->start_delegated_transaction();
                        $res = $DB->insert_records("user_preferences", array($r));
                        $transaction->allow_commit();
                    } elseif ($exists == true) {
                        $transaction = $DB->start_delegated_transaction();
                        $res = $DB->set_field("user_preferences", 'value', $value, array(
                            'userid' => $userid,
                            'name' => $field . '-course-' . $courseid
                        ));
                        $transaction->allow_commit();
                    }
                }
                func("ladtopics_survey_results", (int)$data->courseid, (int)$userid, $data->plan);
                func("ladtopics_survey_done", (int)$data->courseid, (int)$userid, 0);
            }
        } catch (Exception $ex) {
            $out['debug'] = $ex->getMessage();
        }
        return array('data' => json_encode($out));
    }

    public static function updateuser_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }

    public static function updateuser_is_allowed_from_ajax()
    {
        return true;
    }


    /**
     * Get calendar data
     */

    public static function getcalendar_parameters()
    {
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function getcalendar_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function getcalendar($data)
    {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction();
        $cid = (int)$data;
        $uid = (int)$USER->id;
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
    public static function getcalendar_is_allowed_from_ajax()
    {
        return true;
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
            'firstname' =>  $USER->firstname,
            'lastname' =>  $USER->lastname,
            'userid' =>  $USER->id
        );

        return array('data' => json_encode($arr), 'user' => json_encode($user_data));
    }
    public static function logstore_is_allowed_from_ajax()
    {
        return true;
    }


    /*
     * Get course structure
     **/


    /*
  public static function logger_parameters() {
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
    */

    public static function coursestructure_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id'),
                'select' =>
                    new external_single_structure(
                        array(
                            'modules' => new external_value(PARAM_RAW, 'modules'),
                            'sectionid' => new external_value(PARAM_INT, 'section id', VALUE_OPTIONAL),
                            'moduleid' => new external_value(PARAM_INT, 'module id', VALUE_OPTIONAL)
                        ),
                        'select special items'
                    )
            )
        );
    }

    public static function coursestructure_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data'),
                'debug' => new external_value(PARAM_RAW, 'debug')
                //,'user' => new external_value(PARAM_RAW, 'data')
            )
        );
    }


    public static function coursestructure($courseid, $select)
    {
        global $CFG, $DB, $USER;

        $out_data = array();
        $out_debug = array();

        // all allowed modules
        $allowed_modules = array(
            "assign", "data", "hvp", "checklist",
            "url", "studentquiz", "page", "feedback", "forum", "resource", "wiki",
            "glossary", "quiz", "usenet", "book", "usenet"
        ); // TODO: This should be part of the course settings

        if (is_array($select)) {
            $addToQuery = "";
            $modules = json_decode($select["modules"]);
            foreach ($modules as $value) {
                if (in_array($value, $allowed_modules)) {
                    $activityId = 0;
                    $params = array();
                    $params[] = (int)$courseid;
                    $params[] = (int)$courseid;
                    $params[] = (int)$courseid;
                    $params[] = $value;
                    $query = '
                        SELECT 
                        cm.instance AS instance_id,     
                        m.name AS instance_type, 
                        m.visible AS instance_visible,
                        f.name AS instance_title,                        
                        cm.id AS instance_url_id,
                        cm.visible AS cm_visibility,
                        cm.course AS course_id, 
                        cm.module AS module_id, 
                        cm.section AS section_id, 
                        cs.name AS section_name,
                        cs.sequence AS section_sequence,
                        cs.section AS section_pos
                        FROM ' . $CFG->prefix . 'course_modules AS cm
                        JOIN ' . $CFG->prefix . 'modules AS m 
                        ON m.id = cm.module
                        JOIN ' . $CFG->prefix . 'course_sections AS cs 
                        ON cs.id = cm.section
                        RIGHT OUTER JOIN ' . $CFG->prefix . $value . ' AS f
                        ON cm.instance = f.id 
                        WHERE cm.course = ? AND cs.course = ? AND f.course = ? AND m.name = ?
                    ';
                    if (isset($select["sectionid"]) && !is_null($select["sectionid"])) {
                        $query .= ' AND cs.id = ?';
                        $params[] = (int)$select["sectionid"];
                    }
                    if (isset($select["moduleid"]) && !is_null($select["moduleid"])) {
                        $query .= ' AND cm.id = ?';
                        $params[] = (int)$select["moduleid"];
                    }
                    $transaction = $DB->start_delegated_transaction();
                    $res = $DB->get_records_sql($query, $params);
                    $transaction->allow_commit();
                    foreach ($res as $entry) {
                        if (!$entry->cm_visibility) continue;
                        $pos = -1;
                        // I am not sure whether sizeof() and count() have the same results, but in php 7.2 sizeof() requires an array.
                        if (gettype($entry->section_sequence) === "string" && sizeof($entry->section_sequence) > 0) {
                            $sequence = explode(",", preg_replace("/[^0-9,]/", "", $entry->section_sequence));
                            $pos = array_search(strval($entry->instance_url_id), $sequence);
                        }
                        $activityId++;

                        $out = array(
                            'id' =>  $entry->instance_id + 100000 * $entry->module_id, // simple hash to make unique IDs
                            'course_id' => $entry->course_id,
                            'module_id' => $entry->module_id,
                            'section_id' => $entry->section_id,
                            'section_name' => $entry->section_name,
                            'instance_id' => $entry->instance_id,
                            'instance_url_id' => $entry->instance_url_id,
                            'instance_type' => $entry->instance_type,
                            'instance_title' => $entry->instance_title,
                            'section' => $entry->section_id,
                            'name' => $entry->instance_title,
                            'pos_module' => $pos,
                            'pos_section' => $entry->section_pos
                        );
                        array_push($out_data, $out);
                    }
                }
            }
        }
        return array('data' => json_encode($out_data), 'debug' => json_encode($out_debug));
    }

    public static function coursestructure_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Collects log data from the client
     */
    public static function logger_parameters() {
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
        $r->name = 'format_ladtopics';
        $r->component = 'format_ladtopics';
        $r->eventname = '\format_ladtopics\event\\' . $data['action'];
        $r->action = $data['action'];
        $r->target = 'course_format';
        $r->objecttable = 'ladtopics';
        $r->objectid = 0;
        $r->crud = 'r';
        $r->edulevel = 2;
        $r->contextid = 120;
        $r->contextlevel = 70;
        $r->contextinstanceid = 86;
        $r->userid = $USER->id;
        $r->courseid = (int)$data['courseid'];
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
     * get current goal
     */
    public static function get_goal_parameters() {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function get_goal($course)
    {
        global $DB, $USER;

        $res = $DB->get_record_sql(
            "SELECT other
            FROM {logstore_standard_log}
            WHERE 
            component = 'format_ladtopics' AND
            action = 'change_goal' AND
            courseid = :courseid AND
            userid = :userid
            ORDER BY timecreated desc
            LIMIT 1
            ;",
            [
                'courseid' => $course['courseid'],
                'userid' => $USER->id
            ]);

        return array(
            'success' => true,
            'data' => json_encode($res->other)
        );
    }
    public static function get_goal_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function get_goal_is_allowed_from_ajax()
    {
        return true;
    }



    /**
     * Dump log data from the client
     */
    public static function dumplog_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'userid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function dumplog_returns()
    {
        return new external_single_structure(
            array('response' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }
    public static function dumplog($data)
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


        return array('response' => json_encode($arr));
    }
    public static function dumplog_is_allowed_from_ajax()
    {
        return true;
    }




    /**
     * Get milestones of a user
     */

    public static function getmilestones_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL)
                            //'userid' => new external_value(PARAM_INT, 'utc time', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function getmilestones_returns()
    {
        return new external_single_structure(
            array('milestones' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }
    public static function getmilestones($data)
    {
        global $CFG, $DB, $USER;
        (int)$data['userid'] = $USER->id;
        $transaction = $DB->start_delegated_transaction();
        $sql = '
            SELECT t.milestones, t.settings, t.timemodified 
            FROM ' . $CFG->prefix . 'ladtopics_milestones AS t
            WHERE   
                t.course = ' . $data['courseid'] . ' 
                AND t.userid = ' . (int)$data['userid'] . '
            ORDER BY t.timemodified DESC
            LIMIT 1
            ;';
        $res = $DB->get_record_sql($sql);
        $transaction->allow_commit();

        return array('milestones' => json_encode(array(
            'settings' => $res->settings,
            'milestones' => $res->milestones,
            'utc' => $res->timemodified
        )));
    }
    public static function getmilestones_is_allowed_from_ajax()
    {
        return true;
    }



    /**
     * Set milestones of a user
     */
    public static function setmilestones_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            //'userid' => new external_value(PARAM_INT, 'user id', VALUE_OPTIONAL),
                            'milestones' => new external_value(PARAM_RAW, 'milestones', VALUE_OPTIONAL),
                            'settings' => new external_value(PARAM_RAW, 'settings', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function setmilestones_returns()
    {
        return new external_single_structure(
            array('response' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }

    public static function setmilestones($data)
    {
        global $CFG, $DB, $USER;

        $date = new DateTime();
        $data['userid'] = (int)$USER->id;

        $r = new stdClass();
        $r->userid = (int)$data['userid'];
        $r->course = (int)$data['courseid'];
        $r->milestones = $data['milestones'];
        $r->settings = $data['settings'];
        $r->timemodified = (int)$date->getTimestamp();

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_records("ladtopics_milestones", array($r));
        $sql = '
            INSERT INTO ' . $CFG->prefix . 'ladtopics_milestones (user,course,milestones,settings,timemodified) 
            VALUES (' . (int)$data['userid'] . ',' . (int)$data['courseid'] . ',\'' . $data['milestones'] . '\',\'' . $data['settings'] . '\',' . (int)$date->getTimestamp() . ')
            ;';
        //$res = $DB->execute($sql);
        $transaction->allow_commit();

        return array('response' => json_encode(array($res, $data)));
    }
    public static function setmilestones_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Get Milestone Plan
     */
    public static function getmilestoneplan_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'plan' => new external_value(PARAM_TEXT, 'the desired plan')
                        )
                    )
            )
        );
    }
    public static function getmilestoneplan_returns()
    {
        return new external_single_structure(
            array('data' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }

    public static function getmilestoneplan($param)
    {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction();
        $params = array();
        $params[] = (int)$param['courseid'];
        $params[] = $param['plan'];
        $sql = '
            SELECT milestones 
            FROM ' . $CFG->prefix . 'ladtopics_milestone_plans AS t
            WHERE   
                t.course = ? 
                AND t.plan = ?
            ORDER BY t.created DESC
            LIMIT 1
            ;';
        $res = $DB->get_record_sql($sql, $params);
        $transaction->allow_commit();
        if (isset($res->milestones)) {
            return array('data' => $res->milestones);
        } else {
            return array('data' => []);
        }
    }
    public static function getmilestoneplan_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Get Milestone Plan
     */

    public static function setmilestoneplan_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course'),
                            'milestones' => new external_value(PARAM_RAW, 'milestones'),
                            'plan' => new external_value(PARAM_TEXT, 'plan')
                        )
                    )
            )
        );
    }
    public static function setmilestoneplan_returns()
    {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
            )
        );
    }

    public static function setmilestoneplan($param)
    {
        try {
            global $CFG, $DB;
            $data = array();
            $meta = get_meta($param["courseid"]);
            if (is_null($meta)) {
                throw new Exception("No meta data received.");
            }
            if ($meta->user->loggedin === true && ($meta->user->manager === true || $meta->user->coursecreator === true || $meta->user->siteadmin === true)) {
                $date = new DateTime();
                $c = new stdClass();
                $c->course = (int)$meta->course->id;
                $c->author = (int)$meta->user->id;
                $c->created = (int)$date->getTimestamp();
                $c->plan = $param['plan'];
                $c->milestones = $param['milestones'];
                $sql = 'SELECT id FROM ' . $CFG->prefix . 'ladtopics_milestone_plans WHERE course = ? AND plan = ? LIMIT 1';
                $transaction = $DB->start_delegated_transaction();
                $params = array();
                $params[] = (int)$meta->course->id;
                $params[] = strtolower($param['plan']);
                $res = $DB->get_records_sql($sql, $params);
                $transaction->allow_commit();
                $count = count($res);
                if ($count !== 0) {
                    $id = reset($res);
                    $c->id = $id->id;
                    $transaction = $DB->start_delegated_transaction();
                    $res = $DB->update_record("ladtopics_milestone_plans", $c);
                    $transaction->allow_commit();
                    if ($res === true) {
                        $data['success'] = true;
                    } else {
                        $data['success'] = false;
                        $data['debug'] = "Unknown error.";
                    }
                } else {
                    $transaction = $DB->start_delegated_transaction();
                    $res = $DB->insert_records("ladtopics_milestone_plans", array($c));
                    $transaction->allow_commit();
                    $data['success'] = true;
                }
            } else {
                $data['success'] = false;
                $data['debug'] = "Keine Berechtigung";
            }
            return array('data' => json_encode($data));
        } catch (Exception $e) {
            return array('data' => json_encode(array('success' => false, 'debug' => json_encode($e))));
        }
    }

    public static function setmilestoneplan_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Set and get user preferences
     */
    public static function userpreferences_parameters()
    {
        return new external_function_parameters(
            array(
                'data' =>
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL),
                            'fieldname' => new external_value(PARAM_TEXT, 'Name of the field'),
                            'setget' => new external_value(PARAM_TEXT, 'Get or Set'),
                            'value' => new external_value(PARAM_TEXT, 'Value of field', VALUE_OPTIONAL)
                        )
                    )
            )
        );
    }
    public static function userpreferences_returns()
    {
        return new external_single_structure(
            array('response' => new external_value(PARAM_RAW, 'Server respons to the incomming log'))
        );
    }
    public static function userpreferences($data)
    {
        global $CFG, $DB, $USER;
        $userid = (int)$USER->id;

        $r = new stdClass();
        $r->userid = $userid;
        $r->name = $data['fieldname'] . '-course-' . $data['courseid'];
        $exists = $DB->record_exists('user_preferences', array(
            'name' => $data['fieldname'] . '-course-' . $data['courseid'],
            'userid' => $userid
        ));
        $res = 'nix';
        if ($exists != true) {
            $r->value = $data['value'] == null ? 0 : $data['value'];
            $transaction = $DB->start_delegated_transaction();
            $res = $DB->insert_records("user_preferences", array($r));
            $transaction->allow_commit();
        } elseif ($exists == true && $data['setget'] == 'get') {
            $transaction = $DB->start_delegated_transaction();
            $res = $DB->get_record("user_preferences", array(
                'name' => $data['fieldname'] . '-course-' . $data['courseid'],
                'userid' => $userid
            ));
            $transaction->allow_commit();
        } elseif ($exists == true && $data['setget'] == 'set') {
            //$transaction = $DB->start_delegated_transaction();
            //$res = $DB->get_record("user_preferences", array(
            //    'name' => $data['fieldname'] . '-course-' . $data['courseid'],
            //      'userid'=>$userid));
            //$transaction->allow_commit();
            //$r->id=$res->id;
            //$r->value=$data['value'];
            $transaction = $DB->start_delegated_transaction();
            //$res = $DB->set_record("user_preferences", array($r));
            $res = $DB->set_field("user_preferences", 'value', $data['value'], array(
                'userid' => $userid,
                'name' => $data['fieldname'] . '-course-' . $data['courseid']
            ));
            //$sql = 'UPDATE '. $CFG->prefix .'user_preferences SET value=\''. $data['value'] .'\' WHERE name=\'ladtopics_survey_done\' ;';
            //$res = $DB->set_records_sql($sql);
            $transaction->allow_commit();
        }

        return array('response' => json_encode(array($res)));
    }
    public static function userpreferences_is_allowed_from_ajax()
    {
        return true;
    }

    /**
     * Interface to obtain all completed activities
     */
    public static function completionprogress_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function completionprogress_is_allowed_from_ajax()
    {
        return true;
    }

    public static function completionprogress_returns()
    {
        return new external_single_structure(
            array(
                'activities' => new external_value(PARAM_RAW, ''),
                'completions' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function completionprogress($data)
    {
        global $CFG, $DB, $USER, $COURSE;
        $userid = (int)$USER->id;
        $courseid = $data;
        $meta = get_meta($courseid);

        // Step 1: obtain all course activities
        $modinfo = get_fast_modinfo($courseid, -1);
        $sections = $modinfo->get_sections();
        $activities = array();
        foreach ($modinfo->instances as $module => $instances) {
            $modulename = get_string('pluginname', $module);
            foreach ($instances as $index => $cm) {
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
                    'url'        => method_exists($cm->url, 'out') ? $cm->url->out() : '',
                    'context'    => $cm->context,
                    'icon'       => $cm->get_icon_url(),
                    'available'  => $cm->available,
                    'completion' => 0,
                );
            }
        }

        // Step 2:get all submissions of an user in a course
        $submissions = array();
        $params = array('courseid' => $courseid, 'userid' => $userid);

        // Queries to deliver instance IDs of activities with submissions by user.
        $queries = array(
            'assign' => "SELECT c.id
                        FROM {assign_submission} s, {assign} a, {modules} m, {course_modules} c
                        WHERE s.userid = :userid
                            AND s.latest = 1
                            AND s.status = 'submitted'
                            AND s.assignment = a.id
                            AND a.course = :courseid
                            AND m.name = 'assign'
                            AND m.id = c.module
                            AND c.instance = a.id",
            'workshop' => "SELECT DISTINCT c.id
                            FROM {workshop_submissions} s, {workshop} w, {modules} m, {course_modules} c
                            WHERE s.authorid = :userid
                            AND s.workshopid = w.id
                            AND w.course = :courseid
                            AND m.name = 'workshop'
                            AND m.id = c.module
                            AND c.instance = w.id",
        );

        foreach ($queries as $moduletype => $query) {
            $results = $DB->get_records_sql($query, $params);
            foreach ($results as $cmid => $obj) {
                $submissions[] = $cmid;
            }
        }

        // => $submissions TODO: Here is something missing. We don't do anything with the submission. Do we need to do something here?

        // Step 3: get completions
        $completions = array();
        $completion = new completion_info($COURSE);
        // $completion->is_enabled($cm) TODO: We nee to check this
        $cm = new stdClass();

        foreach ($activities as $activity) {
            $cm->id = $activity['id'];
            $activitycompletion = $completion->get_data($cm, true, $userid);
            $activity['completion'] = $activitycompletion->completionstate;
            // TODO: Determine activities whos completion shall not be visible ("Abschluss wird nicht angezeigt")
            /*
            $activity['status'] = $activitycompletion->status;
            $activity['criteria'] = $completiondata->criteria;
            $activity['hidden'] = $completiondata->hidden;
            */

            $completions[$activity['id']] = $activity;
            if ($completions[$activity['id']] === COMPLETION_INCOMPLETE && in_array($activity['id'], $submissions)) {
                $completions[$activity['id']] = 'submitted';
            }
        }

        return array(
            'activities' => json_encode(1), // $activities
            'completions' => json_encode($completions)
        );
    }

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
                "courseid" => (int)$courseid,
                "moduleid" => (int)$moduleid,
                "userid" => (int)$USER->id
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



    /**
     * Interface to obtain all activities completion and progress
     */
    public static function overview_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }

    public static function overview_is_allowed_from_ajax()
    {
        return true;
    }

    public static function overview_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }
    public static function overview($data)
    {
        global $CFG, $DB, $USER, $COURSE;
        $userid = (int)$USER->id;
        $courseid = $data;
        $debug = [];
        $meta = get_meta($courseid);

        // Step 1: obtain all course activities
        $modinfo = get_fast_modinfo($courseid, $userid);
        $sections = $modinfo->get_sections();
        $activities = array();
        foreach ($modinfo->instances as $module => $instances) {
            $modulename = get_string('pluginname', $module);
            foreach ($instances as $index => $cm) {
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
                    'url'        => method_exists($cm->url, 'out') ? $cm->url->out() : '',
                    'context'    => $cm->context,
                    'icon'       => $cm->get_icon_url(),
                    'available'  => $cm->available,
                    'completion' => 0,
                    'visible'	 => $cm->visible,
					'rating'	 => 0,
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

        return array(
            'success' => true,
            'data' => json_encode(array(
                'debug' => json_encode($debug),
                'completions' => json_encode($completions)
            ))
        );
    }


    /**
     * Reflections
     **/
    public static function reflectionRead_parameters()
    {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id'),
            )
        );
    }

    public static function reflectionRead_is_allowed_from_ajax()
    {
        return true;
    }

    public static function reflectionRead_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function reflectionRead($data)
    {
        global $DB, $USER;
        $debug = [];
        $userid = (int)$USER->id;
        $courseid = $data;
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql(
            "SELECT * FROM {ladtopics_reflections} WHERE courseid=:course AND userid=:user ORDER BY timecreated ASC",
            array("course" => (int)$courseid, "user" => (int)$userid)
        );
        $transaction->allow_commit();

        // TODO json_encode($debug)

        return array(
            'success' => true,
            'data' => json_encode($res)
        );
    }


    public static function reflectionCreate_parameters()
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

    public static function reflectionCreate_is_allowed_from_ajax()
    {
        return true;
    }

    public static function reflectionCreate_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, ''),
                'data' => new external_value(PARAM_RAW, '')
            )
        );
    }
    public static function reflectionCreate($data)
    {
        global $CFG, $DB, $USER, $COURSE;
        $debug = [];
        $userid = (int)$USER->id;
        $date = date_create();

        $r = new stdClass();
        $r->userid = (int)$userid;
        $r->courseid = (int)$data['course'];
        $r->section = $data['section'];
        $r->reflection = $data['reflection'];
        $r->timecreated = date_timestamp_get($date);
        $r->timemodified = date_timestamp_get($date);

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->insert_record("ladtopics_reflections", $r);
        $transaction->allow_commit();

        return array(
            'success' => true,
            'data' => json_encode($data)
        );
    }

    /**
     * Get policy Acceptance
     */
    public static function policyacceptance_parameters()
    {
        return new external_function_parameters(
            array(
                'policyversion' => new external_value(PARAM_INT, 'id of user', VALUE_OPTIONAL)
            )
        );
    }

    public static function policyacceptance_returns()
    {
        return new external_single_structure(
            array('data' => new external_value(PARAM_RAW, 'data'))
        );
    }

    public static function policyacceptance($data)
    {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_record("tool_policy_acceptances", array("policyversionid" => (int)$data, "userid" => (int)$USER->id), "timemodified");
        $transaction->allow_commit();

        return array('data' => json_encode($res));
    }

    public static function policyacceptance_is_allowed_from_ajax()
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

		$record = $DB->get_record('ladtopics_dashboard_settings',['userid' => $userid, 'course' => $course]);

		if ($record) {
			$record->settings = $settings;
			$DB->update_record('ladtopics_dashboard_settings', $record);
		} else {
			$record = new stdClass();
			$record->userid = $userid;
			$record->course = $course;
			$record->settings = $settings;
			$DB->insert_record('ladtopics_dashboard_settings', $record);
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
            FROM {ladtopics_dashboard_settings}
            WHERE
            	userid=:userid AND
            	course=:course",
			[
				"course" => (int)$course,
				"userid" => (int)$userid
			]
		);

		return array(
			'success' => true,
			'data' => json_encode($result),
		);
	}


	/**
	 * Interface to add new task list items to a user's task list
	 */
	public static function create_task_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'Course ID'),
			'task' => new external_value(PARAM_RAW, 'Task description'),
			'completed' => new external_value(PARAM_BOOL, 'Task completion status'),
			'duedate' => new external_value(PARAM_TEXT, 'Task due date'),
		]);
	}

	public static function create_task_is_allowed_from_ajax()
	{
		return true;
	}

	public static function create_task_returns()
	{
		return new external_single_structure([
			'success' => new external_value(PARAM_BOOL, 'Success flag'),
			'id' => new external_value(PARAM_INT, 'ID of new item')
		]);
	}

	public static function create_task($course, $task, $completed, $duedate)
	{
		global $DB, $USER;

		$record = new stdClass();
		$record->userid = (int)$USER->id;
		$record->course = (int)$course;
		$record->task = s($task);
		$record->duedate = strtotime($duedate);
		$record->timemodified = time();
		$record->completed = (int)$completed;

		$insertResult = $DB->insert_record("ladtopics_tasks", $record);

		if ($insertResult) {
			return [
				'success' => true,
				'id' => $insertResult
			];
		} else {
			throw new Exception('Failed to insert new item');
		}
	}

	/**
	 * Interface to toggle a task item
	 */
	public static function update_task_parameters()
	{
		return new external_function_parameters([
			'id' => new external_value(PARAM_INT, 'user id'),
			'duedate' => new external_value(PARAM_RAW, 'task due date'),
			'completed' => new external_value(PARAM_RAW, 'completion status of task'),
		]);
	}

	public static function update_task_is_allowed_from_ajax()
	{
		return true;
	}

	public static function update_task_returns()
	{
		return new external_single_structure([
			'success' => new external_value(PARAM_BOOL, 'success flag'),
			'data' => new external_value(PARAM_RAW, 'message for user')
		]);
	}

	public static function update_task($id, $duedate, $completed)
	{
		// update task status in database
		global $DB;

		$record = $DB->get_record('ladtopics_tasks', ['id' => (int)$id]);

		if ($record) {
			$record->completed = $completed;
			$record->duedate = strtotime($duedate);
			$success = $DB->update_record('ladtopics_tasks', $record);
		} else {
			$success = false;
		}

		// set success flag and message for response
		return [
			'success' => true,
			'data' => $success
		];
	}

	/**
	 * Interface to delete a to-do item
	 */
	public static function delete_task_parameters()
	{
		return new external_function_parameters([
			'id' => new external_value(PARAM_INT, 'user id'),
		]);
	}

	public static function delete_task_is_allowed_from_ajax()
	{
		return true;
	}

	public static function delete_task_returns()
	{
		return new external_single_structure([
			'success' => new external_value(PARAM_BOOL, 'success flag'),
		]);
	}

	public static function delete_task($id)
	{
		global $DB;

		$DB->delete_records('ladtopics_tasks', ['id' => $id]);

		return [
			'success' => true,
		];
	}

	/**
	 * Interface to fetch all to-do items for a user
	 */
	public static function get_tasks_parameters()
	{
		return new external_function_parameters([
			'userid' => new external_value(PARAM_INT, 'user id'),
			'course' => new external_value(PARAM_INT, 'id of course'),
		]);
	}

	public static function get_tasks_is_allowed_from_ajax()
	{
		return true;
	}

	public static function get_tasks_returns()
	{
		return new external_single_structure(
			array(
				'success' => new external_value(PARAM_BOOL, 'Success Variable'),
				'data' => new external_value(PARAM_RAW, 'Data output')
			)
		);
	}

	public static function get_tasks($userid, $course)
	{
		global $DB;

		$res = $DB->get_records('ladtopics_tasks', ['userid' => (int)$userid, 'course' => (int)$course]);

		if (!$res) {
			$success = false;
		} else {
			$success = true;

			foreach ($res as &$todo) {
				if ($todo->duedate != 0) {
					$todo->duedate = date('Y-m-d', $todo->duedate);
				}
			}
		}

		return array(
			'success' => $success,
			'data' => json_encode($res)
		);
	}


	/**
	 * Interface to fetch all quizzes and assignments
	 */
	public static function get_assignments_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'id of course'),
			'userid' => new external_value(PARAM_INT, 'id of user'),
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

	public static function get_assignments($course, $userid)
	{
		global $DB;

		$sql = "SELECT a.name, a.intro, a.allowsubmissionsfromdate, a.duedate, a.grade as max_grade, g.grade as user_grade, g.attemptnumber, cs.section,
				(SELECT COUNT(*) FROM {assign_submission} WHERE assignment = a.id AND userid = :userid) as user_attempts,
				(SELECT AVG(grade) FROM {assign_grades} WHERE assignment = a.id) as avg_grade,
				(SELECT COUNT(DISTINCT userid) FROM {assign_grades} WHERE assignment = a.id) as num_participants
				FROM {assign} a
				JOIN {assign_grades} g ON g.assignment = a.id
				JOIN {course_modules} cm ON cm.instance = a.id AND cm.module = (SELECT id FROM {modules} WHERE name = 'assign')
				JOIN {course_sections} cs ON cs.id = cm.section
				WHERE a.course = :course AND g.userid = :user";

		$params = array('course' => $course, 'userid' => $userid, 'user' => $userid);
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
			'userid' => new external_value(PARAM_INT, 'id of user'),
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

	public static function get_quizzes($course, $userid)
	{
		global $DB;

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

	/**
	 * Set users understaning of course activity
	 */
	public static function set_user_understanding_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'id of course'),
			'activityid' => new external_value(PARAM_TEXT, 'id of activity'),
			'rating' => new external_value(PARAM_INT, 'user understanding'),
		]);
	}

	public static function set_user_understanding_is_allowed_from_ajax()
	{
		return true;
	}

	public static function set_user_understanding_returns()
	{
		return new external_single_structure(
			array(
				'success' => new external_value(PARAM_BOOL, 'Success Variable'),
				'data' => new external_value(PARAM_RAW, 'Data output')
			)
		);
	}

	public static function set_user_understanding($course, $activityid, $rating)
	{
		global $DB, $USER;

		$userid = (int)$USER->id;

		$params = [
			'userid' => $userid,
			'course' => $course,
			'activityid' => (int)$activityid,
		];

		$record = $DB->get_record('ladtopics_overview', $params);

		if ($record) {
			$record->rating = $rating;
			$DB->update_record('ladtopics_overview', $record);
		} else {
			$record = new stdClass();
			$record->userid = (int)$userid;
			$record->course = (int)$course;
			$record->activityid = (int)$activityid;
			$record->rating = (int)$rating;
			$success = $DB->insert_record('ladtopics_overview', $record);
		}

		return array(
			'success' => true,
			'data' => json_encode($success)
		);
	}

	/**
	 * Get users understanding of course activity
	 */
	public static function get_user_understanding_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'id of course'),
		]);
	}

	public static function get_user_understanding_is_allowed_from_ajax()
	{
		return true;
	}

	public static function get_user_understanding_returns()
	{
		return new external_single_structure(
			array(
				'success' => new external_value(PARAM_BOOL, 'Success Variable'),
				'data' => new external_value(PARAM_RAW, 'Data output')
			)
		);
	}

	public static function get_user_understanding($course)
	{
		global $DB, $USER;

		$params = [
			'userid' => (int)$USER->id,
			'course' => (int)$course,
		];

		$res = $DB->get_records('ladtopics_overview', $params);

		if (!$res) {
			$success = false;
		} else {
			$success = true;
		}

		return array(
			'success' => $success,
			'data' => json_encode($res)
		);
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


	/**
	 * Sets the learner goal for each user and course.
	 */
	public static function set_learner_goal_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'id of course'),
			'goal' => new external_value(PARAM_TEXT, 'The users learning goal.'),
		]);
	}

	public static function set_learner_goal_is_allowed_from_ajax()
	{
		return true;
	}

	public static function set_learner_goal_returns()
	{
		return new external_single_structure(
			array(
				'success' => new external_value(PARAM_BOOL, 'Success variable'),
			)
		);
	}

	public static function set_learner_goal($course, $goal)
	{
		global $DB, $USER;

		$userid = (int)$USER->id;

		$record = $DB->get_record('ladtopics_learner_goal', array('userid' => $userid, 'course' => $course));

		if ($record) {
			$record->goal = $goal;
			$success = $DB->update_record('ladtopics_learner_goal', $record);
		} else {
			$record = new stdClass();
			$record->userid = $userid;
			$record->course = (int)$course;
			$record->goal = $goal;
			$success = $DB->insert_record('ladtopics_learner_goal', $record);
		}

		return array(
			'success' => $success,
		);
	}


	/**
	 * Gets the learner goal for each user and course.
	 */
	public static function get_learner_goal_parameters()
	{
		return new external_function_parameters([
			'course' => new external_value(PARAM_INT, 'id of course'),
		]);
	}

	public static function get_learner_goal_is_allowed_from_ajax()
	{
		return true;
	}

	public static function get_learner_goal_returns()
	{
		return new external_single_structure(
			array(
				'success' => new external_value(PARAM_BOOL, 'Success Variable'),
				'data' => new external_value(PARAM_RAW, 'Data output')
			)
		);
	}

	public static function get_learner_goal($course)
	{
		global $DB, $USER;

		$userid = (int)$USER->id;

		$goal = $DB->get_field('ladtopics_learner_goal', 'goal', array('userid' => $userid, 'course' => $course));

		return array(
			'success' => true,
			'data' => json_encode($goal),
		);
	}
}// end class
