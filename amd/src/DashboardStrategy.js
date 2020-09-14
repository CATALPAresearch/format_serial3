/**
 * DashboardCompletion
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      DashboardCompletion
 * @copyright  2020 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @description Shows per course section a row of rectangles indicating the completion of assigned activities.
 * @license    MIT
 * @since      3.1
 * 
 * @todo
 * - display repetition of activities
 * - provide additional information for each activity using a popover or tooltip
 * - fix empty section names
 */

define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    // 'd3v4',
    M.cfg.wwwroot + "/course/format/ladtopics/amd/src/Utils.js"//,
    //M.cfg.wwwroot + '/course/format/ladtopics/amd/src/ErrorHandler.js'
], function ($, Vue, Utils) {
    Utils = new Utils();
    return Vue.component('dashboard-completion',
        {
            props: ['course'],

            data: function () {
                return {
                    strategyCategories: [
                        { id: 'organization', name: 'Organisation' },
                        { id: 'elaboration', name: 'Elaborationsstrategien' },
                        { id: 'repeatition', name: 'Wiederholungsstrategien' },
                        { id: 'misc', name: 'Sonstige' }

                    ],
                    strategies: [ // Übertrage Ansätze auf Kontexte ?? #86
                        { id: 'reading', name: 'Überblick durch Lesen/Querlesen', desc: '<div>Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an. <a href="https://www.example.com/">Details</a></div>', url: "", category: 'organization' },
                        { id: 'mindmap', name: 'Erzeuge Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "", category: 'organization' },
                        { id: 'exzerpte', name: 'Fertige Exzerpt an', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "", category: 'organization' },
                        { id: 'gliederung', name: 'Erstelle Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "", category: 'organization' },
                        { id: 'strukturierung', name: 'Strukturiere Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "", category: 'organization' },
                        { id: 'makeflashcards', name: 'Lernkarten erstellen', desc: 'Lernkarten kann man sehr früh digital z.B. in einer App oder auf Papier erstellen. Das erleichtert die Prüfungsvorbereitung.', url: "", category: 'organization' },


                        { id: 'transfer', name: 'Wende neues Wissen an', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "", category: 'elaboration' },
                        { id: 'examples', name: 'Übertrage Ansätze auf Berufliches', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "", category: 'elaboration' },
                        { id: 'critical', name: 'Hinterfrage Inhalte kritisch', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "", category: 'elaboration' },
                        { id: 'structuring', name: 'Stelle Bezug zu anderen Fächern her', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "", category: 'elaboration' },
                        { id: 'pq4r', name: 'Wende PQ4R - Methode an', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "", category: 'elaboration' },


                        { id: 'flashcards', name: 'Auswendiglernen mit Lernkarten', desc: 'Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ', url: "", category: 'repeatition' },
                        { id: 'repeatition', name: 'Repetieren', desc: 'Mit vielen Wiederholungen festigt sich das Wissen. ', url: "", category: 'repeatition' },
                        { id: 'assoc', name: 'Eselsbrücken', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "", category: 'repeatition' },
                        { id: 'loci', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "", category: 'repeatition' }

                    ],
                    info: '',

                };
            },

            mounted: function () {
                var _this = this;

            },

            methods: {
                draw: function (data) {
                },
                strategiesByCategory: function (cat) {
                    return this.strategies.filter(function (s) {
                        return s.category === cat ? true : false;
                    });
                },
                strategyById: function (id) {
                    return JSON.parse(JSON.stringify(this.strategies.filter(function (s) {
                        return s.id === id ? true : false;
                    })[0]));
                },
            },

            template: `
                <div id="dashboard-strategy">
                    Hello Strategy
                </div>`
        });
});