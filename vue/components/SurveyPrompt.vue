<template>
    <div>
        <div v-if='surveyRequired && is1801Course()' class='modal fade' id='questionnaireModal'
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
                        <a style='border-radius:10px; font-weight:bold; color:#fff !important;'
                            class='btn btn-primary btn-lg'
                            href='https://aple.fernuni-hagen.de/mod/questionnaire/view.php?id=4046'>
                            Jetzt an der Befragung teilnehmen!
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div v-else></div>
    </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
import Communication from "../scripts/communication";

export default {
    name: "SurveyPrompt",

    mounted: function () {
        if (this.is1801Course() && this.policyAccepted) {
            this.prepareSurvey();
        }
    },

    computed: {
        ...mapState(['courseid', 'userid', 'research_condition', 'surveyRequired', 'questionnaireid', 'policyAccepted']),
    },

    methods: {
        ...mapGetters(['is1801Course', 'isModerator']),

        prepareSurvey: async function () {
            
            if (this.isModerator) {
                //return;
            }
            
            if (!this.questionnaireid.hasOwnProperty(this.courseid)) {
                //return;
            }
            
            const response = await Communication.webservice(
                'get_surveys',
                {
                    courseid: this.courseid,
                    moduleid: this.questionnaireid[this.courseid]
                }
            );
            if (response.success) {
                console.log('SSUURR', 4);
                response.data = JSON.parse(response.data);
                console.log('QUESTIONNAIRE: ', response.data, this.courseid, this.questionnaireid[this.courseid])
                if (response.data.submitted) {
                    console.log('SSUURR', 5);
                    console.log('questionnaire submitted at ' + response.data.submitted);
                } else if (this.is1801Course()) {
                    console.log('SSUURR', 6);
                    $('#questionnaireModal').modal('show');
                    //$('body').prepend('<a target='new' class='btn btn-lg fixed-top w-50 survey-button' href='https://aple.fernuni-hagen.de/mod/questionnaire/view.php?id='+ this.questionnaireid +''>Helfen Sie uns das Lernangebot zu verbessern und nehmen Sie an unserer Befragung teil.</a>');
                }

            } else {
                if (response.data) {
                    console.log('Faulty response of webservice /get_surveys/', response.data);
                } else {
                    console.log('No connection to webservice /get_surveys/');
                }
            }
        },
    }
}
</script>