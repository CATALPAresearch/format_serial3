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
        $query ='SELECT * FROM ' . $CFG->prefix . 'logstore_standard_log 
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
                'data' => new external_value(PARAM_RAW, 'data'),
                'debug' => new external_value(PARAM_RAW, 'debug')
                //,'user' => new external_value(PARAM_RAW, 'data')
            )
        );
    }


    public static function coursestructure($courseid) {
        global $CFG, $DB, $USER;
        /*
        This function should be refactored

        http://127.0.0.1/adminer.php?username=root&db=moodle&select=moodlecourse_sections
        http://127.0.0.1/adminer.php?username=root&db=moodle&select=moodlecourse_modules&order%5B0%5D=course
        http://127.0.0.1/adminer.php?username=root&db=moodle&select=moodle_modules
        http://127.0.0.1/adminer.php?username=root&db=moodle&select=moodlefeedback

         // missing: , assign,  
            
         modules: zuordnung ID Aktivity-Type, e.g. "forum"
         course_sections: nummerierung der Sektionen mit Titel
         course_modules: 
        */

        $arr = array();
        $addActivities = function($data){
            $arr=array();
            $id=0;
            foreach($data as $e){
                if($e->instance_visible == 1){ 
                    $entry = array(
                        'id' => $id,
                        'course_id' => $e->course_id, 
                        'module_id' => $e->module_id, 
                        'section_id' => $e->section_id, 
                        'section_name' => $e->section_name,
                        'instance_id' => $e->instance_id,
                        'instance_url_id' => $e->instance_url_id, 
                        'instance_type' => $e->instance_type, 
                        'instance_title' => $e->instance_title,
                        'section' => $e->section_id, 
                        'name' => $e->instance_title 
                    );
                    array_push($arr, $entry);
                    $id++;
                }   
            }
            return $arr;
        };

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'hvp AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'hvp\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'checklist AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'checklist\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'url AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'url\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'studentquiz AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'studentquiz\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'page AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'page\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));


        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'feedback AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'feedback\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'forum AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'forum\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'resource AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'resource\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'glossary AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'glossary\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'quiz AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'quiz\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));

        $query = '
        SELECT 
        cm.instance AS instance_id,     
        m.name AS instance_type, 
        m.visible AS instance_visible,
        f.name AS instance_title,
        cm.id AS instance_url_id,
        cm.course AS course_id, 
        cm.module AS module_id, 
        cm.section AS section_id, 
        cs.name AS section_name
        FROM ' . $CFG->prefix . 'course_modules AS cm
        JOIN ' . $CFG->prefix . 'modules AS m 
        ON m.id = cm.module
        JOIN ' . $CFG->prefix . 'course_sections AS cs 
        ON cs.id = cm.section
        RIGHT OUTER JOIN ' . $CFG->prefix . 'wiki AS f
        ON cm.instance = f.id 
        WHERE cm.course = '. (int)$courseid .' AND cs.course = '. (int)$courseid .' AND f.course = '. (int)$courseid .' AND m.name=\'wiki\'
        ';
        $transaction = $DB->start_delegated_transaction();
        $res = $DB->get_records_sql($query); 
        $transaction->allow_commit();
        $arr = array_merge($arr, $addActivities($res));
    

        $debug=array('');
        // debug: error_log(print_r($res,true));
        return array('data'=>json_encode($arr), 'debug'=>json_encode($debug));
    }
    public static function coursestructure_is_allowed_from_ajax() { return true; }


    

   

}// end class



?>