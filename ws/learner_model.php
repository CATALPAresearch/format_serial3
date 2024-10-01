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


class format_serial3_learner_model extends external_api
{
/**
     * Interface to fetch get the missed and total number of assignments and quizzes
     */
    public static function get_missed_activities_parameters()
    {
        return new external_function_parameters([
            'course' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_missed_activities_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_missed_activities_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_missed_activities($course)
    {
        global $DB, $USER;

        $sql = "SELECT
    			COUNT(CASE WHEN s.id IS NULL THEN 1 END) AS num_missed_assignments,
    			COUNT(*) AS total_assignments
				FROM {assign} a
				LEFT JOIN {assign_submission} s ON s.assignment = a.id AND s.userid = :userid
				WHERE a.course = :course";
        //AND a.allowsubmissionsfromdate < UNIX_TIMESTAMP() AND a.duedate < UNIX_TIMESTAMP()

        $params = array('course' => $course, 'userid' => (int) $USER->id);
        $missedAssignments = $DB->get_records_sql($sql, $params);

        return array(
            'success' => true,
            'data' => json_encode($missedAssignments)
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

        $userid = (int) $USER->id;

        $params = [
            'userid' => $userid,
            'course' => $course,
            'activityid' => (int) $activityid,
        ];

        $record = $DB->get_record('serial3_overview', $params);

        if ($record) {
            $record->rating = $rating;
            $DB->update_record('serial3_overview', $record);
        } else {
            $record = new stdClass();
            $record->userid = (int) $userid;
            $record->course = (int) $course;
            $record->activityid = (int) $activityid;
            $record->rating = (int) $rating;
            $success = $DB->insert_record('serial3_overview', $record);
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
            'userid' => (int) $USER->id,
            'course' => (int) $course,
        ];

        $res = $DB->get_records('serial3_overview', $params);

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

        $userid = (int) $USER->id;

        $record = $DB->get_record('serial3_learner_goal', array('userid' => $userid, 'course' => $course));

        if ($record) {
            $record->goal = $goal;
            $success = $DB->update_record('serial3_learner_goal', $record);
        } else {
            $record = new stdClass();
            $record->userid = $userid;
            $record->course = (int) $course;
            $record->goal = $goal;
            $success = $DB->insert_record('serial3_learner_goal', $record);
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

        $userid = (int) $USER->id;

        $goal = $DB->get_field('serial3_learner_goal', 'goal', array('userid' => $userid, 'course' => $course));

        return array(
            'success' => true,
            'data' => json_encode($goal),
        );
    }


    /**
     * Get the number of forum posts of a user.
     */
    public static function get_forum_posts_parameters()
    {
        return new external_function_parameters([
            'course' => new external_value(PARAM_INT, 'id of course'),
        ]);
    }

    public static function get_forum_posts_is_allowed_from_ajax()
    {
        return true;
    }

    public static function get_forum_posts_returns()
    {
        return new external_single_structure(
            array(
                'success' => new external_value(PARAM_BOOL, 'Success Variable'),
                'data' => new external_value(PARAM_RAW, 'Data output')
            )
        );
    }

    public static function get_forum_posts($course)
    {
        global $DB, $USER;

        $userid = (int) $USER->id;

        $sql = "SELECT 
			(SELECT COUNT(*) 
			 FROM {forum_posts} fp 
			 JOIN {forum_discussions} fd ON fd.id = fp.discussion 
			 WHERE fd.course = :courseid AND fp.userid = :userid) AS user_posts,
			COUNT(*) AS total_posts,
			COUNT(*) / COALESCE(NULLIF(COUNT(DISTINCT fp.userid), 0)) AS avg_posts_per_person,
			(SELECT COUNT(*) 
			 FROM {forum_posts} fp 
			 JOIN {forum_discussions} fd ON fd.id = fp.discussion 
			 GROUP BY fp.userid 
			 ORDER BY COUNT(*) DESC 
			 LIMIT 1) AS max_user_posts,
			(SELECT COUNT(*) 
			 FROM {forum_posts} fp 
			 JOIN {forum_discussions} fd ON fd.id = fp.discussion 
			 GROUP BY fp.userid 
			 ORDER BY COUNT(*) ASC 
			 LIMIT 1) AS min_user_posts
		FROM {forum_posts} fp 
		JOIN {forum_discussions} fd ON fd.id = fp.discussion 
		WHERE fd.course = :courseid1 AND fp.userid IS NOT NULL
        ;";

        $params = array('courseid' => (int) $course, 'courseid1' => (int) $course, 'userid' => $userid);

        $result = $DB->get_records_sql($sql, $params);
        $result = [];
        return array(
            'success' => true,
            'data' => json_encode($result),
        );
    }
}