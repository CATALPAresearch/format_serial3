/**
 * ladtopics cleaners removes course elements that should not be available for authenticated users that did NOT agree to a ceratin policy.
 *
 * @module     format/ladtopics
 * @class      LADTopics
 * @copyright  2019 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @license    MIT
 * @since      3.1
 */
define(['jquery'], function ($) {

    return {
        init: function () {
            console.log('Blocked Version');
            // hide unused div
            let box = $("#region-main-box");
            const h = box.outerHeight();
            box.change(function () {
                if (box.outerHeight() > h) {
                    box.show();
                }
            });
            box.hide();

            // Zeige die Werbebox, die per Default ausgeblendet ist
            $(document).ready(function () {
                $('.policy-withdraw-box').show();
                $('.policy-withdraw-box').css('diaplay', 'inline');
            });

            let blackpages = '';
            if (M.cfg.wwwroot.includes('127.0.0.1') || M.cfg.wwwroot.includes('localhost')) {
                blackpages += 'module-86,module-106'; // for testing
            } else if (M.cfg.wwwroot === 'https://aple.fernuni-hagen.de') {
                // add 1801 page modules and self-asessments
                blackpages += 'module-260,module-261,module-262,module-263,module-265,module-270,module-273,module-274,module-275,module-277,module-278,module-279,';
                blackpages += 'module-248,module-281,module-318,module-343,module-290,module-292,module-295,module-296,module-298,module-299,module-300,module-301,module-303,module-307,module-319,module-320,module-321,module-322,module-323,module-324,module-326,module-327,module-328,module-330,module-331,module-333,module-334,module-335,module-336,module-344,module-346,module-347,module-348,module-349,module-350,';
                // add page modules from "Module 1D"
                blackpages += 'module-374,module-375,module-378,module-381,module-384,module-392,module-395,module-398,module-401,module-404,module-407,module-414,module-417,module-420,module-423,module-424,module-425,module-426,module-427';
            }
            let blackpages_arr = blackpages.split(',');
            for (var i = 0; i < blackpages_arr.length; i++) {
                if (blackpages[i].length > 0) {
                    if ($('#' + blackpages_arr[i]).length){
                        $('#' + blackpages_arr[i]).hide();
                    }
                }
            }
            
            $('.activity.usenet').hide();

            // A field to ask to accept all policies required for LADTopics.
            const link = `${M.cfg.wwwroot}/course/format/ladtopics/policy.php`;
            $('div.ladtopics').prepend(
                ` 
                <div class="alert alert-primary my-0">
                    <div class="w-75">
                    <strong>Forschen Sie mit uns!</strong>
                    <button hidden type="button" class="close" aria-label="Close" data-toggle="collapse" href="#inviteText">
                        <span aria-hidden="true">verbergen</span>
                    </button>
                    <div id="inviteText" class="collapsex" style="font-size:0.9em">
                     <p>Im Rahmen des Forschungsprojekts APLE besteht hier für Sie die Möglichkeit, eine adaptive personalisierte Lernumgebung zu nutzen. Die Teilnahme ist freiwillig.</p>
                    
                    <p>Stimmen Sie zu, erhalten Sie zusätzliche Funktionen und profitieren davon für Ihr Selbststudium. Bei den Aktivitäten in Moodle werden dementsprechend Forschungsdaten erhoben. Stimmen Sie nicht zu, nutzen Sie die Lernumgebung ohne zusätzliche adaptive Funktionen. Hier werden nur die standardmäßigen Daten erhoben. Sie können sich bis zum 30.10.2020 entscheiden, ob Sie an diesem Angebot teilhaben möchten. Teil der Forschung ist auch eine Befragung, die etwa 30 Minuten in Anspruch nehmen wird. Die Befragungsergebnisse dienen dazu, die Lernplattform zu verbessern und an die individuellen Bedürfnisse der Lernenden anzupassen.</p>

                    <p>Wir würden uns sehr freuen, wenn Sie uns bei diesem wichtigen Forschungsprojekt unterstützen.</p>
    
                    <button type="button" class="btn btn-primary mt-2" onclick="javascript:window.location.href='${link}'">Kursrichtlinien einsehen und ggf. zustimmen</button>
                    </div>
                    </div>
                </div>
                `

                // Sie haben sich entschieden, den Untersuchungen im Rahmen des Projektes APLE nicht zuzustimmen, weshalb wir Ihnen nur die grundlegende Lernunterstützung anbieten können.<br />
                // Falls Sie sich an den Untersuchungen beteiligen möchten und weitere Lernunterstützung in Form von Lernwerkzeugen in Anspruchen nehmen wollen, können Sie sich noch bis Ende Oktober umentscheiden: <br />
            );
        }
    };
});