<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = [
	'format_serial3_analytics' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'analytics',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_completionprogress' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'completionProgress',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_overview' => [
		'classname' => 'format_serial3_overview',
		'methodname' => 'overview',
		'classpath' => 'course/format/serial3/ws/overview.php',
		'description' => 'Obtain course elements and learning progress',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_reflectionread' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'reflectionRead',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_reflectioncreate' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'reflectionCreate',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],

	'format_serial3_get_surveys' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_surveys',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'xxx',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_statistics' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'statistics',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_notification' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'notification',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_sendmail' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'sendmail',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_getalluser' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'getalluser',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_name' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'name',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_logstore' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'logstore',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain calendar events from database',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_getcalendar' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'getcalendar',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the calendar data from moodle native calendar',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_coursestructure' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'coursestructure',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain course structure from database',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_logger' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'logger',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain logger date from database',
		'type' => 'write',
		'ajax' => true,
		'capabilities' => 'format/serial3:view',
	],
	'format_serial3_updateuser' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'updateuser',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain logger date from database',
		'type' => 'write',
		'ajax' => true
	],
	'format_serial3_getmilestones' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'getmilestones',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain mielstones from database',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_setmilestones' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'setmilestones',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Save mielstones to database',
		'type' => 'write',
		//'capabilities'  => 'format/serial3:view',
		'ajax' => true
	],
	'format_serial3_getmilestoneplan' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'getmilestoneplan',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain mielstones from database',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_setmilestoneplan' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'setmilestoneplan',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Obtain mielstones from database',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_userpreferences' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'userpreferences',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Set and get user pref',
		'type' => 'write',
		'ajax' => true
	],
	'format_serial3_policyacceptance' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'policyacceptance',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get polics acceptance',
		'type' => 'write',
		'ajax' => true
	],
	'format_serial3_create_task' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'create_task',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Adds a new item to the user\'s task list',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_update_task' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'update_task',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Updates the task list item',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_delete_task' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'delete_task',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Removes the given item from the task list',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_get_tasks' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_tasks',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Gets task list items',
		'type' => 'read',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_save_dashboard_settings' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'save_dashboard_settings',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Saves users dashboard configurations',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_get_dashboard_settings' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_dashboard_settings',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Fetch users dashboard configurations',
		'type' => 'read',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_get_quizzes' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_quizzes',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get student quiz data',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_assignments' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_assignments',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get student assignment data',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_user_understanding' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_user_understanding',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Set the completion status of activities',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_set_user_understanding' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'set_user_understanding',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Set the completion status of activities',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_deadlines' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_deadlines',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get due dates of assignments and quizzes',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_set_learner_goal' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'set_learner_goal',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get due dates of assignments and quizzes',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_update_learner_goal' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'update_learner_goal',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Update the users learner goal.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_learner_goal' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_learner_goal',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_missed_activities' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_missed_activities',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_forum_posts' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_forum_posts',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_set_rule_response' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'set_rule_response',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the users learner goal.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_last_access_of_teachers_of_course' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_last_access_of_teachers_of_course',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the lastaccess of all teachers from a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_all_teachers_of_course' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_all_teachers_of_course',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get all teachers of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_user_logstore_for_course' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_user_logstore_for_course',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get the logstore for a user in a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_added_or_changed_course_resources' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_added_or_changed_course_resources',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get added or changed resources of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_deleted_course_resources' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_deleted_course_resources',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get deleted resources of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_new_forum_discussions' => [
		'classname' => 'format_serial3_external',
		'methodname' => 'get_new_forum_discussions',
		'classpath' => 'course/format/serial3/api.php',
		'description' => 'Get new forum discussions (since last access)',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
];