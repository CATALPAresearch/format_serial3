<template>
    <div>
        <div v-show='surveyRequired && isVisible' class='modal fade' id='questionnaireModal'
                data-keyboard='false' data-backdrop='static' tabindex='-1' role='dialog'
                aria-labelledby='questionnaireModalLabel' aria-hidden='true'>
            <div class='modal-dialog modal-lg modal-dialog-centered' role='document'>
                <div class='modal-content'>
                    <div class='modal-body'>
                        <span class='pt-4 pb-4 col-12 d-flex' style='font-weight:bold; font-size:2.1em; color:#333;'>
                            Bitte nehmen Sie sich 10 Minuten Zeit für unsere Befragung, damit wir das Lernangebot besser an
                            Ihre Bedürfnisse anpassen können. <br><br>Vielen Dank!
                        </span>
                    </div>
                    <div class='modal-footer text-center'>
                        <a style='border-radius:10px; font-weight:bold; color:#fff !important; float:left;'
                            class='btn btn-primary btn-lg'
                            :href='getSurveyURL()'>
                            Jetzt an der Befragung teilnehmen!
                        </a>
                        <a class='btn btn-link right' data-dismiss="modal"
                            @click='close()'>
                            Jetzt nicht, aber später.
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import Communication from "../scripts/communication";

export default {
    name: "SurveyPrompt",

    data: function(){
        return {
            isVisible: false
        };
    },

    mounted: function () {
        if (this.is1801Course() && this.policyAccepted) {
            this.prepareSurvey();
        }
    },


    computed: {
        ...mapState(['courseid', 'userid', 'research_condition', 'surveyRequired', 'questionnaireid', 'policyAccepted']),
    },

    methods: {
        ...mapGetters(['is1801Course', 'getisModerator']),

        getSurveyURL: function(){
            const base = "https://aple.fernuni-hagen.de/mod/questionnaire/view.php?id=";
            //console.log(this.courseid, this.questionnaireid[this.courseid], this.questionnaireid[this.questionnaireid[this.courseid]])
            return base + this.questionnaireid[this.courseid]
        },

        close: function(){
            this.isVisible = false;
            //$('#questionnaireModal').modal('hide');
        },

        prepareSurvey: async function () {
            return; // temporally disabled.
            if(this.getisModerator()){
                //this.close();
                //return;
            }
            
           if (!this.questionnaireid.hasOwnProperty(this.courseid)) {
                //this.close();
                console.error(this.name, '--','No valid course id: ', this.courseid);
                return;
            }
            
            const response = await Communication.webservice(
                'get_surveys',
                {
                    courseid: this.courseid,
                    moduleid: this.questionnaireid[this.courseid]
                }
            );
            //console.log(this.name, '--','Questionnaire? ', response, this.is1801Course(), this.getisModerator(), this.surveyRequired)
            if (response.success) {
                response.data = JSON.parse(response.data);
                if (response.data.submitted) {
                    //console.log(this.name, '--','Questionnaire was submitted at ' + response.data.submitted);
                } else if (this.is1801Course()) {
                    // console.log('Questionnaire? show modal')
                    $('#questionnaireModal').modal('show');
                    this.isVisible = true;
                    //$('body').prepend('<a target='new' class='btn btn-lg fixed-top w-50 survey-button' href='https://aple.fernuni-hagen.de/mod/questionnaire/view.php?id='+ this.questionnaireid +''>Helfen Sie uns das Lernangebot zu verbessern und nehmen Sie an unserer Befragung teil.</a>');
                }
            } else {
                if (response.data) {
                    console.error(this.name, '--','Faulty response of webservice /get_surveys/', response.data);
                } else {
                    console.error(this.name, '--','No connection to webservice /get_surveys/');
                }
            }
        },
    }
}
</script>

<style scoped>
.fade {
  transition: opacity 0.15s linear;
  background-color: #cccccc90;
}
</style>