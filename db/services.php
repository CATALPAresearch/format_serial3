<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = array( // completionProgress
        'format_ladtopics_completionprogress' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'completionProgress',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_limeaccess' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'limeaccess',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'xxx',
                'type'        => 'write',
                'ajax'        => true 
        ),
        'format_ladtopics_limesurvey' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'limesurvey',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'xxx',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_statistics' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'statistics',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_notification' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'notification',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_sendmail' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'sendmail',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_getalluser' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'getalluser',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_name' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'name',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain the plugin name',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_logstore' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'logstore',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain calendar events from database',
                'type'        => 'read',
                'ajax'        => true 
        ),        
        'format_ladtopics_getcalendar' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'getcalendar',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Get the calendar data from moodle native calendar',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_coursestructure' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'coursestructure',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain course structure from database',
                'type'        => 'read',
                'ajax'        => true 
        ),
        'format_ladtopics_logger' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'logger',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain logger date from database',
                'type'        => 'write',
                'ajax'        => true,
                'capabilities'  => 'format/ladtopics:view', 
        ),
        'format_ladtopics_updateuser' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'updateuser',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain logger date from database',
                'type'        => 'write',
                'ajax'        => true
        ),
        'format_ladtopics_getmilestones' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'getmilestones',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain mielstones from database',
                'type'        => 'read',
                'ajax'        => true
        ),        
        'format_ladtopics_setmilestones' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'setmilestones',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Save mielstones to database',
                'type'        => 'write',
                //'capabilities'  => 'format/ladtopics:view',
                'ajax'        => true
        ),
        'format_ladtopics_getmilestoneplan' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'getmilestoneplan',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain mielstones from database',
                'type'        => 'read',
                'ajax'        => true
        ),
        'format_ladtopics_setmilestoneplan' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'setmilestoneplan',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Obtain mielstones from database',
                'type'        => 'read',
                'ajax'        => true
        ),
        'format_ladtopics_userpreferences' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'userpreferences',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Set and get user pref',
                'type'        => 'write',
                'ajax'        => true
        ),
        'format_ladtopics_policyacceptance' => array(
                'classname'   => 'format_ladtopics_external',
                'methodname'  => 'policyacceptance',
                'classpath'   => 'course/format/ladtopics/api.php',
                'description' => 'Get polics acceptance',
                'type'        => 'write',
                'ajax'        => true
        )

);