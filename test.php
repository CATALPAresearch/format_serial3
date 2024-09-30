<?php 

require_once(dirname(__FILE__) . '/../../../config.php');
require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . "/externallib.php");
require_once($CFG->dirroot . "/lib/moodlelib.php");
require_once($CFG->dirroot . "/lib/pagelib.php");
require_once($CFG->dirroot . '/lib/completionlib.php');
require_once($CFG->dirroot . '/course/format/lib.php');

require_login();

$c = get_config('format_serial3');
$c = get_config('moodlecourse');
$c = get_config('format_serial3');
$course = new stdClass();
$course->id = 2;
//$c = core_courseformat::get_format_options($course);
echo '<pre>';
print_r($c);
echo '</pre>';


