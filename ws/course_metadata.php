<?php
defined('MOODLE_INTERNAL') || die;

require_once ($CFG->libdir . '/externallib.php');

// TODO: Do we need to move this somewhere else?

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