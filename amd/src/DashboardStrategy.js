/**
 * DashboardCompletion
 *
 * @module     format/ladtopics
 * @class      DashboardCompletion
 * @copyright  2020 Niels Seidel <niels.seidel@fernuni-hagen.de>
 * @description xxx
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
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js"
], function ($, Vue) {

    return Vue.component('dashboard-completion',
        {
            props: ['course'],

            data: function () {
                return {
                    strategyCategories: [
                        {
                            id: 'cognitive', 
                            name: 'Überblick beim Lernen', 
                            desc: 'Bei kognitiven Lernstrategien unterscheidet man zwischen Organisations-, Elaborations- und Wiederholungsstrategien. Organisationsstrategien betrachten, wie der/die Lernernde sein/ihr Wissen organisiert und für den weiteren Lernprozess strukturiert. Strategien, die dies konkret veranschaulichen, sind das Erstellen von Mindmaps, das Verfassen von Exzerpten oder Gliederungen zum Lernstoff sowie das Sammeln wichtiger Inhalte, z.B. durch das Erstellen von Tabellen, Diagrammen, Schaubildern oder Listen mit Fachausdrücken und Definitionen. Elaborationsstrategien werden eingesetzt, um ein erweitertes Wissen zu generieren. Lernende bedienen sich dabei meist der bereits internalisierten Schemata und Wissensbasen und nutzen z. B. vertraute Abläufe, um Querbezüge herzustellen. vgl. Wissenssynthese. Wiederholungsstrategien sind notwendig, um sich Lernstoff dauerhaft einzuprägen und gleichsam eine schnelle Verfügbarkeit von Wissen zu gewährleisten. Daher stehen hier Lernaktivitäten wie z. B. Auswendiglernen mit Lernkarten und repetierende Übungen im Vordergrund.',
                        },
                        {
                            id: 'metacognitive', 
                            name: 'Lernen gestalten', 
                            desc: 'Bei den metakognitiven Lernstrategie geht es darum den Lernprozess zu Steuern und zu kontrollieren. Dazu bedient man sich Strategien wie dem Planen, Vorbereiten und Ziele setzen. Dies geht eiher mit einem stetigen Prozess der Selbsteinschätzung und Selbstregulation. Nur so kann der Lernprozess stetig verbessert und angepasst werden. '
                        },
                        {
                            id: 'resource', 
                            name: 'Meine Ressourcen', 
                            desc: 'Ressourcenorientierte Selbstorganisation im StudiumUm eine Balance zwischen Studium und beruflichen wie privaten Verpflichtungen herzustellen, ist es wichtig, die eigenen Ressourcen zu kennen und sich Zeit und Energie im Studium gut einzuteilen.Eine systematische Auseinandersetzung mit Zielen, Anstrengungen beim Lernen und der eigenen Aufmerksamkeitsfähigkeit soll Ihnen helfen, Ihre Ressourcen besser kennen zu lernen.Motivation und Durchhaltevermögen können Sie durch eine Balance zwischen Selbstverpflichtung, Belohnung und Regeneration steigern. ' 
                        },
                        { id: 'misc', name: 'Sonstige' }
                    ],

                    strategySubCategories: [
                        {
                            id: 'organisation', name: 'Organisationsstrategien ', desc: 'Organisationsstrategien betrachten, wie der/die Lernernde sein/ihr Wissen organisiert und für den weiteren Lernprozess strukturiert. Strategien, die dies konkret veranschaulichen, sind das Erstellen von Mindmaps, das Verfassen von Exzerpten oder Gliederungen zum Lernstoff sowie das Sammeln wichtiger Inhalte, z.B. durch das Erstellen von Tabellen, Diagrammen, Schaubildern oder Listen mit Fachausdrücken und Definitionen.'
                        },
                        {
                            id: 'elaboration', name: 'Elaborationsstrategien', desc: 'Elaborationsstrategien werden eingesetzt, um ein erweitertes Wissen zu generieren. Lernende bedienen sich dabei meist der bereits internalisierten Schemata und Wissensbasen und nutzen z. B. vertraute Abläufe, um Querbezüge herzustellen. vgl. Wissenssynthese.'
                        },
                        {
                            id: 'repetition', name: 'Wiederholungsstrategien', desc: 'Wiederholungsstrategien sind notwendig, um sich Lernstoff dauerhaft einzuprägen und gleichsam eine schnelle Verfügbarkeit von Wissen zu gewährleisten. Daher stehen hier Lernaktivitäten wie z. B. Auswendiglernen mit Lernkarten und repetierende Übungen im Vordergrund.'
                        },
                        { id: '', name: '', desc: '' },
                        { id: '', name: '', desc: '' },
                        { id: '', name: '', desc: '' },
                        { id: '', name: '', desc: '' }
                    ],

                    strategies: [
                        // cognitive strategies
                        { id: 'reading', name: 'Überblick durch Querlesen', desc: '', category: 'cognitive' },
                        {
                            id: 'mindmap', name: 'Mindmap', desc: 'Mit Mindmaps können Sie zentrale Themen, Bezüge und Zusammengänge grafisch darstellen und visuell veranschaulichen. Bei einer Mindmap wird die zentrale Idee eines Textes bzw. der zentrale Begriff, in der Mitte des Blattes platziert. Weitere Schlüsselwörter, die im Text behandelt werden, werden nun in Relation dazu (Abstand - Nähe; Schriftgröße, etc.) hinzugefügt. Sie können diese Begriffe auch durch Symbole oder Kurzkommentare ergänzen. Es empfiehlt sich allerdings, nicht ganze Sätze zu formulieren, da die Übersichtlichkeit darunter leiden könnte.', category: 'cognitive' },
                        {
                            id: 'exzerpt', name: 'Exzerpte / Zusammenfassungen', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte. Gerade wenn es darum geht, vor einer Prüfung Lerninhalte noch einmal zu wiederholen, helfen Ihnen Exzerpte oder Zusammenfassungen dabei, schnell in die einzelnen Wissensbereiche einzutauchen, ohne auf das ausführliche Kursmaterial zurückzugreifen. Zudem können Sie schon bei der Erstellung eines Exzerpts üben, Wissen in eigenen Worten wiederzugeben. Auch kritische Perspektiven und eine wissenschaftliche Schreibweise sollten Sie in einem Exzerpt berücksichtigen.', category: 'cognitive' },
                        {
                            id: 'toc', name: 'Gliederungen', desc: 'Gliederungen helfen, einen Überblick über den zu lernenden Inhalt zu bekommen. Wissen kann so leichter strukturiert oder kategorisiert werden. Themenfelder lassen sich mit einer Gliederung z. B. übersichtlich strukturieren.', category: 'cognitive' },
                        {
                            id: 'structure', name: 'Strukturierung von Wissen', desc: 'Um den Lernstoff klarer darzustellen, ist die Erstellung von Tabellen, Diagrammen, Listen oder Schaubildern hilfreich. Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', category: 'cognitive' },
                        {
                            id: 'cards', name: 'Lernkarten früh erstellen', desc: 'Lernkarten können schon sehr früh digital z. B. in einer App oder auf Papier erstellt werden und die Lernorganisation so erleichtern. Dabei können nicht nur Begriffe notiert werden, sondern auch Prozesse oder mögliche Fragestellungen, die Sie z. B. in der Prüfung erwarten könnten.', category: 'cognitive' },
                        { id: '', name: '', desc: '', category: 'cognitive' },

                        // metacognitive strategies



                        { id: 'mindmap', pcategory: 'overview', name: 'Erzeuge Mindmap', desc: 'Eine Mindmap hilft dabei, Zusammenhänge darzustellen.', url: "", category: 'organization' },
                        { id: 'exzerpte', pcategory: 'overview', name: 'Fertige Exzerpt an', desc: 'Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.', url: "", category: 'organization' },
                        { id: 'gliederung', pcategory: 'performance', name: 'Erstelle Gliederung', desc: 'Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.', url: "", category: 'organization' },
                        { id: 'strukturierung', pcategory: 'performance', name: 'Strukturiere Wissen', desc: 'Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.', url: "", category: 'organization' },
                        { id: 'makeflashcards', pcategory: 'overview', name: 'Lernkarten erstellen', desc: 'Lernkarten kann man sehr früh digital z.B. in einer App oder auf Papier erstellen. Das erleichtert die Prüfungsvorbereitung.', url: "", category: 'organization' },


                        { id: 'transfer', pcategory: 'overview', name: 'Wende neues Wissen an', desc: 'Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.', url: "", category: 'elaboration' },
                        { id: 'examples', pcategory: 'overview', name: 'Übertrage Ansätze auf Berufliches', desc: 'Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.', url: "", category: 'elaboration' },
                        { id: 'critical', pcategory: 'overview', name: 'Hinterfrage Inhalte kritisch', desc: 'Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.', url: "", category: 'elaboration' },
                        { id: 'structuring', pcategory: 'overview', name: 'Stelle Bezug zu anderen Fächern her', desc: 'Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.', url: "", category: 'elaboration' },
                        { id: 'pq4r', pcategory: 'overview', name: 'Wende PQ4R - Methode an', desc: 'Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung', url: "", category: 'elaboration' },


                        { id: 'flashcards', pcategory: 'exams', name: 'Auswendiglernen mit Lernkarten', desc: 'Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ', url: "", category: 'repeatition' },
                        { id: 'repeatition', pcategory: 'exams', name: 'Repetieren', desc: 'Mit vielen Wiederholungen festigt sich das Wissen. ', url: "", category: 'repeatition' },
                        { id: 'assoc', pcategory: 'overview', name: 'Eselsbrücken', desc: 'Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.', url: "", category: 'repeatition' },
                        { id: 'loci', pcategory: 'overview', name: 'Loci Methode', desc: 'Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.', url: "", category: 'repeatition' }

                    ],
                    info: '',

                };
            },

            mounted: function () { },

            created: function () {
                $(function () {
                    $('#strategyTab li:first-child a').tab('show');
                });
            },

            methods: {
                strategiesByPedagogicCategory: function (cat) {
                    return this.strategies.filter(function (s) {
                        return s.pcategory === cat ? true : false;
                    });
                },
                strategyById: function (id) {
                    return JSON.parse(JSON.stringify(this.strategies.filter(function (s) {
                        return s.id === id ? true : false;
                    })[0]));
                },
            },

            template: `
            <div>
                <h4>Lernstrategien</h4>
                <div class="row">
                    <div class="col-3">
                        <div class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
                            <a class="nav-link" v-for="pc in pedagogicStrategies" data-toggle="pill" :href="'#'+pc.id" role="tab" aria-selected="false">{{pc.name}}</a></li>
                        </div>
                    </div>
                    <div id="strategyTab" class="tab-content col-9" style="display:block;">
                        <div v-for="pc in pedagogicStrategies" :id="pc.id" class="tab-pane fade"  role="tabpanel" aria-labelledby="v-pills-home-tab">
                            <div class="row">
                                <div class="col-6">{{pc.desc}}</div>
                                <div class="col-6">
                                    <div v-for="s in strategiesByPedagogicCategory(pc.id)">
                                        {{s.name}}
                                        <button type="button" class="btn btn-sm btn-link" data-toggle="popover" :data-content="s.desc">
                                            <i class="fa fa-question"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="clearfix"></div>
                </div>
             </div>
            `
        });
});