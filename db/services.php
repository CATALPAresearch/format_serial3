<?php

/**
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2017 Niels Seidel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


$functions = array(
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
                'description' => 'Obtain logstore date from database',
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
        )
);

// http://localhost/moodle/webservice/rest/server.php?wstoken=e321c48e338fc44830cda07824833944&wsfunction=local_wstemplate_hello_world
