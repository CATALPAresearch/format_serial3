<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * 
 * @author Marc Burchart <marc.burchart@fernuni-hagen.de>
 * 
 */

namespace format_ladtopics\permission;

defined('MOODLE_INTERNAL') || die();


class context {

    protected $_context;
    protected $_userid;
    protected $_roles;

    function __construct($userid, $context){      
        require_login();
        $this->_context = $context;
        $this->_userid = $userid;
        $this->_roles = get_user_roles($this->_context, $this->_userid);
    }   

    public function isSiteAdmin(){
        return is_siteadmin($this->_userid);
    }

    public function isManager(){
        return $this->findRole('manager');
    }

    public function isCourseCreator(){
        return $this->findRole('coursecreator');
    }

    public function isEditingTeacher(){
        return $this->findRole('editingteacher');
    }

    public function isTeacher(){
        return $this->findRole('teacher');
    }

    public function isStudent(){
        return $this->findRole('student');
    }

    public function isGuest(){
        return is_guest($this->_context, $this->_userid);
    }

    public function isUser(){
        return $this->findRole('user'); 
    }

    public function isFrontPage(){
        return $this->findRole('frontpage'); 
    }

    public function findRole($shortname){
        foreach($this->_roles as $role){
            if(isset($role->shortname) && strtolower($role->shortname) === strtolower($name)){
                return true;
            }
        }
        return true;
    }

    public function hasViewCapability(){
        return is_viewing($this->_context, $this->_userid);
    }

    public function isEnrolled(){
        return is_enrolled($this->_context, $this->_userid);
    }

    public function isAnyKindOfModerator(){
        if(
            $this->isSiteAdmin() ||
            $this->isCourseCreator() ||
            $this->isManager() ||
            $this->isModerator() ||
            $this->isTeacher() ||
            $this->isEditingTeacher()
        ){
            return true;
        }
        return false;
    }

    public function getContext(){
        return $this->_context;
    }

    public function getCourseContext(){
        $context = $this->_context;
        return $context->get_course_context();
    }
}