<?php

defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . '/externallib.php');

class format_ladtopics_external extends external_api {
    
    /**
     * Obtain plugin name
     */
    public static function name_parameters() {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array('courseid' => new external_value(PARAM_INT, 'id of course', VALUE_OPTIONAL))
        );
    }
    
    public static function name_is_allowed_from_ajax() { return true; }

    public static function name_returns() {
        return new external_single_structure(
                array(
                    'data' => new external_value(PARAM_TEXT, 'Plugin name')
                )
        );
    }
    public static function name($data) {
        return array(
            'data' => 'LAD Topics Format'
        );
    }


    /*
     * Get logstore data
     **/    
     public static function logstore_parameters() {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function logstore_returns() {
        return new external_single_structure(
                array(
                    'data' => new external_value(PARAM_RAW, 'data'),
                    'user' => new external_value(PARAM_RAW, 'data')
                )
        );
    }
    public static function logstore($data) {
        global $CFG, $DB, $USER;

        $transaction = $DB->start_delegated_transaction(); 
        $query ='SELECT * FROM ' . $CFG->prefix . 'logstore_standard_log WHERE userid=' . $USER->id . ' AND 
        ( 
            component="mod_glossary" OR 
            component="mod_forum" OR
            component="mod_wiki" OR
            component="mod_studentquiz" OR
            component="mod_assignment" OR
            component="mod_quiz"
        );';
        $data = $DB->get_records_sql($query);//($table, array('userid'=>'2', 'component'=>'mod_glossary'));//, '','*',0,100);
        $transaction->allow_commit();
        $arr=array();
        foreach($data as $bu){
            $entry = array(
                    'utc' => $bu->timecreated,
                    'action_type' => $bu->component,
                    'action'=> $bu->action//,
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
        
        return array('data'=>json_encode($arr), 'user'=>json_encode($user_data));
    }
    public static function logstore_is_allowed_from_ajax() { return true; }
    

    /*
     * Get course structure
     **/    
     public static function coursestructure_parameters() {
        //  VALUE_REQUIRED, VALUE_OPTIONAL, or VALUE_DEFAULT. If not mentioned, a value is VALUE_REQUIRED 
        return new external_function_parameters(
            array(
                'courseid' => new external_value(PARAM_INT, 'course id')
            )
        );
    }
    public static function coursestructure_returns() {
        return new external_single_structure(
            array(
                'data' => new external_value(PARAM_RAW, 'data')
                //,'user' => new external_value(PARAM_RAW, 'data')
            )
        );
    }
    public static function coursestructure($courseid) {
        global $CFG, $DB, $USER;
        $transaction = $DB->start_delegated_transaction(); 
        $query ='SELECT name, visible, section FROM ' . $CFG->prefix . 'course_sections WHERE course='. (int)$courseid .';';
        $sections = $DB->get_records_sql($query);//($table, array('userid'=>'2', 'component'=>'mod_glossary'));//, '','*',0,100);
        $transaction->allow_commit();
        
        /* 
         FROM moodlecourse_modules AS cm 
INNER JOIN moodle_modules AS m
ON cm.module = m.id 
INNER JOIN (
SELECT id, name 
FROM moodlefeedback
UNION ALL
SELECT id, name
FROM moodleforum
UNION ALL
SELECT id, name
FROM moodlequiz
UNION ALL
SELECT id, name
FROM moodlepage
UNION ALL
SELECT id, name
FROM moodlefeedback
) AS u
ON cm.instance = u.id
WHERE cm.course = 2
        */
        //$transaction = $DB->start_delegated_transaction(); 
        $e_________________query ='
            FROM ' . $CFG->prefix . 'course_modules AS cm 
            INNER JOIN ' . $CFG->prefix . '_modules AS m
            ON cm.module = m.id 
            INNER JOIN (
            SELECT id, name 
            FROM ' . $CFG->prefix . 'feedback
            UNION ALL
            SELECT id, name
            FROM ' . $CFG->prefix . 'forum
            UNION ALL
            SELECT id, name
            FROM ' . $CFG->prefix . 'quiz
            UNION ALL
            SELECT id, name
            FROM ' . $CFG->prefix . 'page
            UNION ALL
            SELECT id, name
            FROM ' . $CFG->prefix . 'feedback
            ) AS u
            ON cm.instance = u.id
            WHERE cm.course = 2;';
        //$modules = $DB->get_records_sql($query);//($table, array('userid'=>'2', 'component'=>'mod_glossary'));//, '','*',0,100);
        //$transaction->allow_commit();
        
        $arr=array();
        $id=0;
        foreach($sections as $bu){
            $entry = array(
                    'id' => $id,
                    'section' => $bu->section,
                    'name' => $bu->name,
                    'visible' => $bu->visible
            );
            array_push($arr, $entry);
            $id++;
        }
    
        return array('data'=>json_encode($arr));
    }
    public static function coursestructure_is_allowed_from_ajax() { return true; }


    /**
     * Make video metadata persistent
   
    public static function set_video_parameters() {
        return new external_function_parameters(
            array(
                'data' => 
                    new external_single_structure(
                        array(
                            'courseid' => new external_value(PARAM_INT, 'course id', VALUE_OPTIONAL),
                            'userid' => new external_value(PARAM_INT, 'user id', VALUE_OPTIONAL)
                        )
                )
            )
        );
    }
    public static function set_video_returns() {
        return new external_single_structure(
                array( 'data' => new external_value(PARAM_RAW, 'data') )
        );
    }
    public static function set_video($data) {
        global $CFG, $DB;
        $table = "videodatabase_videos";
        $sql = 'DELETE FROM '.$CFG->prefix.'videodatabase_videos WHERE courseid='.(int)$data['courseid'];
        $res = $DB->execute($sql);
        $t = array();
        foreach( $videos = explode(',', $data['videos']) as $video){
            $r = new stdClass();
            $r->courseid = (int)$data['courseid'];
            $r->videofileid = (int)$video;
            array_push($t, $r);
        }
        $transaction = $DB->start_delegated_transaction(); 
        $res = $DB->insert_records($table, $t);
        $transaction->allow_commit();
        
        $transaction = $DB->start_delegated_transaction(); 
        $sql='SELECT * FROM '.$CFG->prefix.'videodatabase_videos as d JOIN '.$CFG->prefix.'videofile as f where d.videofileid = f.id';
        $res = $DB->get_records_sql($sql);
        $transaction->allow_commit();
        return array('data'=> json_encode($res));//'{ "status":"ok", "msg": "Successfully saved video id from the videofile pool.'.'."}');
    }
    */

}// end class


?>