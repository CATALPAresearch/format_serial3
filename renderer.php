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
 * Renderer for outputting the topics course format.
 *
 * @package format_topics
 * @copyright 2012 Dan Poltawski
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since Moodle 2.3
 */


defined('MOODLE_INTERNAL') || die();
require_once($CFG->dirroot.'/course/format/renderer.php');

/**
 * Basic renderer for topics format.
 *
 * @copyright 2012 Dan Poltawski
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class format_ladtopics_renderer extends format_section_renderer_base {

    /**
     * Constructor method, calls the parent constructor
     *
     * @param moodle_page $page
     * @param string $target one of rendering target constants
     */
    public function __construct(moodle_page $page, $target) {
        parent::__construct($page, $target);
        
        // Since format_topics_renderer::section_edit_controls() only displays the 'Set current section' control when editing mode is on
        // we need to be sure that the link 'Turn editing mode on' is available for a user who does not have any other managing capability.
        $page->set_other_editing_capability('moodle/course:setcurrentsection');
    }


    /**
     * A Attribute to store if the user is a moderator for the course
     */
    private $_moderator = null;
    private $courseid;
    private $found;
    private $islogged;

    /**
     * A Method to test if the user is a moderator for the course
     */

    private function checkModeratorStatus(){
        if(!is_null($this->_moderator)) return $this->_moderator;
        try{
            global $USER, $COURSE;      
            $context = context_course::instance($COURSE->id);            
            $loggedIn = isloggedin();
            $roles = get_user_roles($context, $USER->id);                 
            $found = false;
            if(is_siteadmin($USER->id)){
                return true;
            }
            foreach($roles as $key => $value){
                if(isset($value->shortname)){
                    if($value->shortname === "manager" || $value->shortname === "coursecreator"){
                        $found = true;
                        break;
                    }                    
                }
            }    
            $this->courseid = $COURSE->id;
            $this->found = $found;
            $this->islogged = $loggedIn;            
            if($found === true && $loggedIn === true) return true;            
            return false;        
        } catch(Exception $ex){
            var_dump($ex);
            return false;
        }    
    }

    private function checkForSurveys(){

        
        return '<div class="alert alert-check" role="alert"><a href="'.new moodle_url('/course/format/ladtopics/survey.php').'">Bitte</a></div>';
    }

    /**
     * Generate the starting container html for a list of sections
     * @return string HTML to output.
     */
    protected function start_section_list() {
        global $CFG, $DB, $PAGE, $COURSE;
        require_once($CFG->libdir.'/completionlib.php');
        //$completion=new completion_info($COURSE);
        //$rr = $completion->get_completions(3);
        //print_r($rr);
        //print_r($COURSE);



        $userMSPlan = '
        <div class="modal fade" id="moderationModal" tabindex="-1" role="dialog" aria-labelledby="moderationModalLabel" aria-hidden="false">
            <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="moderationModalTitle">Einstellungen</h5>                                     
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body">
                    <div class="alert collapse fade" id="moderationAlert" data-dismiss="alert" role="alert">
                        This is a success alert—check it out!
                    </div>          
                    <h5>Eingangsbefragung</h5>         
                    <button type="button" @click="modResetPlan()" class="btn btn-danger">Löschen und noch einmal durchführen</button> 
                    <hr>                     
                    <h5>Meilensteine</h5>                        
                    <div class="col mb-4 px-0">
                        <div class="custom-file">
                            <input type="file" class="custom-file-input" @input="modLoadPath" id="modImportedFile" lang="de">
                            <label id="modLoadPathLabel" class="custom-file-label" for="modImportedFile">Bitte wählen Sie eine Datei aus.</label>
                        </div>
                    </div>      
                    <button type="button" @click="modSaveSelect" class="btn btn-primary">Speichern</button>                                     
                    <button type="button" @click="modLoadMilestones()" class="btn btn-secondary">Laden</button>  
                    <button type="button" @click="modResetSelect()" class="btn btn-danger">Zurücksetzen</button>                      
                </div>          
                <div class="modal-footer">
                    <!-- Footer -->
                </div>
            </div>
            </div>
        </div>        
        ';

        $moderationModal = '    
            <div class="modal fade" id="moderationModal" tabindex="-1" role="dialog" aria-labelledby="moderationModalLabel" aria-hidden="false">
                <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="moderationModalTitle">Administration</h5>                                     
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                        <div class="alert collapse fade" id="moderationAlert" data-dismiss="alert" role="alert">
                            This is a success alert—check it out!
                        </div>              
                        <h5>Mein Meilensteine als Planungsvorlage speichern</h5>
                        Vorlage für folgende Zielsetzung der Eingangsbefragung speichern: 
                        <div class="my-2 mx-2">  
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveExam" value="0">
                                <label class="form-check-label" for="modSaveExam">
                                Prüfung
                                </label>
                            </div>   
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveOrientation" value="1">
                                <label class="form-check-label" for="modSaveOrientation">
                                Orientierung
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="modSaveType" id="modSaveInterest" value="2">
                                <label class="form-check-label" for="modSaveInterest">
                                Interesse am Themengebiet
                                </label>
                            </div>                           
                        </div>
                        <button type="button" @click="modSaveSelect" class="btn btn-primary">Speichern</button>    
                        <button type="button" @click="modResetSelect" class="btn btn-danger">Zurücksetzen</button>                   
                        <hr>                        
                        <h5>Meilensteine exportieren und importieren</h5>
                        <div class="alert collapse fade" id="moderationAlertExpInp" data-dismiss="alert" role="alert">
                            This is a success alert—check it out!
                        </div>
                        <div class="col mb-4 px-0">
                            <button type="button" @click="modExportMilestones" class="btn btn-secondary">Meine Meilensteine exportieren</button>  
                        </div>                     
                        <div class="col mb-4 px-0">
                            <div class="custom-file">
                                <input type="file" class="custom-file-input" @input="modLoadPath" id="modImportedFile" lang="de">
                                <label id="modLoadPathLabel" class="custom-file-label" for="modImportedFile">Bitte wählen Sie eine Datei aus.</label>
                            </div>
                        </div>                        
                        <button type="button" @click="modLoadMilestones" class="btn btn-secondary">Importieren</button>  
                        <hr>   
                        <h5>Zurücksetzen von Meilensteinen und Eingangsbefragung</h5> 
                        <div class="alert collapse fade" id="moderationAlertUser" data-dismiss="alert" role="alert">
                            This is a success alert—check it out!
                        </div>       
                        <div class="form-group">                                 
                            <input type="string" @input="userAutocomplete($event.target, $event.target.value)" class="form-control" id="modResetUser" placeholder="Benutzer suchen">
                            </div>
                        <div class="userAutocomplete col px-2"></div>                           
                            <div class="col mb-3 px-2">                                
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="modResetUserPlan">
                                    <label class="form-check-label" for="modResetUserPlan">
                                        Eingangsbefragung der ausgewählten Nutzer zurücksetzen
                                    </label>
                                </div> 
                            <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="modResetUserMS">
                                    <label class="form-check-label" for="modResetUserMS">
                                        Alle Meilensteine der ausgewählten Nutzer löschen
                                    </label>
                            </div>                                                     
                        </div>                        
                        <button type="button" @click="modUpdateUser" class="btn btn-danger">Löschen / zurücksetzen</button>                         
                    </div>          
                    <div class="modal-footer">
                        <!-- Footer -->
                    </div>
                </div>
                </div>
            </div>
            <div class="modal fade" id="reportModal" tabindex="-1" role="dialog" aria-labelledby="reportModal" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="moderationModalTitle">Statistik</h5>                                     
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="modReport">
                            <div class="statistic-container"> 
                                <!-- Allgemein -->
                                <div class="table-responsive"> 
                                    <table class="table" border="0">
                                        <tr>
                                            <th colspan="2">
                                                Allgemein
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Studierende, die die Semesterplanung erledigt haben</td>                                            
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptSum}}</td>                                            
                                        </tr>
                                        <tr>
                                            <td>Studierende, die Meilensteine angelegt haben</td>                                            
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptMS}}</td>                                            
                                        </tr>
                                        <tr class="table-secondary">
                                            <td>Einschreibungen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptUser}}</td>
                                        </tr>
                                    </table>
                                </div>    
                                <!-- Plan -->                          
                                <div class="table-responsive">                                    
                                    <table class="table" border="0">
                                        <tr>
                                            <th colspan="2">
                                                Ziele der Teilnehmer
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Prüfung erfolgreich absolvieren</td>                                            
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptExam}}</td>                                            
                                        </tr>                                
                                        <tr>
                                            <td>Orientierung im Themengebiet erlangen </td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptOrientation}}</td>
                                        </tr>
                                        <tr>
                                            <td>Meinen eigenen Interessen bzgl. bestimmter Themengebiete nachgehen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptInterest}}</td>
                                        </tr>
                                        <tr>
                                            <td>Keine Angaben </td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptNoAnswer}}</td>
                                        </tr>  
                                        <tr>                                     
                                            <td colspan="2" id="stChartTA"></td>
                                        </tr>
                                    </table>
                                </div>
                                <!-- Stunden -->
                                <div class="table-responsive">
                                    <table class="table" border="0" id="modWorkload">
                                        <tr>
                                            <th colspan="2">
                                                Stundenpensum
                                            </th>
                                        </tr>
                                        <tr>
                                            <td colspan="2" id="stChartHR"></td>
                                        </tr>
                                    </table>
                                </div>
                                <!-- Planung von Lernaktivitäten -->
                                <div class="table-responsive">
                                     <table class="table" border="0">
                                        <tr>
                                            <th colspan="2">
                                                Planung von Lernaktivitäten
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Für eine Woche</td>                                            
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptW1}}</td>                                            
                                        </tr>                                
                                        <tr>
                                            <td>Für die nächsten 4 Wochen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptW4}}</td>
                                        </tr>
                                        <tr>
                                            <td>Für das ganze Semester mit Arbeitspaketen für je eine Woche</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptWA}}</td>
                                        </tr>
                                        <tr>
                                            <td>Für das ganze Semester mit Arbeitspaketen für je 2 Wochen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptWA2}}</td>
                                        </tr> 
                                        <tr>
                                            <td>Für das ganze Semester mit Arbeitspaketen für je einen Monat</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptWA4}}</td>
                                        </tr> 
                                        <tr>
                                            <td>Keine Angaben </td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.ptWANA}}</td>
                                        </tr>  
                                        <tr>                                     
                                            <td colspan="2" id="stChartPS"></td>
                                        </tr>
                                    </table>
                                </div>
                                <!-- Milestones -->                          
                                <div class="table-responsive">                                    
                                    <table class="table" border="0">
                                        <tr>
                                            <th colspan="2">
                                                Meilensteine
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Bearbeitung</td>                                            
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.msProgessed}}</td>                                            
                                        </tr>                                
                                        <tr>
                                            <td>Dringend</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.msUrgent}}</td>
                                        </tr>
                                        <tr>
                                            <td>Abgeschlossen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.msReady}}</td>
                                        </tr>
                                        <tr>
                                            <td>Reflektiert</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.msReflected}}</td>
                                        </tr>
                                        <tr>
                                            <td>Abgelaufen</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.msMissed}}</td>
                                        </tr>
                                        <tr class="table-secondary">
                                            <td>Gesamt</td>
                                            <td style="padding-right: 30px; text-align: right;">{{modStatistics.milestones}}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" id="stChartMS"></td>
                                        </tr>
                                    </table>
                                </div>  
                                <!-- XY -->
                                <div class="table-responsive">
                                    <table class="table" border="0" id="stUserList">
                                        <tr>
                                            <th colspan="8">
                                                Übersicht der Einschreibungen
                                            </th>
                                        </tr> 
                                        <tr>
                                            <td><b>Vorname</b></td>
                                            <td><b>Nachname</b></td>
                                            <td><b>E-Mail</b></td>
                                            <td><b>Planung</b></td>
                                            <td><b>Angelegte MS</b></td>
                                            <td><b>Abgelaufene MS</b></td>
                                            <td><b>Abgeschlossene MS</b></td>                                            
                                            <td><b>Reflektierte MS</b></td>  
                                        </tr>                                                                 
                                    </table>
                                </div>                                                           
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ';





// TODO: this is a dupplication of code !!
$milestoneArchiveList = '
<!-- Milestone list -->
<ul>    
    <li v-if="archivedMilestones.length > 0">
        <div class="milestone-element-header">
            <div class="milestone-element-table-head name">Meilenstein</div><div class="milestone-element-table-head due">Termin</div><div class="milestone-element-table-head">Fortschritt</div>
        </div>
    </li>
    <li v-for="m in archivedMilestones" class="milestone-element">
        <div :class="m.status == \'urgent\' ? \'milestone-urgent milestone-element-header\' : \'milestone-element-header\'">
            <a :class="m.status == \'missed\' ? \'milestone-missed milestone-element-name\' : \'milestone-element-name\'" data-toggle="collapse" :href="\'#milestone-entry-archive-\' + m.id" role="button" aria-expanded="false" :aria-controls="\'milestone-entry-\' + m.id">
                <i class="element-collapsed fa fa-angle-right angle"></i> 
                <i class="element-not-collapsed fa fa-angle-down angle"></i> 
                '.($this->checkModeratorStatus()?"<span v-if=\"m.mod\" class=\"fa fa-globe\"></span>":"").'
                {{ m.name }}
            </a>           
            <span
                data-toggle="tooltop" data-placement="top" :title="\'Beginn: \' + getReadableTime(m.start) + \', Ende: \' + getReadableTime(m.start)" 
                :class="m.status == \'missed\' ? \'milestone-missed milestone-element-due\' : \'milestone-element-due\'">
                {{ fromNow(m.end) }}
            </span>
            <span class="ms-edit-filler" v-if="m.status === \'reflected\'"></span>
            <a @click="showModal(m.id)" v-if="m.status !== \'reflected\'" class="milestone-element-edit" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal">
                <span data-toggle="tooltip" data-placement="top" title="Sie können diesen Meilenstein bearbeiten" class="fa fa-pencil"></span> bearbeiten
            </a>
            <div class="milestone-element-progress">
                <div class="milestone-element-progress-status" 
                    :style="\'width:\'+ m.progress * 100 + \'%;\'"
                    data-toggle="tooltip" data-placement="top" :title="\'Dieser Meilenstein ist zu \'+ (m.progress*100).toFixed(0) +\'% fertig.\'"
                ></div>
            </div>
            <div class="milestone-element-status">
                <i 
                    :class="m.status==\'ready\' || m.status==\'reflected\' ? \'fa fa-check milestone-ready\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'ready\' || m.status==\'reflected\' ? \'Diesen Meilenstein haben Sie bereits erreicht!.\' : \'Sie haben diesen Meilenstein noch nicht abgeschlossen.\'"
                    ></i>
                <i 
                    :class="m.status==\'reflected\' ? \'fa fa-check milestone-reflected\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'reflected\' ? \'Großartig! Sie haben diesen Meilenstein bereits reflektiert.\' : \'Sie haben diesen Meilenstein noch nicht reflektiert.\'"
                    ></i>
            </div>
            <div v-if="m.progress === 1" class="milestone-element-reflection">
                <button 
                    data-toggle="modal" 
                    data-target="#theReflectionModal" 
                    @click="showReflectionModal(m.id)" 
                    :class="m.status==\'reflected\' ? \'btn btn-sm reflection-done\' : \'btn btn-primary btn-sm\'"
                    >
                        <span v-if="m.status!=\'reflected\'">Jetzt reflektieren!</span>
                        <span v-if="m.status==\'reflected\'">Reflexion ansehen</span>
                </button>
            </div>
        </div>
        <div class="milestone-entry-details collapse" :id="\'milestone-entry-archive-\' + m.id">
            <div>
                <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="m.resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-2">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in m.resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check checkbox" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        :id="s.id"
                                        :disabled = "m.status === \'reflected\'"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <a v-if="s.instance_type !== \'freeText\'" 
                                        :href="(s.instance_type === \'kurstermin\'?(getMoodlePath() + \'/calendar/view.php?month&course=\' + '.$COURSE->id.'):(getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id))" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span v-if="s.instance_type === \'freeText\'" class="resources-selected-name">{{ s.name }}</span>
                                    <span hidden class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>
                                
                            </li>
                        </ul>
            </div>
        </div>
    </li>
</ul>
<!-- End Milestone list -->
';

$milestoneList = '
<!-- Milestone list -->

<ul>
    <li v-if="remainingMilestones.length > 0">
        <div class="milestone-element-header">
            <div class="milestone-element-table-head name">Meilenstein</div><div class="milestone-element-table-head due">Termin</div><div class="milestone-element-table-head">Fortschritt</div>
        </div>
    </li>
    <li v-for="m in remainingMilestones" class="milestone-element">
        <div :class="m.status == \'urgent\' ? \'milestone-urgent milestone-element-header\' : \'milestone-element-header\'">
            <a :class="m.status == \'missed\' ? \'milestone-missed milestone-element-name\' : \'milestone-element-name\'" data-toggle="collapse" :href="\'#milestone-entry-\' + m.id" role="button" aria-expanded="false" :aria-controls="\'milestone-entry-\' + m.id">
                <i class="element-collapsed fa fa-angle-right angle"></i> 
                <i class="element-not-collapsed fa fa-angle-down angle"></i> 
                '.($this->checkModeratorStatus()?"<span v-if=\"m.mod\" class=\"fa fa-globe\"></span>":"").'
                {{ m.name }}                
            </a>
            <span
                data-toggle="tooltop" data-placement="top" :title="\'Beginn: \' + getReadableTime(m.start) + \', Ende: \' + getReadableTime(m.start)" 
                :class="m.status == \'missed\' ? \'milestone-missed milestone-element-due\' : \'milestone-element-due\'">
                {{ fromNow(m.end) }}
            </span>
            <span class="ms-edit-filler" v-if="m.status === \'reflected\'"></span>
            <a @click="showModal(m.id)" v-if="m.status !== \'reflected\'" class="milestone-element-edit" data-legend="1" data-toggle="modal" data-target="#theMilestoneModal">
                <span data-toggle="tooltip" data-placement="top" title="Sie können diesen Meilenstein bearbeiten" class="fa fa-pencil"></span> bearbeiten
            </a>
            <div class="milestone-element-progress">
                <div class="milestone-element-progress-status" 
                    :style="\'width:\'+ m.progress * 100 + \'%;\'"
                    data-toggle="tooltip" data-placement="top" :title="\'Dieser Meilenstein ist zu \'+ (m.progress*100).toFixed(0) +\'% fertig.\'"
                ></div>
            </div>
            <div class="milestone-element-status">
                <i 
                    :class="m.status==\'ready\' || m.status==\'reflected\' ? \'fa fa-check milestone-ready\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'ready\' || m.status==\'reflected\' ? \'Diesen Meilenstein haben Sie bereits erreicht!.\' : \'Sie haben diesen Meilenstein noch nicht abgeschlossen.\'"
                    ></i>
                <i 
                    :class="m.status==\'reflected\' ? \'fa fa-check milestone-reflected\' : \'fa fa-check grey\'"
                    data-toggle="tooltip" data-placement="top" :title="m.status==\'reflected\' ? \'Großartig! Sie haben diesen Meilenstein bereits reflektiert.\' : \'Sie haben diesen Meilenstein noch nicht reflektiert.\'"
                    ></i>
            </div>
            <div v-if="m.progress === 1" class="milestone-element-reflection">
                <button 
                    data-toggle="modal" 
                    data-target="#theReflectionModal" 
                    @click="showReflectionModal(m.id)" 
                    :class="m.status==\'reflected\' ? \'btn btn-sm reflection-done\' : \'btn btn-primary btn-sm\'"
                    >
                        <span v-if="m.status!=\'reflected\'">Jetzt reflektieren!</span>
                        <span v-if="m.status==\'reflected\'">Reflexion ansehen</span>
                </button>
            </div>
        </div>
        <div class="milestone-entry-details collapse" :id="\'milestone-entry-\' + m.id">
            <div>
                <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="m.resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-2">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in m.resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check checkbox" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        :id="s.id"
                                        @change="updateMilestoneStatus()"
                                        >
                                    <a v-if="s.instance_type !== \'freeText\'" 
                                        :href="(s.instance_type === \'kurstermin\'?(getMoodlePath() + \'/calendar/view.php?month&course=\' + '.$COURSE->id.'):(getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id))" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span v-if="s.instance_type === \'freeText\'" class="resources-selected-name">{{ s.name }}</span>
                                    <span hidden class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>                                
                            </li>
                        </ul>        
            </div>
        </div>
    </li>
</ul>
<!-- End Milestone list -->
';


$milestoneTimeline = '
<!-- Timeline charts -->
<div class="relative milestone-chart-container">
    <div class="chart-label-milestone" :style="\'height:\'+(height+margins.top)+\'px;\'"></div>
    <svg style="border: none;" :width="width" :height="height+margins.top">
        <g :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <rect v-for="m in milestones" @click="showModal(m.id)" class="milestone-learning-progress"
                :x="xx(m.start)" :y="m.yLane * (barheight + bardist)" :height="barheight"
                :width="duration(m.start, m.end) * m.progress" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <rect v-for="m in milestones" @click="showModal(m.id)"
                :class="\'milestone-bar milestone-\'+ m.status" :id="\'milestoneBar_\'+m.id"
                :x="xx(m.start)" :y="getYLane(m.id) * (barheight + bardist)" :height="barheight"
                :width="duration(m.start, m.end)" :data-legend="m.id" data-toggle="modal" data-target="#theMilestoneModal">
            </rect>
            <text v-for="m in milestones" @click="showModal(m.id)" class="milestone-label"
                :x="xx(m.start) + duration(m.start, m.end) / 2" :y="getYLane(m.id) * (barheight + bardist) + (barheight)/2 + 2"
                data-toggle="modal"
                data-target="#theMilestoneModal">{{ limitTextLength( m.name, 14 ) }}</text>
        </g>
        <g class="grid-line horizontal"
            :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <line v-for="m in [0,1,2]" x1="1" :y1="m * (barheight + bardist) + barheight/2" :x2="width"
                :y2="m * (barheight + bardist) + barheight/2" opacity="0.5"></line>
        </g>
        <g class="today"
            :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top +\')\'">
            <line class="today-line" :x1="xx(new Date(Date.now()))" y1="0" :x2="xx(new Date(Date.now()))" :y2="height"></line>
            <text class="today-label" y="10" :x="xx(new Date(Date.now())) + 4">heute</text>                                               
        </g>
        <!--<g id="title-label">
        <text :transform="\'translate(\'+( margins.left  ) +\',\'+ margins.top+100 +\')\'"
                style="fill:#000000;" 
                transform="matrix(0,-1,1,0,0,0)" id="text3338" y="0" x="0">
            Meilenstein</text>    
        <rect
            y="0"
            x="0"
            :height="height + margins.top + margins.bottom"
            width="20"
            id="rect3336"
            style="opacity:1;fill:#004C97;fill-opacity:1;stroke:none;" />
            
        </g>-->
    </svg>
</div>
<!-- End Timeline charts -->';


$modalReflection = '
<!-- Reflection modal form -->
<div id="theReflectionModal" class="modal" tabindex="-1" role="dialog">
    <div v-if="modalReflectionVisible" class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="MilestoneModalLabel">Reflexion des Meilensteins
                    "{{ getSelectedMilestone().name }}"</h5>
                <button @click="closeReflectionModal()" type="button" class="close" data-dismiss="modal"
                    aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body row">
                <div class="ms-reflection col-12">
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref0">
                            Frage 1: Wie gut hat mir die Planung dieses Meilensteins bei der Erarbeitung meines Lernziels geholfen?
                        </label>
                        <div class="col-sm-12">
                            <div class="row likert-row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1a" value="1" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1a">1 (sehr gut)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1b" value="2" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1c" value="3" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1d" value="4" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion1" id="ref1e" value="5" v-model="getSelectedMilestone().reflections[0]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref2">
                            Frage 2: Wie zufrieden war ich mit meiner Lernstrategie, um mein Lernziel zu erreichen?
                        </label>
                        <div class="col-sm-12">
                            <div class="row likert-row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2a" value="1" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1a">1 (sehr zufrieden)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2b" value="2" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2c" value="3" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2d" value="4" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion2" id="ref2e" value="5" v-model="getSelectedMilestone().reflections[1]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht zufrieden)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref2">
                            Frage 3: Wie gut konnte ich meinen Zeitplan einhalten?
                        </label>
                        <div class="col-sm-12">
                            <div class="row likert-row">
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3a" value="1" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1a">1 (sehr gut)</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3b" value="2" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">2</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3c" value="3" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">3</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3d" value="4" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">4</label>
                                </div>
                                <div class="col">
                                    <input class="form-check-input" type="radio" name="refquestion3" id="ref3e" value="5" v-model="getSelectedMilestone().reflections[2]">
                                    <label class="form-check-label" for="ref1e">5 (gar nicht)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group col-12">
                        <label class="col-sm-12 col-form-label question-label" for="ref4">
                            Frage 4: Wie möchte ich meine Arbeitsweise verbessern? Das sind meine Lernhinweise für die Zukunft:
                        </label>
                        <div class="">
                            <textarea v-model="getSelectedMilestone().reflections[3]"
                                cass="form-control" id="ref4" rows="2"></textarea>
                        </div>
                    </div>
                </div>
                <div v-if="invalidReflections.length === 1" class="col-12 alert-invalid">Bitte beantworten Sie auch die Frage {{ invalidReflections[0] }}.</div>
                <div v-if="invalidReflections.length === 2" class="col-12 alert-invalid">Bitte beantworten Sie auch die Fragen {{ invalidReflections[0] }} und {{ invalidReflections[1] }}.</div>
                <div v-if="invalidReflections.length > 2" class="col-12 alert-invalid">Bitte beantworten Sie auch die Fragen {{ invalidReflections.join(", ") }}.</div>
                
                <div class="form-group col-12">
                    <button 
                        @click="validateReflectionForm()" 
                        class="btn btn-primary btn-sm"
                        >
                            Reflexion abschließen
                        </button>
                </div>
            </div>
        </div>
    </div>
</div>
';


$modalMilestone = '
<!-- Modal milestone -->
<div id="theMilestoneModal" class="modal" tabindex="-1" role="dialog">
    <div v-if="modalVisible" class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-header-completion"
                    :style="\'width:\'+ (getSelectedMilestone().progress * 100) +\'%;\'">
                    <div class="modal-header-completion-label">
                        {{ (getSelectedMilestone().progress * 100) }}%</div>
                </div>
                <h5 class="modal-title" id="MilestoneModalLabel">Meilenstein:
                    {{ getSelectedMilestone().name }}</h5>
                <span v-if="getSelectedMilestone().name !== \'\'">
                    <i @click="removeMilestone()" class="fa fa-trash ms-remove"
                        title="Meilenstein entfernen"></i>
                </span>
                <button id="close-modal" @click="closeModal()" type="button" class="close" data-dismiss="modal"
                    aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-12">
                        Mit einem Meilenstein planen Sie eines Ihrer Lern- oder Arbeitsziele, welches zu
                        einem selbst gewählten Termin erreicht werden soll.
                    </div>
                </div>
                <hr />
                <div class="form-group row">
                    <label for="inputMSname" class="col-sm-2 col-form-label">Titel *</label>
                    <div class="col-sm-10">
                        <input @change="updateName" :style="invalidName ? \'border: solid 1px #ff420e;\' : \'\'" v-model="getSelectedMilestone().name" type="text" class="form-control"
                            id="inputMSname" placeholder="Name des Meilensteins">
                    </div>
                    <div class="col-sm-10 alert-invalid" v-if="invalidName">Geben Sie bitte einen Namen für den Meilenstein an.</div>
                </div>
                <div class="form-group row">
                    <label for="inputLearningObjective" class="col-sm-2 col-form-label">Lernziel *</label>
                    <div class="col-sm-10">
                        <input @change="updateObjective" :style="invalidObjective ? \'border: solid 1px #ff420e;\' : \'\'" v-model="getSelectedMilestone().objective" type="text"
                            class="form-control" id="inputLearningObjective"
                            placeholder="Welches Lernziel verfolgen Sie?">
                    </div>
                    <div class="col-sm-10 alert-invalid" v-if="invalidObjective">Geben Sie bitte ein Lernziel an.</div>
                </div>
                <div class="form-group row">
                    <label for="" class="col-2 col-form-label">Beginn *</label>
                    <div class="col-4">
                        <datepicker id="startDP" :value="startDate" format="dd MMMM yyyy" :language="DPde" :disabled-dates="dpRange" @input="validateStartDate"></datepicker>                       
                    </div>
                    <div v-if="invalidStartDate" class="col-sm-10 alert-invalid">Wählen Sie bitte ein passendes Datum aus.</div>
                </div>
                <div class="form-group row">
                    <label for="" class="col-2 col-form-label">Termin *</label>
                    <div class="col-4">
                        <datepicker id="endDP" :value="endDate" format="dd MMMM yyyy" :language="DPde" :disabled-dates="dpRange" @input="validateEndDate"></datepicker>                       
                    </div>
                    <div v-if="invalidEndDate" class="col-sm-10 alert-invalid">Wählen Sie bitte ein passendes Datum aus. Der Termin muss nach dem Beginn liegen! </div>
                </div>
                <hr />
                <div class="row">
                    <div id="resources" class="col-md-6">
                        <!-- Resourcen -->
                        <label for="" class="resources-title">Meine Themen, Materialien und Aktivitäten</label>
                        <div v-if="getSelectedMilestone().resources.length > 0" class="resources-header">
                            <span class="strat-col-1">erledigt?</span>
                            <span class="strat-col-1">Meine Materialien und Aktivitäten</span>
                        </div>
                        <ul class="resources-list">
                            <li v-for="s in getSelectedMilestone().resources" :class="s.checked ? \'resources-selected-item ms-done\' : \'resources-selected-item ms-not-done\'">
                                <label class="resources-selected-label" for="defaultCheck1">
                                    <input class="resources-selected-check" 
                                        type="checkbox" value=""
                                        data-toggle="tooltip"
                                        title="Setzen Sie das Häkchen, wenn Sie dieses Lernangebot bereits bearbeitet haben."
                                        v-model="s.checked" 
                                        v-bind:id="s.id"
                                        >
                                    <a v-if="s.instance_type !== \'freeText\'" 
                                        :href="getMoodlePath() + \'/mod/\' + s.instance_type + \'/view.php?id=\'+ s.instance_url_id" 
                                        class="resources-selected-name">{{ s.name }}</a>
                                    <span v-if="s.instance_type === \'freeText\'" class="resources-selected-name">{{ s.name }}</span>
                                    <span class="resources-selected-remove remove-btn" data-toggle="tooltip" title="Thema, Material oder Aktivität entfernen">
                                        <i class="fa fa-trash" @click="resourceRemove(s.id)"></i>
                                    </span>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="select-wrapper" :style="invalidResources ? \'border: solid 1px #ff420e;\' : \'none\'">
                            <span id="before-select"><i class="fa fa-plus"></i> </span>
                            <select @change="resourceSelected" id="modal_strategy-select">
                                <option :selected="true" disabled value="default">Wählen Sie Themen, Materialien und Aktivitäten</option>
                                <optgroup v-for="section in resourceSections()" :label="section.name">
                                    <option v-for="s in resourcesBySection(section.id)" :value="s.id">{{ getInstanceTypeTitel(s.instance_type) }}: {{ s.name }}</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="col-sm-10 alert-invalid" v-if="invalidResources">Wählen Sie bitte Themen, Materialien und Aktivitäten aus.</div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group align-top mb-auto">
                            <input v-model="freeTextRessource" type="text" class="form-control p-1" id="freeRessource" aria-describedby="ressourceHelp" placeholder="..." style="border: 1px #004c97 solid;">
                            <small hidden id="ressourceHelp" class="form-text text-muted">Notieren Sie sich hier andere Lernmaterialien, die Sie verwenden möchten.</small>
                            <button class="btn btn-sm btn-default mt-1" v-on:click="addFreeTextRescource()">Andere Lernmaterialien hinzufügen</button>
                        </div>
                    </div>
                </div>
                <hr />
                <div hidden class="row">
                    <div class="col-md">
                        <button @click="toggleReflectionsForm()"
                            :class="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? \'btn btn-primary\' : \'btn disabled\'"
                            :disabled="getSelectedMilestone().progress === 1 && ! reflectionsFormVisisble ? false : true">
                            Reflexion beginnen
                        </button>
                    </div>
                </div>
                <!-- Save new milestone-->
                <div class="row row-smooth">
                    <div class="col-md">
                        <div>
                            <button @click="validateMilestoneForm()" class="btn btn-primary btn-sm">
                                Speichern
                            </button>
                            <!--<button class="right btn btn-link" data-dismiss="modal" aria-label="abbrechen">abbrechen</a>-->
                            <!--<button class="right btn btn-link red" data-dismiss="modal" ria-label="entfernen">entfernen</a>-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- End Modal milestone -->
';









        $content = '

            </div>
            </div>
                    </div>
                </div>
            </div>
        
        </section>
    </div>
</div>



<div id="page-content" class="row">
    <div class="region-main-box col-12 ladtopics-region-main">
        <section id="region-main" class="ladtopics-region">
            <div class="card">
                <div class="card-body ladtopics">
                    <div id="ladtopic-container-0" class="course-content">
                        <span hidden id="courseid">'. $COURSE->id .'</span>
                        
                        <initial-survey></initial-survey>

                        <!-- Planing Component -->
                        <div id="planing-component" style="display:none;" v-cloak class="container dc-chart">
                            '.($this->checkModeratorStatus()?$moderationModal:$userMSPlan).'
                            <div>
                                <div v-if="surveyDone > 0" class="row">
                                    <div class="col-12">
                                        <!-- Milestone chart -->
                                        <div class="chart ms-chart">
                                            <div class="ms-chart-header row">
                                                <h3 class="ms-headline">Meine Semesterplanung</h3>
                                                <div class="ms-title col-sm-12 col-xs-12 col-md-12 col-lg-12">
                                                    <ul class="nav nav-pills ladtopics-pills" id="viewPillsTab" role="tablist">
                                                        <li>                                                             
                                                            <span v-if="milestones.length > 0" data-toggle="modal" data-target="#theMilestoneModal">
                                                                <button @click="showEmptyMilestone()" id="add-milestone" class="btn btn-sm right btn-primary ms-btn ms-add"
                                                                    data-toggle="tooltip" data-placement="bottom" title="Neuen Meilenstein hinzufügen"><i
                                                                        class="fa fa-plus"></i> Neuer Meilenstein</button>
                                                            </span>
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link active" @click="hideAdditionalCharts(\'list\')" id="milestone-list-tab" data-toggle="pill" href="#view-list" role="tab" aria-controls="view-list" aria-selected="false">
                                                                <i hidden class="fa fa-list"></i> Aktuelle Meilensteine <span>({{remainingMilestones.length}})</span>
                                                            </a>                                                            
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link" @click="showAdditionalCharts()" id="milestone-timeline-tab" data-toggle="pill" href="#view-timeline" role="tab" aria-controls="view-timeline" aria-selected="true">
                                                                <i class="fa fa-clock mr-1"></i>Zeitleiste
                                                            </a>
                                                        </li>
                                                        <li v-if="milestones.length > 0" class="nav-item">
                                                            <a 
                                                                class="nav-link" @click="hideAdditionalCharts(\'archive\')" id="milestone-archive-list-tab" data-toggle="pill" href="#view-archive-list" role="tab" aria-controls="view-archive-list" aria-selected="false">
                                                                <i hidden class="fa fa-list"></i> Archiv <span>({{archivedMilestones.length}})</span>
                                                            </a>
                                                        </li>                                                                                                        
                                                    </ul>                                           
                                                    
                                    
                                                    <div class="dropdown settingsMenu" style="float: right;">
                                                        <button v-if="surveyDone > 0" class="btn btn-link" @click="startIntroJs()" style="padding: 0px 0px 5.5px 5px; margin: 0px -5px 0px 0px;">
                                                            <i class="fa fa-question-circle"></i>
                                                        </button>
                                                        <button class="btn btn-link dropdown-toggle" v-on:click="log(\'setting_menu_open\')" type="button" id="settingsMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expand="false">
                                                        <i class="fa fa-cog"></i>
                                                        </button>
                                                        <div class="dropdown-menu" aria-labeledby="settingsMenuButton">
                                                        '.($this->checkModeratorStatus()?'
                                                            <a class="dropdown-item" v-on:click="log(\'teacher_settings_administration_open\')" data-toggle="modal" data-target="#moderationModal" href="#">
                                                                <i class="fa fa-clock mr-1"></i>Administration
                                                            </a>
                                                            <a class="dropdown-item" v-on:click="log(\'teacher_settings_analytics_open\')" data-toggle="modal" data-target="#reportModal" href="#">
                                                                <i class="fa fa-clock mr-1"></i>Analytics
                                                            </a>':
                                                            '<a class="dropdown-item"  v-on:click="log(\'user_setting_open\')" data-toggle="modal" data-target="#moderationModal" href="#">
                                                                <i class="fa fa-clock mr-1"></i>Einstellungen
                                                            </a>').'                                                            
                                                            <milestone-calendar-export v-on:log="log" v-bind:milestones="milestones" v-bind:calendar="calendar"></milestone-calendar-export>                                                         
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                                <div id="filter-presets" class="col-sm-12 col-md-12 col-lg-12 time-filters">
                                                    <button @click="setFilterPreset(\'next-month\')" :style="filterPreset === \'next-month\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">nächster Monat</button>
                                                    <button @click="setFilterPreset(\'next-week\')" :style="filterPreset === \'next-week\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">nächste Woche</button>
                                                    <button @click="setFilterPreset(\'today\')" :style="filterPreset === \'today\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm ms-btn btn-link right">heute</button>
                                                    <button @click="setFilterPreset(\'last-week\')" :style="filterPreset === \'last-week\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm btn-link ms-btn right">letzte
                                                        Woche</button>
                                                    <button @click="setFilterPreset(\'last-month\')" :style="filterPreset === \'last-month\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-sm btn-link ms-btn right">letzten 4
                                                        Wochen</button>
                                                    <button @click="setFilterPreset(\'semester\')" :style="filterPreset === \'semester\' ? \'text-decoration: underline;\' : \'text-decoration:none;\'" class="btn btn-link btn-sm right">{{ getSemesterShortName() }}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="milestones.length <= 0">
                                        <span data-toggle="modal" data-target="#theMilestoneModal">
                                            <div class="col-12"><button @click="showEmptyMilestone()" class="btn btn-sm right btn-primary ms-btn ms-coldstart-btn"
                                                data-toggle="tooltip" data-placement="bottom" title="Neuen Meilenstein hinzufügen"><i
                                                    class="fa fa-plus"></i> Legen Sie einen neuen Meilenstein an!</button></div>
                                        </span>
                                    </div>
                                    <!-- Pill content -->
                                    <div class="tab-content" id="pills-tabContent">
                                        <div class="tab-pane col-12 fade" id="view-timeline" role="tabpanel" aria-labelledby="view-timeline">
                                            ' . $milestoneTimeline . '
                                        </div>
                                        <div class="tab-pane col-12 fade show active milestone-list" id="view-list" role="tabpanel" aria-labelledby="view-list">
                                            ' . $milestoneList . '
                                        </div>
                                        <div class="tab-pane col-12 fade milestone-list" id="view-archive-list" role="tabpanel" aria-labelledby="view-archive-list">
                                            ' . $milestoneArchiveList . '
                                        </div>
                                    </div>
                                    <!-- End pill content -->
                                

                                    ' . $modalMilestone . '
                                    ' . $modalReflection . '
                                </div>
                                <!-- end row -->

                                <div id="additionalCharts" class="row">
                                    <div class="activity-chart-container">
                                        <div class="relative">
                                            <div class="chart-label-activities"></div>
                                            <div id="timeline-chart"></div>
                                        </div>
                                    </div>
                                    <div class="filter-chart-container">
                                        <div class="relative">
                                            <div class="chart-label-filter"></div>
                                        </div>
                                        <div id="filter-chart"></div>
                                    </div>
                                </div>
                            </div>


                            <!-- Begin dashboard -->
                            <div class="dashboard" style="display:block;">
                                <div class="col-md-12">
                                    <ul class="nav nav-tabs dashboard-tab">
                                        <li class="nav-item active">
                                            <a class="nav-link active" v-on:click="log(\'dashboard_completion_open\')" data-toggle="tab" href="#learningstatus" role="tab">Genutzte Lernangebote</a></li>    
                                        <li hidden class="nav-item ">
                                            <a class="nav-link"v-on:click="log(\'dashboard_time-management_open\')"  data-toggle="tab" href="#timemanagement" role="tab">Zeitmanagement</a></li>
                                        <li class="nav-item">
                                            <a class="nav-link" v-on:click="log(\'dashboard_strategy_open\')" data-toggle="tab" href="#strategy" role="tab">Lernen gestalten</a>
                                        </li>
                                        <li hidden class="nav-item">
                                            <a class="nav-link" v-on:click="log(\'dashboard_communication_open\')"  data-toggle="tab" href="#communication" role="tab">Kommunikation</a>
                                        </li>
                                        <li hidden class="nav-item">
                                            <a class="nav-link" v-on:click="log(\'dashboard_assessment_open\')"  data-toggle="tab" href="#quiz" role="tab">Quiz</a>
                                        </li>
                                    </ul>
                                    <br>
                                    <div class="tab-content" style="display:block;">
                                        <div class="tab-pane fade show active" id="learningstatus" role="tabpanel">
                                            <dashboard-completion v-on:log="log" v-bind:course="course"></dashboard-completion>
                                        </div>    
                                        <div class="tab-pane fade" id="timemanagement" role="tabpanel">Zeitmanagement</div>
                                        <div class="tab-pane fade" id="communication" role="tabpanel">Kommunikation</div>
                                        <div class="tab-pane fade" id="strategy" role="tabpanel">
                                            <dashboard-strategy v-on:log="log" v-bind:course="course" v-bind:milestones="milestones"></dashboard-strategy>
                                        </div>
                                        <div class="tab-pane fade" id="quiz" role="tabpanel">Quiz</div>
                                    </div>
                                </div>
                            </div>
                            <!-- End dashboard -->

                            
                        </div>
                        <!-- End .planing-component -->

                        
                    </div>
                    <!-- End .ladtopic-container-0 -->
                </div>
                <!-- End .card-body -->
            </div>
            <!-- End .card -->
        </section>
    </div>
</div>

<div id="page-content" class="row">
    <div class="region-main-box col-12">
        <section id="region-main" class="has-blocks mb3">
            <div class="card">
                <div class="card-body">
                <div>
		        <div>

                    <div class="course-content">
';
        
    if (format_ladtopics\blocking::tool_policy_accepted() == false) {
        $url = new moodle_url('/course/format/ladtopics/redirect-blocking.php');
        // redirect($url);
        /*
        return html_writer::start_tag('div', array('class' => 'container chart-container'))
            //. $content . html_writer::end_tag('div')
            . html_writer::start_tag('ul', array('class' => 'topics'))
            ;

        */
    } 

    return 
            html_writer::start_tag('div', array('class' => 'container chart-container')) 
            . $content . html_writer::end_tag('div') 
            . html_writer::start_tag('ul', array('class' => 'topics'))
            ;
    }

    /**
     * Generate the closing container html for a list of sections
     * @return string HTML to output.
     */
    protected function end_section_list() {
        return html_writer::end_tag('ul');
    }

    /**
     * Generate the title for this section page
     * @return string the page title
     */
    protected function page_title() {
        return get_string('topicoutline');
    }

    /**
     * Generate the section title, wraps it in a link to the section page if page is to be displayed on a separate page
     *
     * @param stdClass $section The course_section entry from DB
     * @param stdClass $course The course entry from DB
     * @return string HTML to output.
     */
    public function section_title($section, $course) {
        return $this->render(course_get_format($course)->inplace_editable_render_section_name($section));
    }

    /**
     * Generate the section title to be displayed on the section page, without a link
     *
     * @param stdClass $section The course_section entry from DB
     * @param stdClass $course The course entry from DB
     * @return string HTML to output.
     */
    public function section_title_without_link($section, $course) {
        return $this->render(course_get_format($course)->inplace_editable_render_section_name($section, false));
    }

    /**
     * Generate the edit control items of a section
     *
     * @param stdClass $course The course entry from DB
     * @param stdClass $section The course_section entry from DB
     * @param bool $onsectionpage true if being printed on a section page
     * @return array of edit control items
     */
    protected function section_edit_control_items($course, $section, $onsectionpage = false) {
        global $PAGE;

        if (!$PAGE->user_is_editing()) {
            return array();
        }

        $coursecontext = context_course::instance($course->id);

        if ($onsectionpage) {
            $url = course_get_url($course, $section->section);
        } else {
            $url = course_get_url($course);
        }
        $url->param('sesskey', sesskey());

        $controls = array();
        if ($section->section && has_capability('moodle/course:setcurrentsection', $coursecontext)) {
            if ($course->marker == $section->section) {  // Show the "light globe" on/off.
                $url->param('marker', 0);
                $markedthistopic = get_string('markedthistopic');
                $highlightoff = get_string('highlightoff');
                $controls['highlight'] = array('url' => $url, "icon" => 'i/marked',
                                               'name' => $highlightoff,
                                               'pixattr' => array('class' => '', 'alt' => $markedthistopic),
                                               'attr' => array('class' => 'editing_highlight', 'title' => $markedthistopic,
                                                   'data-action' => 'removemarker'));
            } else {
                $url->param('marker', $section->section);
                $markthistopic = get_string('markthistopic');
                $highlight = get_string('highlight');
                $controls['highlight'] = array('url' => $url, "icon" => 'i/marker',
                                               'name' => $highlight,
                                               'pixattr' => array('class' => '', 'alt' => $markthistopic),
                                               'attr' => array('class' => 'editing_highlight', 'title' => $markthistopic,
                                                   'data-action' => 'setmarker'));
            }
        }

        $parentcontrols = parent::section_edit_control_items($course, $section, $onsectionpage);

        // If the edit key exists, we are going to insert our controls after it.
        if (array_key_exists("edit", $parentcontrols)) {
            $merged = array();
            // We can't use splice because we are using associative arrays.
            // Step through the array and merge the arrays.
            foreach ($parentcontrols as $key => $action) {
                $merged[$key] = $action;
                if ($key == "edit") {
                    // If we have come to the edit key, merge these controls here.
                    $merged = array_merge($merged, $controls);
                }
            }

            return $merged;
        } else {
            return array_merge($controls, $parentcontrols);
        }
    }
}
