<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = [
	'format_ladtopics_analytics' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'analytics',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_completionprogress' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'completionProgress',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_overview' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'overview',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_reflectionread' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'reflectionRead',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_reflectioncreate' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'reflectionCreate',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],

	'format_ladtopics_limesurvey' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'limesurvey',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'xxx',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_statistics' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'statistics',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_notification' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'notification',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_sendmail' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'sendmail',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_getalluser' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'getalluser',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_name' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'name',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain the plugin name',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_logstore' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'logstore',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain calendar events from database',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_getcalendar' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'getcalendar',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Get the calendar data from moodle native calendar',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_coursestructure' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'coursestructure',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain course structure from database',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_logger' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'logger',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain logger date from database',
			'type'        => 'write',
			'ajax'        => true,
			'capabilities'  => 'format/ladtopics:view',
	],
	'format_ladtopics_updateuser' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'updateuser',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain logger date from database',
			'type'        => 'write',
			'ajax'        => true
	],
	'format_ladtopics_getmilestones' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'getmilestones',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain mielstones from database',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_setmilestones' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'setmilestones',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Save mielstones to database',
			'type'        => 'write',
			//'capabilities'  => 'format/ladtopics:view',
			'ajax'        => true
	],
	'format_ladtopics_getmilestoneplan' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'getmilestoneplan',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain mielstones from database',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_setmilestoneplan' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'setmilestoneplan',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Obtain mielstones from database',
			'type'        => 'read',
			'ajax'        => true
	],
	'format_ladtopics_userpreferences' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'userpreferences',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Set and get user pref',
			'type'        => 'write',
			'ajax'        => true
	],
	'format_ladtopics_policyacceptance' => [
			'classname'   => 'format_ladtopics_external',
			'methodname'  => 'policyacceptance',
			'classpath'   => 'course/format/ladtopics/api.php',
			'description' => 'Get polics acceptance',
			'type'        => 'write',
			'ajax'        => true
	],
	'format_ladtopics_create_task' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'create_task',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Adds a new item to the user\'s task list',
		'type' 				=> 'write',
		'loginrequired' 	=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_update_task' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'update_task',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Updates the task list item',
		'type' 				=> 'write',
		'loginrequired'		=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_delete_task' => [
		'classname'			=> 'format_ladtopics_external',
		'methodname' 		=> 'delete_task',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Removes the given item from the task list',
		'type' 				=> 'write',
		'loginrequired' 	=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_get_tasks' => [
		'classname'			=> 'format_ladtopics_external',
		'methodname' 		=> 'get_tasks',
		'classpath'			=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Gets task list items',
		'type' 				=> 'read',
		'loginrequired' 	=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_save_dashboard_settings' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname'		=> 'save_dashboard_settings',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Saves users dashboard configurations',
		'type' 				=> 'write',
		'loginrequired' 	=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_get_dashboard_settings' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_dashboard_settings',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Fetch users dashboard configurations',
		'type' 				=> 'read',
		'loginrequired' 	=> true,
		'ajax' 				=> true,
	],
	'format_ladtopics_get_quizzes' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_quizzes',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Get student quiz data',
		'type' 				=> 'read',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_get_assignments' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_assignments',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Get student assignment data',
		'type' 				=> 'read',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_get_user_understanding' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_user_understanding',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Set the completion status of activities',
		'type' 				=> 'read',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_set_user_understanding' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'set_user_understanding',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Set the completion status of activities',
		'type' 				=> 'write',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_get_deadlines' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_deadlines',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Get due dates of assignments and quizzes',
		'type' 				=> 'read',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_set_learner_goal' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'set_learner_goal',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Get due dates of assignments and quizzes',
		'type' 				=> 'write',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_update_learner_goal' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname'		=> 'update_learner_goal',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Update the users learner goal.',
		'type' 				=> 'write',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
	'format_ladtopics_get_learner_goal' => [
		'classname' 		=> 'format_ladtopics_external',
		'methodname' 		=> 'get_learner_goal',
		'classpath' 		=> 'course/format/ladtopics/api.php',
		'description' 		=> 'Get the users learner goal.',
		'type' 				=> 'read',
		'ajax' 				=> true,
		'loginrequired' 	=> true
	],
];