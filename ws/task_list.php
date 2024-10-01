
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


class format_serial3_task_list extends external_api
{
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
        $record->userid = (int) $USER->id;
        $record->course = (int) $course;
        $record->task = (string) ($task);
        $record->duedate = strtotime($duedate);
        $record->timemodified = time();
        $record->completed = (int) $completed;

        $insertResult = $DB->insert_record("serial3_tasks", $record);

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

        $record = $DB->get_record('serial3_tasks', ['id' => (int) $id]);

        if ($record) {
            $record->completed = $completed;
            $record->duedate = strtotime($duedate);
            $success = $DB->update_record('serial3_tasks', $record);
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

        $DB->delete_records('serial3_tasks', ['id' => $id]);

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

        $res = $DB->get_records('serial3_tasks', ['userid' => (int) $userid, 'course' => (int) $course]);

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
}
