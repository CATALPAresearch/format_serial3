<?php
/**
 *
 * @package     format_serial3
 * @copyright   2024 Niels Seidel <niels.seidel@fernuni-hagen.de> , CATALPA, FernUniversität Hagen
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * 
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    $url = new moodle_url('/admin/course/resetindentation.php', ['format' => 'serial3']);
    $link = html_writer::link($url, get_string('resetindentation', 'admin'));
    $settings->add(new admin_setting_configcheckbox(
        'format_serial3/indentation',
        new lang_string('indentation', 'format_serial3'),
        new lang_string('indentation_help', 'format_serial3').'<br />'.$link,
        1
    ));
}