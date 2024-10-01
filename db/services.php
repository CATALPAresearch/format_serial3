<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = [
	/**
	 * General Dashboard Webservices
	 */
	'format_serial3_name' => [
		'classname' => 'format_serial3_dashboard',
		'methodname' => 'name',
		'classpath' => 'course/format/serial3/ws/serial3.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_logger' => [
		'classname' => 'format_serial3_dashboard',
		'methodname' => 'logger',
		'classpath' => 'course/format/serial3/ws/serial3.php',
		'description' => 'Obtain logger date from database',
		'type' => 'write',
		'ajax' => true,
		'capabilities' => 'format/serial3:view',
	],
	'format_serial3_save_dashboard_settings' => [
		'classname' => 'format_serial3_dashboard',
		'methodname' => 'save_dashboard_settings',
		'classpath' => 'course/format/serial3/ws/serial3.php',
		'description' => 'Saves users dashboard configurations',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_get_dashboard_settings' => [
		'classname' => 'format_serial3_dashboard',
		'methodname' => 'get_dashboard_settings',
		'classpath' => 'course/format/serial3/ws/serial3.php',
		'description' => 'Fetch users dashboard configurations',
		'type' => 'read',
		'loginrequired' => true,
		'ajax' => true,
	],
	

	/**
	 * Extension: Survey
	 */
	'format_serial3_get_surveys' => [
		'classname' => 'format_serial3_survey',
		'methodname' => 'get_surveys',
		'classpath' => 'course/format/serial3/ws/survey.php',
		'description' => 'Get results from a survey',
		'type' => 'read',
		'ajax' => true
	],


	/**
	 * Wirdget: ProgressChartAdaptive
	 */
	'format_serial3_progress_overview' => [
		'classname' => 'format_serial3_progress_overview',
		'methodname' => 'progress_overview',
		'classpath' => 'course/format/serial3/ws/progress_overview.php',
		'description' => 'Obtain course elements and learning progress',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],

	/**
	 * Widget: Overview
	 */
	'format_serial3_reflectionread' => [
		'classname' => 'format_serial3_overview',
		'methodname' => 'reflection_read',
		'classpath' => 'course/format/serial3/ws/overview.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_reflectioncreate' => [
		'classname' => 'format_serial3_overview',
		'methodname' => 'reflection_create',
		'classpath' => 'course/format/serial3/ws/overview.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],

	/**
	 * Widget: Deadlines
	 *  */ 
	'format_serial3_get_calendar' => [
		'classname' => 'format_serial3_deadlines',
		'methodname' => 'get_calendar',
		'classpath' => 'course/format/serial3/ws/deadlines.php',
		'description' => 'Get the calendar data from moodle native calendar',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_get_deadlines' => [
		'classname' => 'format_serial3_deadlines',
		'methodname' => 'get_deadlines',
		'classpath' => 'course/format/serial3/ws/deadlines.php',
		'description' => 'Get due dates of assignments and quizzes',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],

	/**
	 * Widget: Recommendations
	 */
	'format_serial3_set_rule_response' => [
		'classname' => 'format_serial3_recommendations',
		'methodname' => 'set_rule_response',
		'classpath' => 'course/format/serial3/ws/recommendations.php',
		'description' => 'Get the users learner goal.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_notification' => [
		'classname' => 'format_serial3_recommendations',
		'methodname' => 'notification',
		'classpath' => 'course/format/serial3/ws/recommendations.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],
	'format_serial3_sendmail' => [
		'classname' => 'format_serial3_recommendations',
		'methodname' => 'sendmail',
		'classpath' => 'course/format/serial3/ws/recommendations.php',
		'description' => 'Obtain the plugin name',
		'type' => 'read',
		'ajax' => true
	],

	/**
	 * Widget: Task list
	 */
	'format_serial3_create_task' => [
		'classname' => 'format_serial3_task_list',
		'methodname' => 'create_task',
		'classpath' => 'course/format/serial3/ws/task_list.php',
		'description' => 'Adds a new item to the user\'s task list',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_update_task' => [
		'classname' => 'format_serial3_task_list',
		'methodname' => 'update_task',
		'classpath' => 'course/format/serial3/ws/task_list.php',
		'description' => 'Updates the task list item',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_delete_task' => [
		'classname' => 'format_serial3_task_list',
		'methodname' => 'delete_task',
		'classpath' => 'course/format/serial3/ws/task_list.php',
		'description' => 'Removes the given item from the task list',
		'type' => 'write',
		'loginrequired' => true,
		'ajax' => true,
	],
	'format_serial3_get_tasks' => [
		'classname' => 'format_serial3_task_list',
		'methodname' => 'get_tasks',
		'classpath' => 'course/format/serial3/ws/task_list.php',
		'description' => 'Gets task list items',
		'type' => 'read',
		'loginrequired' => true,
		'ajax' => true,
	],

	/**
	 * Widget: QuizzStatistics
	 */
	'format_serial3_get_quizzes' => [
		'classname' => 'format_serial3_quiz_statistics',
		'methodname' => 'get_quizzes',
		'classpath' => 'course/format/serial3/ws/quiz_statistics.php',
		'description' => 'Get student quiz data',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_assignments' => [
		'classname' => 'format_serial3_quiz_statistics',
		'methodname' => 'get_assignments',
		'classpath' => 'course/format/serial3/ws/quiz_statistics.php',
		'description' => 'Get student assignment data',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],

	/**
	 * Widget: TeacherActivity
	 */
	'format_serial3_get_all_teachers_of_course' => [
		'classname' => 'format_serial3_teacher_activity',
		'methodname' => 'get_all_teachers_of_course',
		'classpath' => 'course/format/serial3/ws/teacher_activity.php',
		'description' => 'Get all teachers of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_last_access_of_teachers_of_course' => [
		'classname' => 'format_serial3_teacher_activity',
		'methodname' => 'get_last_access_of_teachers_of_course',
		'classpath' => 'course/format/serial3/ws/teacher_activity.php',
		'description' => 'Get the lastaccess of all teachers from a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_added_or_changed_course_resources' => [
		'classname' => 'format_serial3_teacher_activity',
		'methodname' => 'get_added_or_changed_course_resources',
		'classpath' => 'course/format/serial3/ws/teacher_activity.php',
		'description' => 'Get added or changed resources of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_deleted_course_resources' => [
		'classname' => 'format_serial3_teacher_activity',
		'methodname' => 'get_deleted_course_resources',
		'classpath' => 'course/format/serial3/ws/teacher_activity.php',
		'description' => 'Get deleted resources of a course.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_new_forum_discussions' => [
		'classname' => 'format_serial3_teacher_activity',
		'methodname' => 'get_new_forum_discussions',
		'classpath' => 'course/format/serial3/ws/teacher_activity.php',
		'description' => 'Get new forum discussions (since last access)',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],

	/**
	 * Learner Model
	 */
	'format_serial3_get_user_understanding' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'get_user_understanding',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Set the completion status of activities',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_set_user_understanding' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'set_user_understanding',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Set the completion status of activities',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_set_learner_goal' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'set_learner_goal',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Get due dates of assignments and quizzes',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_update_learner_goal' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'update_learner_goal',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Update the users learner goal.',
		'type' => 'write',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_learner_goal' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'get_learner_goal',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_missed_activities' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'get_missed_activities',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
	'format_serial3_get_forum_posts' => [
		'classname' => 'format_serial3_learner_model',
		'methodname' => 'get_forum_posts',
		'classpath' => 'course/format/serial3/ws/learner_model.php',
		'description' => 'Get the users learner goal.',
		'type' => 'read',
		'ajax' => true,
		'loginrequired' => true
	],
];