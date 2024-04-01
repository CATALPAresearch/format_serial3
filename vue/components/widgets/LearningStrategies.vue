<script>
import Communication from '../../scripts/communication';
import WidgetHeading from "../WidgetHeading.vue";
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';


export default {
    name: 'WidgetLearningStrategy',
    props: ['course', 'log', 'aple1801'],

    components: { WidgetHeading },

    data: function () {
        return {
            currentStrategy: null,
            currentMenuItem: 'organisation',
            mode: 'category',
            bookmarked: {},
            moodlePath: M.cfg.wwwroot,
            strategyCategories: [

                {
                    id: 'organisation',
                    name: 'Lernstoff organisieren',
                    desc: 'Organisationsstrategien betrachten, wie der/die Lernernde sein/ihr Wissen organisiert und für den weiteren Lernprozess strukturiert. Strategien, die dies konkret veranschaulichen, sind das Erstellen von Mindmaps, das Verfassen von Exzerpten oder Gliederungen zum Lernstoff sowie das Sammeln wichtiger Inhalte, z.B. durch das Erstellen von Tabellen, Diagrammen, Schaubildern oder Listen mit Fachausdrücken und Definitionen.',
                },
                {
                    id: 'elaboration',
                    name: 'Inhalte erarbeiten',
                    desc: 'Die so genannten Elaborationsstrategien werden eingesetzt, um ein erweitertes Wissen zu generieren. Lernende bedienen sich dabei meist der bereits internalisierten Schemata und Wissensbasen und nutzen z. B. vertraute Abläufe, um Querbezüge herzustellen. vgl. Wissenssynthese.',
                },
                {
                    id: 'knowledgebuilding',
                    name: 'Wissen aufbauen',
                    desc: 'Um sich Lernstoff dauerhaft einzuprägen und gleichsam eine schnelle Verfügbarkeit von Wissen zu gewährleisten sind Wiederholungsstrategien wichtig. Daher stehen hier Lernaktivitäten wie z. B. Auswendiglernen mit Lernkarten und repetierende Übungen im Vordergrund.',
                },
                {
                    id: 'metacognitive',
                    name: 'Lernprozess verbessern',
                    desc: 'Man kann mit ganz unterschiedlichen  Lernstrategien  zum  Studienerfolg  kommen.  Insofern  erscheint  es  erforderlich,  den Strategieeinsatz  zu planen,  zu  reflektieren  und  ggf.  anzupassen.  Überprüfen  Sie,  welche  Prüfungsanforderungen  gegeben  sind  (z.B.  reines  Faktenwissen  auswendig lernen oder Zusammenhänge erkennen, Transfer von Wissen auf neue Anwendungsgebiete), auf welche  Ressourcen  Sie  zurückgreifen  können  (z.B.  gemeinsames  Lernen  mit  Kommiliton/-innen)  und  planen  Sie  die  Zeit  für  den  Lernaufwand  bzw.  die  konkrete  Prüfungsvorbereitung  ein.  Reflektieren  Sie, welche Lernerfahrungen Sie  bisher  gemacht  haben  und  welche  Lernstrategien  Sie bevorzugen. Wenn Sie regelmäßig Anforderungen analysieren, Lernziele formulieren, überprüfen ob Sie alles verstanden haben können Sie immer schneller lücken im Lernprozess schließen.'
                },
                {
                    id: 'resource',
                    name: 'Ressourcen nutzen',
                    desc: 'Um eine Balance zwischen Studium und beruflichen wie privaten Verpflichtungen herzustellen, ist es wichtig, die eigenen Ressourcen zu kennen und sich Zeit und Energie im Studium gut einzuteilen. Eine systematische Auseinandersetzung mit Zielen, Anstrengungen beim Lernen und der eigenen Aufmerksamkeitsfähigkeit soll Ihnen helfen, Ihre Ressourcen besser kennen zu lernen. Motivation und Durchhaltevermögen können Sie durch eine Balance zwischen Selbstverpflichtung, Belohnung und Regeneration steigern.'
                }
            ],

            strategies: [
                {
                    id: 'crossreading', name: 'Überblick durch Querlesen', category: 'organisation'
                },
                {
                    id: 'mindmap', name: 'Mindmap', category: 'organisation'
                },
                {
                    id: 'exzerpt', name: 'Exzerpte / Zusammenfassungen', category: 'organisation'
                },
                {
                    id: 'toc', name: 'Gliederungen', category: 'organisation'
                },
                {
                    id: 'structure', name: 'Strukturierung von Wissen', category: 'organisation'
                },
                {
                    id: 'cardsearly', name: 'Lernkarten früh erstellen', category: 'organisation'
                },
                {
                    id: 'fastreading', name: 'schnelles Lesen', category: 'elaboration'
                },
                {
                    id: 'readingcomprehension', name: 'Leseverständnis steigern', category: 'elaboration'
                },
                {
                    id: 'transfertoknown', name: 'Übertragung auf bekannte Schemata', category: 'elaboration'
                },
                {
                    id: 'criticalquestioning', name: 'kritisches Hinterfragen', category: 'elaboration'
                },
                {
                    id: 'subjectrelations', name: 'Bezug zu anderen Fächern herstellen', category: 'elaboration'
                },
                {
                    id: 'PQ4R', name: 'PQ4R-Methode', category: 'elaboration'
                },
                {
                    id: 'cards', name: 'Lernkartei', category: 'knowledgebuilding'
                },
                {
                    id: 'repetitions', name: 'Repetieren', category: 'knowledgebuilding'
                },
                {
                    id: 'reminder', name: 'Kleine Erinnerungshilfen', category: 'knowledgebuilding'
                },
                {
                    id: 'remindercomplex', name: 'Erinnerungshilfen für komplexe Inhalte', category: 'knowledgebuilding'
                },
                //// metacognitive
                {
                    id: 'planning', name: 'Planen', category: 'metacognitive'
                },
                {
                    id: 'prepare', name: 'Vorbereiten', category: 'metacognitive'
                },
                {
                    id: 'selfevaluation', name: 'Selbsteinschätzung', category: 'metacognitive'
                },
                {
                    id: 'regulations', name: 'Regulationsstrategien', category: 'metacognitive'
                },
                {
                    id: 'goals', name: 'Ziele setzen', category: 'metacognitive'
                },
                //// resource
                {
                    id: 'demand', name: 'Anstrengungsmanagement', category: 'resource'
                },
                {
                    id: 'attention', name: 'Aufmerksamkeitsmanagement', category: 'resource'
                },
                {
                    id: 'resourcemanagement', name: 'Ressourcenmanagement', category: 'resource'
                },
                {
                    id: 'timemanagement', name: 'Zeitmanagement', category: 'resource'
                },
                {
                    id: 'effectivetimemanagement', name: 'Effektives Zeitmanagement', category: 'resource'
                },
                {
                    id: 'partner', name: 'Lernpartner', category: 'resource'
                },
                {
                    id: 'selfcommittment', name: 'Selbstverpflichtung', category: 'resource'
                },
                {
                    id: 'literature', name: 'Literatur', category: 'resource'
                },
                {
                    id: 'timethefts', name: 'Zeitdiebe', category: 'resource'
                }
            ]
        };
    },

    mounted: function () {
        this.setCurrentStrategy('crossreading');
        this.loadStorage();
    },

    created: function () {
        this.loadStorage();
        this.$watch(
            () => this.$route.params,
            (toParams, previousParams) => {
                if(toParams.strategy){
                    this.setCurrentStrategy(toParams.strategy);
                }
                //console.log(toParams.strategy, previousParams.strategy)
                //console.log('::end ',this.currentStrategy)
            }
        );
    },

    methods: {
        loadStorage: function(){
            if (this.storageAvailable('localStorage')) {
            try {
                if (localStorage.getItem('serial2_course_bookmarks') !== null) {
                    this.bookmarked = JSON.parse(localStorage.getItem('serial2_course_bookmarks'));
                } else {
                    this.bookmarked = {};
                }
            } catch (e) {
                //new Error(e);
                this.bookmarked = {};
            }

        }
        },
        strategiesByCategory: function (cat) {
            return this.strategies.filter(function (s) {
                return s.category === cat ? true : false;
            });
        },
        strategyById: function (id) {
            return this.strategies.filter(function (s) {
                return s.id === id ? s : false;
            })[0];
        },
        getSelectedStrategy: function () {
            return this.currentStrategy !== null ?
                this.strategyById(this.currentStrategy) : { name: '', desc: '' };
        },
        getSelectedMenuItem: function () {
            let _this = this;
            let item = this.strategyCategories.filter(function (category) {
                return category.id === _this.currentMenuItem;
            })[0];
            return item === undefined ? { id: 0, desc: '' } : item;
        },
        setCurrentMenuItem: function (item) {
            this.mode = 'category';
            this.currentMenuItem = item;
            this.$emit('log', 'dashboard_strategy_category_click', item);
        },
        setCurrentStrategy: function (strategy) {
            this.mode = 'strategy';
            this.currentStrategy = strategy;
            this.$emit('log', 'dashboard_strategy_strategy_click', {
                strategy: strategy,
                category: this.strategyById(strategy).category
            });
        },
        getDate: function (t) {
            let d = new Date(t);
            return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()
        },

        strategyIsBookmarked: function (id) {
            if (this.bookmarked[id] === undefined) {
                this.bookmarked[id] = false;
            }
            return this.bookmarked[id];
        },

        toggleBookmark: function (id) {
            if (this.bookmarked[id] === undefined) {
                this.bookmarked[id] = false;
            }
            this.bookmarked[id] = !this.bookmarked[id];
            this.$forceUpdate();
            if (this.storageAvailable('localStorage')) {
                localStorage.setItem('serial2_strategy_bookmarks', JSON.stringify(this.bookmarked));
            }
        },
        storageAvailable: function (type) {
            var storage;
            try {
                storage = window[type];
                var x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch (e) {
                return e instanceof DOMException && (
                    // everything except Firefox
                    e.code === 22 ||
                    // Firefox
                    e.code === 1014 ||
                    // test name field too, because code might not be present
                    // everything except Firefox
                    e.name === 'QuotaExceededError' ||
                    // Firefox
                    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                    // acknowledge QuotaExceededError only if there's something already stored
                    (storage && storage.length !== 0);
            }
        }
    }
}

</script>

<template>
    <div id="learning-strategy">
        <widget-heading :info-content="info" icon="fa-hourglass-o" title="Lernstrategien"></widget-heading>
        <div class="row">
            <div class="col-3">
                <ul class="nav flex-column flex-nowrap overflow-hidden">
                    <li v-for="pc in strategyCategories" class="nav-item">
                        <!-- 
                            :href="'#submenu-'+pc.id" data-toggle="collapse" :data-target="'#submenu-'+pc.id" 
                        -->
                        <a :class="currentMenuItem==pc.id ? 'nav-link text-truncate mb-0 pb-0' : 'nav-link collapsed text-truncate'"
                            v-on:click="setCurrentMenuItem(pc.id)" 
                            style="cursor:pointer;">
                            <i :class="currentMenuItem==pc.id ? 'fa fa-caret-down' : 'fa fa-caret-right'"></i>
                            <span class="d-none d-sm-inline bold">{{ pc.name}}</span>
                        </a>
                        <div v-if="strategiesByCategory(pc.id).length > 0"
                            :class="currentMenuItem==pc.id ? 'collapse fade show' : 'collapse fade'"
                            :id="'submenu-'+pc.id" aria-expanded="false">
                            <ul class="flex-column pl-2 nav">
                                <li v-for="s in strategiesByCategory(pc.id)"
                                    :style="currentStrategy==s.id ? 'background-color:lightblue;' : ''"
                                    :class="currentStrategy == s.id ? 'nav-item active' : 'nav-item'">
                                    <router-link :to="'/strategies/' + s.id" v-if="s.subheading !== true" class="bl-2 pl-1 ml-4 nav-link py-0"
                                        v-on:click.prevent="setCurrentStrategy(s.id)" style="cursor:pointer;">
                                        <span>{{s.name}}</span>
                                        <i v-if="strategyIsBookmarked(s.id)" class="ml-1 pb-2 fa fa-star"
                                            style="color:#008fac; font-size:0.6em;"></i>
                                    </router-link>
                                    <span v-if="s.subheading" class="pl-1 ml-2">{{s.name}}</span>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
            <div id="strategy-description" class="col-6">
                <div v-if="mode=='category'">
                    <div class="bold">{{ getSelectedMenuItem().name }}</div>
                    <div>{{ getSelectedMenuItem().desc }}</div>
                </div>
                <div v-if="mode=='strategy'">
                    <div class="bold">
                        {{ getSelectedStrategy().name }}
                        <i v-if="!strategyIsBookmarked(getSelectedStrategy().id)"
                            v-on:click="toggleBookmark(getSelectedStrategy().id)" class="fa fa-star strategy-bookmarked"
                            style="color:#aaa;" title="Diese Lernstrategie vormerken"></i>
                        <i v-if="strategyIsBookmarked(getSelectedStrategy().id)"
                            v-on:click="toggleBookmark(getSelectedStrategy().id)"
                            class="fa fa-star strategy-not-bookmarked" style="color:#008fac;"
                            title="Vormerkung der Lernstrategie aufheben"></i>
                    </div>
                    <div v-if="currentStrategy=='crossreading'">
                        Elaborationsstrategien werden eingesetzt, um ein erweitertes Wissen zu generieren. Lernende
                        bedienen sich dabei
                        meist der bereits internalisierten Schemata und Wissensbasen und nutzen z. B. vertraute Abläufe,
                        um Querbezüge herzustellen. vgl.
                        Wissenssynthese.
                    </div>
                    <div v-if="currentStrategy=='mindmap'">
                        Mit Mindmaps können Sie zentrale Themen, Bezüge und Zusammengänge grafisch darstellen und
                        visuell veranschaulichen. Bei einer
                        Mindmap wird die zentrale Idee eines Textes bzw. der zentrale Begriff, in der Mitte des Blattes
                        platziert. Weitere Schlüsselwörter, die
                        im Text behandelt werden, werden nun in Relation dazu (Abstand - Nähe; Schriftgröße, etc.)
                        hinzugefügt. Sie können diese Begriffe auch
                        durch Symbole oder Kurzkommentare ergänzen. Es empfiehlt sich allerdings, nicht ganze Sätze zu
                        formulieren, da die Übersichtlichkeit
                        darunter leiden könnte. </div>
                    <div v-if="currentStrategy=='exzerpt'">
                        Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte. Gerade wenn
                        es darum geht, vor einer Prüfung
                        Lerninhalte noch einmal zu wiederholen, helfen Ihnen Exzerpte oder Zusammenfassungen dabei,
                        schnell in die einzelnen Wissensbereiche
                        einzutauchen, ohne auf das ausführliche Kursmaterial zurückzugreifen. Zudem können Sie schon bei
                        der Erstellung eines Exzerpts üben,
                        Wissen in eigenen Worten wiederzugeben. Auch kritische Perspektiven und eine wissenschaftliche
                        Schreibweise sollten Sie in einem Exzerpt
                        berücksichtigen.
                    </div>
                    <div v-if="currentStrategy=='toc'">
                        Gliederungen helfen, einen Überblick über den zu lernenden Inhalt zu bekommen. Wissen kann so
                        leichter strukturiert oder kategorisiert
                        werden. Themenfelder lassen sich mit einer Gliederung z. B. übersichtlich strukturieren.
                    </div>
                    <div v-if="currentStrategy=='structure'">
                        Um den Lernstoff klarer darzustellen, ist die Erstellung von Tabellen, Diagrammen, Listen oder
                        Schaubildern hilfreich. Fachausdrücke
                        oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.
                    </div>
                    <div v-if="currentStrategy=='cardsearly'">
                        Lernkarten können schon sehr früh digital z. B. in einer App oder auf Papier erstellt werden und
                        die Lernorganisation so erleichtern.
                        Dabei können nicht nur Begriffe notiert werden, sondern auch Prozesse oder mögliche
                        Fragestellungen, die Sie z. B. in der Prüfung
                        erwarten könnten.
                    </div>
                    <div v-if="currentStrategy=='fastreading'">
                        <p>Üben Sie das schnelle Lesen, indem Sie einmal probieren, so schnell zu lesen, wie Sie
                            können.Lesen Sie so schnell, dass Sie kaum etwas
                            vom Inhalt des Textes mitbekommen. Betrachten Sie das als eine Tempo-Übung.Eine weitere
                            Übung, um die Lesegeschwindigkeit zu erhöhen,
                            ist die Vergrößerung des Fixierungsbereichs; lesen Sie in Wortgruppen anstelle des
                            wortwörtlichen Lesens. Beide Prozesse werden durch
                            die nachfolgenden Abbildungen dargestellt:<img class="w-50"
                                :src="moodlePath + '/course/format/serial2/pix/schnelle_Lesebewegung.png'" /><img
                                class="w-50"
                                :src="moodlePath + '/course/format/serial2/pix/normale_Lesebewegung.png'" />Eine
                            weitere unterstützende Technik bietet die
                            Beschleunigung des Lesefingers. Lesen Sie zu Beginn mit dem Finger unter den Zeilen. Das
                            schult die Blickbewegung, so dass mehrere Worte
                            auf einmal wahrgenommen werden können. Steigern Sie dabei das Tempo Ihres Fingers; je
                            schneller der Finger über die Zeilen gleitet,
                            desto schneller müssen Sie auch lesen.</p>

                        <p>Quelle:<br> Stary, J. &amp; Kretschmer, H. (1994). Umgang mit wissenschaftlicher Literatur.
                            Eine
                            Arbeitshilfe für das sozial- und geisteswissenschaftliche Studium (3.Auflage). Berlin:
                            Cornelsen Scriptor.</p>
                    </div>
                    <div v-if="currentStrategy=='readingcomprehension'">
                        Gibt es trotz aller getroffenen Vorbereitungsmaßnahmen noch Probleme, den Text zu verstehen?
                        Auch das kann passieren und manchmal
                        schleichen sich damit zusätzliche gedankliche Blockaden ein. Folgende Tipps helfen Ihnen jedoch
                        vielleicht weiter:<ul>
                            <li>Schlagen Sie Fachbegriffe, die Ihnen noch fremd sind, nach und überlesen Sie diese
                                nicht.</li>
                            <li>Ändern Sie Ihre Lesetechnik.</li>
                            <li>Dokumentieren Sie Ihren Lernfortschritt und zwar Abschnitt für Abschnitt. Im Laufe der
                                Zeit werden Sie vermutlich merken, dass
                                Sie mehr verstanden haben, als Sie zunächst dachten.</li>
                            <li>Greifen Sie zu Sekundärliteratur. Manchmal muss ein Sachverhalt nur mit anderen Worten
                                erklärt werden und schon versteht man ihn
                                besser.</li>
                            <li>Bilden Sie Lerngruppen und versuchen Sie anderen zu erklären, was Sie bereits verstanden
                                haben.</li>
                        </ul>Auch wenn es am Anfang mühsam ist: Bleiben Sie am Ball und lassen Sie sich auch von
                        auftretenden Problemen nicht abschrecken. Gehen
                        Sie in den Austausch mit anderen und nutzen Sie die Diskussionsforen in der Lernumgebung. Ihren
                        Kommilitonen und Kommilitoninnen wird es
                        nicht anders gehen als Ihnen!
                    </div>
                    <div v-if="currentStrategy=='transfertoknown'">
                        Wenn Sie sich neue Wissensschemata aneignen möchten, können diese schneller bzw. einfacher
                        gelernt werden, wenn Sie diese mit Beispielen
                        in der eigenen Praxis oder dem eigenen Arbeitsumfeld in Verbindung bringen. Zudem kann dieses
                        auf eine Generalisierbarkeit hin überprüft
                        werden. Wissen, Prozesse oder Modelle können z. B. auf verschiedene Beispiele übertragen werden.
                        So veranschaulichen Sie diese und
                        prüfen kritisch eine mögliche Generalisierbarkeit.
                    </div>
                    <div v-if="currentStrategy=='criticalquestioning'">
                        Kritisches Hinterfragen eines Textes steigert die Aufmerksamkeit. Ein geübter Leser kann so bald
                        Wichtiges von Unwichtigem
                        unterscheiden.
                    </div>
                    <div v-if="currentStrategy=='subjectrelations'">
                        Manche Inhalte kennen Sie ggf. aus einem anderen Kurs oder sie kommen einem irgendwie bekannt
                        vor. In diesem Fall können Sie auf das
                        bereits vorhandene Wissen zurückgreifen und müssen Dinge nicht neu lernen. Oft hilft es, wenn
                        Sie sich an die bereits gelernten
                        Zusammenhänge erinnern.
                    </div>
                    <div v-if="currentStrategy=='PQ4R'">
                        Diese Methode wird für das lernende Bearbeiten von Texten empfohlen. Hinter dem Kürzel
                        verstecken sich sechs Schritte:
                        <p><span class="font-weight-bold">Preview –</span> Übersicht gewinnen
                            Kursorisches Lesen (Überfliegen des gesamten Textes) vermittelt einen Überblick und ersten
                            Eindruck: Welche Intention des Autors/der
                            Autorin
                            wird im Vorwort oder in der Einleitung deutlich? Welche Themen und Theorien erwarten mich?
                            Informationen über den Text sammeln: Welche Personen werden thematisiert? Welche Theorien
                            werden vorgestellt?
                            Vorwissen aktivieren: Was haben Sie bspw. bereits in anderen Kontexten über Platon oder Kant
                            gelernt?
                            Struktur des Textes kennenlernen: Wie sind bspw. die einzelnen Textabschnitte aufgebaut? Wo
                            enden die einzelnen Sinneinheiten? (Bei
                            Texten,
                            die kein Zwischenüberschriften verwenden, können Sie eigene formulieren)
                            Unbekannte Wörter und Begriffe notieren und nachschlagen
                        </p>
                        <p>
                            <span class="font-weight-bold">Questions –</span> Fragen an den Text stellen
                            W- Fragen: Was? Warum? Wozu? Wie? Wer? Wo? Wann?
                            Bsp.: Wer hat den Text geschrieben? Wann und in welchem Kontext? Warum bezieht sich der
                            Autor auf die verwendeten Begriffe und nicht auf
                            andere? Wo gibt es Parallelen zu Ihrer Fragestellung? Fragen wecken Interesse und Neugier,
                            was das Lesen erleichtert.
                        </p>

                        <p><span class="font-weight-bold">Read –</span> Zweiter Leseschritt
                            Gründliches Lesen des Textes. Lesen Sie jeden Abschnitt gründlich.
                            Versuchen Sie, die an den Text gestellten Fragen zu beantworten, so lesen Sie
                            zielgerichteter.
                            Markieren Sie wichtige Punkte, machen Sie Randbemerkungen
                        </p>
                        <p><span class="font-weight-bold">Reflect –</span> Gedankliche Auseinandersetzung mit dem Text
                            Versuchen Sie den Text zu verstehen, bleiben Sie aber auch kritisch: Ist der Text
                            nachvollziehbar, sind die Behauptungen stimmig? Der
                            Text
                            wird so lebendiger und prägt sich besser ein.
                        </p>
                        <p><span class="font-weight-bold">Recite –</span> Wiederholen aus dem Gedächtnis
                            Verfassen Sie nach dem Lesen eines Abschnittes oder Kapitels ausführliche Notizen, fassen
                            Sie diese in eigenen Worten aus dem Gedächtnis
                            zusammen, vergleichen Sie mit der entsprechenden Textpassage, wenn Sie nicht weiterkommen.
                        </p>
                        <p><span class="font-weight-bold">Review –</span> Rückblick und Überprüfung
                            Kontrollieren Sie Ihre Aufzeichnungen und erstellen Sie Zusammenfassungen, oder
                            visualisieren Sie Ihre Ergebnisse.
                        </p>
                        <br>
                        Quelle:<br>
                        Thomas, E. L./Robinson, H.A. (1972). Improving reading in every class: A sourcebook for
                        teachers. Boston: Houghton Mifflin.

                    </div>
                    <div v-if="currentStrategy=='cards'">
                        Mit einer Lernkartei können Sie Dinge systematisch wiederholen. Eine Karte wandert bei einer
                        richtigen Antwort ein Fach weiter, bei
                        einer falschen Antwort bleibt die Karte im Fach. Das 1. Fach wird z. B. täglich wiederholt, das
                        2. Fach alle 3 Tage usw. So arbeiten Sie
                        sich durch Ihre Lernkartei, bis alles für die Prüfung sitzt.
                    </div>
                    <div v-if="currentStrategy=='repetitions'">
                        <p>Mit vielen Wiederholungen festigt sich Wissen. Als Wiederholungstrategien werden solche
                            Lerntätigkeiten bezeichnet, mit denen durch
                            das einfache Wiederholen einzelner Fakten eine feste Verankerung im Langzeitgedächtnis
                            erreicht wird. Sie beziehen sich nicht nur
                            auf isolierte Begriffe oder Fakten, sondern können - je nach Fachgebiet - auch das Einprägen
                            von Zusammenhängen und Regeln zum
                            Gegenstand haben. Zu den Wiederholungsstrategien gehört beispielsweise</p>
                        <ul>
                            <li>Wortlisten wiederholt durcharbeiten;</li>
                            <li>eigene Aufzeichnungen mehrmals nacheinander durchlesen;</li>
                            <li>Schlüsselbegriffe auswendig lernen, um sich in einer Prüfung besser an wichtige
                                Inhaltsbereiche erinnern zu können;</li>
                            <li>einen Text durchlesen und sich anschließend den Inhalt selbst erklären.</li>
                        </ul>
                        <p>Quelle:<br> Wild, K. – P., &amp; Klein-Allermann, E. (1995). Nicht alle lernen auf die
                            gleiche Weise. Individuelle Lernstrategien und
                            Hochschulunterricht. In B. Behrendt (Ed.), Handbuch Hochschullehre. Bonn: Raabe Verlag
                            (Stangl, 2020).</p>
                    </div>
                    <div v-if="currentStrategy=='reminder'">
                        Mit einem Reim oder einer Eselsbrücke können Sie sich Begriffe oder Reihenfolgen einfacher
                        merken.
                    </div>
                    <div v-if="currentStrategy=='remindercomplex'">
                        Die Loci-Methode oder auch der Lernspaziergang sind Methoden, um sich Dinge in einer konkreten
                        Reihenfolge einzuprägen. Mit der Loci
                        Methode können Sie sich komplexe Dinge wie z. B. Prozesse oder Stufenmodelle schneller merken,
                        indem Sie Lerninhalte mit
                        Gegenständen oder Orten und Abfolgen aus dem Alltag verknüpfen. Diese Methode ist auch als
                        Gedächtnisspaziergang bekannt.
                    </div>
                    <div v-if="currentStrategy=='planning'">
                        Bei der Planung kommt es darauf an Anforderungen zu analysieren, Lernziele zu formulieren und
                        passende Lernstrategien für die
                        Umsetzung auszuwählen. Der Meilensteinplaner in dieser Lernumgebung soll Sie dabei unterstützen.
                        In einem Meilenstein können Sie ein
                        Lernziel und die Anforderungen dazu festhalten. Über das Menü können Sie dann Aktivitäten und
                        Materialien aus der Lernumgebung
                        auswählen oder individuelle Arbeitsmaterialien vermerken.
                    </div>
                    <div v-if="currentStrategy=='prepare'">
                        Was gehört zu einer guten Vorbereitung? Zunächst einmal sollten Sie sich ein anregendes
                        Arbeitsumfeld schaffen und dafür einen
                        geeigneten Ort wählen.Dieser Ort wird in den nächsten Wochen und Monaten Ihr ganz persönlicher
                        Arbeitsplatz sein.Viele Studierende
                        können besser lernen, wenn sie dafür einen Ort auswählen, den sie mögen und der für sie positiv
                        besetzt ist.Dies kann beispielsweise
                        die Bibliothek in der Nähe sein oder ein ruhiges Arbeitszimmer, in dem man schon andere Dinge
                        bearbeitet hat, die zum Erfolg
                        führten.Ihr Arbeitsbereich sollte möglichst störungs- und ablenkungsfrei sein und Sie sollten
                        die notwendige Ausstattung
                        eingerichtet oder griffbereit haben.Erzwungene Lernpausen, weil man erst den Stift suchen muss
                        oder der Textmarker fehlt, sind
                        ärgerlich und unnötig.Überlegen Sie also, welche Materialien Sie für Ihren Arbeitsprozess
                        brauchen und legen Sie sich diese vorab
                        zurecht.Sorgen Sie dafür, dass Ihr elektronisches Endgerät auf dem neuesten Stand ist und eine
                        genügend große Bandbreite für die
                        Datenübertragung zur Verfügung steht.Dann kann es ja weiter gehen.
                    </div>
                    <div v-if="currentStrategy=='selfevaluation'">
                        Überprüfen Sie immer wieder Ihr Verständnis der Kursinhalte. Nutzen Sie dazu Quiz,
                        Übungsaufgaben und Self-Assessments, die Ihnen
                        ein Feedback zu Ihrem Lernstand geben. Ihr Ziel sollte es sein, sich immer besser selbst
                        einschätzen zu können. Die Ansichten zum
                        Lernfortschritt und die Quiz-Übersicht hilft ihnen dabei wahrzunehmen, wie groß Ihr Fortschritt
                        ist.
                    </div>
                    <div v-if="currentStrategy=='regulations'">
                        Regulationsstrategien dienen in der Regel der Identifikation von Verständnislücken und tragen
                        zum Ergreifen von Maßnahmen zur
                        Schließung der Lücken bei. Es gibt verschiedene Ansätze, um Ihr Lernen zu regulieren. Dabei
                        gestaltet sich dieser Prozess in der
                        Regel sehr individuell für eine*n Lernenden. Man kann nicht mit Bestimmtheit sagen, dass nur
                        bestimmte Lernstrategien direkte
                        positive Wirkungen auf den Studienerfolg haben. Vielmehr gibt es auch die Überlegung, dass Sie
                        je nach Lerntyp mit unterschiedlichen
                        Lernstrategien zum Studienerfolg kommen können. Insofern erscheint es erforderlich, den
                        Strategieeinsatz zu planen, zu reflektieren
                        und ggf. anzupassen. Überprüfen Sie, welche Prüfungsanforderungen gegeben sind (z. B. reines
                        Faktenwissen auswendig lernen oder
                        Zusammenhänge erkennen, Wissen auf neue Anwendungsgebiete zu transferieren), auf welche
                        Ressourcen Sie zurückgreifen können (z. B.
                        gemeinsames Lernen mit Kommilitonen*innen) und planen Sie die Zeit für den Lernaufwand bzw. die
                        konkrete Prüfungsvorbereitung ein.
                        Reflektieren Sie außerdem, welche Lernerfahrungen Sie bisher gemacht haben und welche Lernstile
                        und -strategien Sie bevorzugen.
                        Überlegen Sie, wie und in welchen Situationen Sie am besten lernen. Welche Lernstrategien Sie
                        nutzen, hängt nicht zuletzt auch davon
                        ab, welche Lernerfahrungen Sie machen. Wenn Sie merken, dass Sie besonders gut gemeinsam mit
                        anderen Kommilitonen/-innen lernen
                        können, werden Sie das kooperative Lernen als Lernstrategie womöglich im weiteren Verlauf Ihres
                        Studiums beibehalten. Diese
                        Lernumgebung unterstützt Sie, indem zum Abschluss jedes Meilensteins eine Reflexion angeboten
                        wird. Die Erkenntnisse, die Sie sich
                        in diesem Reflexionsprozess im Freitextfeld notieren werden für Sie hier im Bereich
                        Lernstrategien für Sie festgehalten. So können
                        Sie die Entwicklung Ihrer Lernstrategien selbst beobachten und nachvollziehen.
                    </div>
                    <div v-if="currentStrategy=='goals'">
                        Informationen zu den Prüfungsanforderungen finden Sie in der Regel im Modulhandbuch bzw. im
                        Studienportal und in der
                        Moodle-Lernumgebung des jeweiligen Moduls. Große Lernziele stellen beispielsweise das Bestehen
                        einer Prüfung oder ein zügiger
                        Fortschritt im Studium dar.Die Arbeit an diesen Zielen erstreckt sich zudem über einen recht
                        langen Zeitraum, der von Ihnen vor
                        allem Disziplin und Durchhaltevermögen verlangt.Um Ihr großes Ziel zu erreichen, macht es daher
                        Sinn, dieses in kleinere - schneller
                        zu erreichende - Ziele aufzuteilen. Kleinere Lernziele können zum einen die Lerninhalte sein,
                        die Sie für ein Modul
                        erarbeiten.Hierzu bieten einige Module eine zeitliche Strukturierung oder einen Lesekurs an, mit
                        denen Sie dann systematisch durch
                        das Studienmaterial geleitet werden.Zusätzlich können Sie sich auch ganz individuelle Ziele
                        setzen.Kleinere Ziele können zum
                        Beispiel wie folgt aussehen:<ul>
                            <li>ein Kapitel im Studienbrief lesen und zusammenfassen</li>
                            <li>Lernkarten zu einem Themenbereich erstellen</li>
                            <li>eine bestimmte Anzahl an Übungsaufgaben lösen</li>
                            <li>eine Seite für die Hausarbeit verfassen</li>
                        </ul>Setzen Sie zu Beginn eines jeden Semestern Ihre großen und kleinen Lernziele fest und
                        überlegen Sie sich eine möglichst
                        realistische Zeitvorgabe, um Ihre Ziele zu erreichen.Lassen Sie dabei Ihren Gesamtzeitplan für
                        Ihr Studium aber nicht außer Acht.
                    </div>
                    <div v-if="currentStrategy=='demand'">
                        Auswendiglernen oder Verstehen?Der Philosoph Karl Propper beschreibt in seiner
                        Scheinwerfertheorie die Erweiterung des menschlichen
                        Geistes als das Leuchten eines Scheinwerfers. Demnach geht eine wissenschaftliche Erkenntnis
                        immer von einem gesetzten
                        Erwartungshorizont aus. Dieser ist geprägt vom Vorwissen des/der Lernenden, der/die nur das
                        erfassen kann, worauf er/sie
                        seinen/ihren Fokus aufgrund des Vorwissens gerichtet hat. Der Scheinwerfer, der zur neuen
                        Erkenntnis führt, ist also immer auf das
                        Vorwissen zurückzuführen (Popper,1984, S.360).Im Umkehrschluss bekennt Lehner(2015): „Wer ein
                        bestimmtes Wissen – dazu gehören
                        faktische Details genauso wie Definitionen oder Modelle – verfügbar hat, der kann weitergehende
                        Informationen ableiten
                        bzw.rekonstruieren.“ (S.16) Faktenwissen ist also wichtig, um überhaupt bestimmte Sachverhalte
                        erst wahrnehmen und erfassen zu
                        können.Dass Studierende in der Lage sind, ihr Lernverhalten jederzeit zwischen Auswendiglernen
                        und Verstehen anzupassen, erkannten
                        auch die Psychologen Marton & amp; Säaljö(1976).Ein solcher Wechsel kann jederzeit stattfinden:
                        wenn zum Beispiel ein Stoff als zu
                        schwierig empfunden wird oder das Zeitbudget schwindet, wird Auswendiglernen dem
                        Verständnislernen vorgezogen.Verstehen wiederum ist
                        umso leichter, je mehr auf ad hoc verfügbares Wissen zurückgegriffen werden kann.So entstehen
                        Verknüpfungen zwischen Bekanntem und
                        Neuem, welche neues Wissen konstruieren(vgl.Lehner,2015).Es verlangt also weniger Anstrengung
                        etwas zu verstehen, wenn man auf
                        bereits Gelerntes aufbauen kann.Genauso kann es effektiver sein, Dinge, die man noch nicht
                        versteht, erst einmal auswendig zu lernen
                        und dann später das Verständnis zu rekonstruieren.Ein wechselseitiger Prozess aus
                        Auswendiglernen und Verstehen führt also zu
                        geringerer Anstrengung.Um etwas zu lernen, bedarf es jedoch noch weitere Schritte.Steiner(2013)
                        formulierte treffend: „Seien wir
                        realistisch.Der Lernprozess ist noch nicht abgeschlossen, wenn wir ein Kapitel erarbeitet und
                        verstanden haben.“ (S. 243).In einer
                        Prüfung muss man in der Regel das Gelernte auch wiedergeben oder erklären können.Verständnis ist
                        also eine wesentliche Voraussetzung
                        des Lernens, doch erst durch das Wiedergegebene kann Gelerntes auch demonstriert und für ein
                        tiefergehendes Verständnis genutzt
                        werden.Für eine Prüfungsvorbereitung ist also beides unabdingbar, Auswendiglernen und Verstehen,
                        das allein nützt jedoch wenig, wenn
                        man dieses nicht auch klar und strukturiert wiedergeben kann.
                        <br>
                        Quellen:
                        <ul>
                            <li>Lehner, M. (2015). Viel Stoff - schnell gelernt: Prüfungen optimal vorbereiten. Bern:
                                Haupt.</li>
                            <li>Marton, F. &amp; Säaljö, R. (1976). On qualitative differences in learning II - outcome
                                as a function of the learner’s
                                conception of the task. British Journal of Educational Psychology,46 (2),115–127.</li>
                            <li>Popper, K. R. (1984). Objektive Erkenntnis (4. Aufl.). Hamburg: Hoffmann &amp;
                                Campe.Steiner, V. (2013). Konzentration
                                leicht gemacht: Die wirksamsten Methoden für Studium, Beruf und Alltag. München: Piper.
                            </li>
                        </ul>
                    </div>
                    <div v-if="currentStrategy=='attention'">
                        <p>Grundsätzlich ist es im Studium von großem Vorteil für Sie, wenn Sie kontinuierlich lernen.
                            Verstehen ist weniger anstrengend, wenn
                            Sie auf bereits Bekanntem aufbauen können. Verteiltes und wiederholendes Lernen ist dabei
                            effektiver als das so genannte
                            Bulimie-Lernen. Am Tag gibt es zudem Zeiten, zu denen man sich besser konzentrieren kann und
                            Zeiten, zu denen das fast unmöglich
                            erscheint. Anhand der folgenden Fragen können Sie für sich selbst überlegen, wann Ihnen
                            Lernen wahrscheinlich leichter fällt und
                            welche Zeit Sie wann zum Lernen benötigen.
                        </p>
                        <ul>
                            <li>Wie lange können Sie sich konzentriert und fokussiert mit einem Text aus einem
                                Studienbrief beschäftigen?</li>
                            <li>Zu welchen Zeiten haben Sie genügend Energie, um sich mit neuen Inhalten auseinander zu
                                setzen?</li>
                            <li>Wann ist es Ihnen voraussichtlich auf keinen Fall möglich, Ruhe zum Lernen zu finden?
                            </li>
                        </ul>
                        <p>
                            Im Verlauf Ihres Studiums werden Sie vermutlich Ihre Aufmerksamkeitsspanne steigern können,
                            wenn Sie sich regelmäßig darin
                            üben, sich zu fokussieren.
                        </p>
                        <p><strong>Multitasking – geht das wirklich?</strong>
                        </p>
                        <p>Bereits 1997 stellten Bujon und Quaireau fest, dass eine
                            durch unterschiedliche Einflüsse geteilte Aufmerksamkeit zu einer verminderten Leseleistung
                            führt. Die Forscher unterschieden in
                            einem Versuch zwischen dem Einfluss von klassischer Musik, einer gesprochenen Tontonspur
                            sowie eines Videos als Störquellen in Bezug
                            auf die Leseleistung von Probanden. Sie stellten fest, dass Musik kaum die Leseleistung
                            beeinflusst hat (&lt;5%), während das
                            gleichzeitige Hören einer gesprochenen Sprache die Leseleistung bereits zu einem Viertel
                            verringerte. Bei der Präsentation eines
                            Videos während des Leseprozesses lag die Minderungsquote sogar bei 40% (vgl. Boujon,
                            Quaireau, 1997).Andere Forschungen legen dar,
                            dass Personen, die häufig Multitasking praktizieren, leichter durch äußere Reize abgelenkt
                            werden, wohingegen Personen, die weniger
                            Multitasking praktizieren, effektiver darin sind, ihre Aufmerksamkeit willentlich auf eine
                            Aufgabe auszurichten(vgl.Ophir, Nass &
                            amp; Wagner,2009).Multitasking ist im Lernkontext demnach nicht wirklich zielführend.Gehen
                            Sie daher bewusst mit Ihrer Zeit um,
                            trennen Sie Lernen und Freizeit voneinander und berücksichtigen Sie dies auch bei der
                            Planung Ihrer Lernzeiten.</p>
                        <br>
                        Quellen:
                        <ul>
                            <li>Boujon, C. &amp; Quaireau, C. (1997). Attention et réussite scolaire. Dunod.</li>
                            <li>Ophir, E., Nass, C., &amp; Wagner, A. D. (2009). Cognitive control in media
                                multitaskers. Proceedings of the</li>
                            <li>National Academy of Sciences,106 (37),15583–15587.</li>
                        </ul>
                    </div>
                    <div v-if="currentStrategy=='resourcemanagement'">
                        Verstärkung, Belohnung, Entspannung und Sport Vergessen Sie nicht, sich selbst auch einmal für
                        die erreichten Ziele zu belohnen.Die
                        Belohnung sollten Sie sich dann immer unmittelbar nach dem Erreichen des zuvor definierten Ziels
                        gönnen.Und belohnen Sie sich auch
                        wirklich nicht, wenn Sie Ihr Ziel nicht erreichen! Belohnungen sollten zudem etwas Besonderes
                        sein und allein dafür reserviert
                        werden.Sie sollten nicht zu den alltäglichen Dingen gehören.Neben dem Lernen ist es zum Beispiel
                        auch wichtig, Stress abzubauen und
                        so wieder aufnahmefähig für Neues zu werden.Gönnen Sie sich, Ihrem Geist und Körper also
                        regelmäßig Sport und Entspannung.Besonders
                        gut eignet sich dafür Ausdauersport wie Joggen, Schwimmen, Rudern, Tennis oder eine entspannte
                        Runde auf dem Crosstrainer.Auch Yoga,
                        Autogenes Training o.Ä.sind nicht zu unterschätzende Begleiter im Studium.
                    </div>
                    <div v-if="currentStrategy=='timemanagement'">
                        <p>Wenn Sie das Ziel verfolgen, die Prüfung zu absolvieren, wurde Ihnen vom System eine erste
                            Planung erstellt. Dieser ist nur ein
                            erster Vorschlag, den Sie sich in einem weiteren Schritt individuell anpassen sollten.
                            Eventuell arbeiten Sie auch gerne mit
                            detaillierteren Plänen oder To-do-Listen für jeden Tag. Auch diese lassen sich durch die
                            Freitexteingaben erstellen und können dann
                            abgehakt werden. Für Planungen sind i. d. R. individuelle Faktoren leitend, z. B.
                        </p>

                        <ul>
                            <li>Individuelles Zeitkontingent: Vollzeit- oder Teilzeitstudium, Vereinbarkeit Studium und
                                Beruf</li>
                            <li>Private Verpflichtungen: Familie, Freunde, Vereinstätigkeiten</li>
                            <li>Wohnort: Öffnungszeiten und Anfahrt zur Bibliothek</li>
                            <li>Individuelle Termine: Arbeitszeiten, Weiterbildungen, Urlaubsreisen</li>
                            <li>Individuelle Ziele: Weiterbildung, persönliche Entwicklung, Notenwunsch, Studiendauer
                            </li>
                            <li>Individuelle Ressourcen: Vorwissen, Vorerfahrungen, vorhandenes Arbeitsmaterial,
                                Lesegeschwindigkeit</li>
                        </ul>
                    </div>
                    <div v-if="currentStrategy=='effectivetimemanagement'">
                        <p>Eine sehr effektive Methode des Zeitmanagements ist die Pomodoro-Technik, die in den 1980er
                            Jahren von Francesco Cirillo
                            entwickelt wurde. Das System ist recht simpel: Francesco Cirillo teilte seine Arbeit in
                            25-Minuten-Abschnitte und Pausenzeiten
                            ein. Die Idee dahinter ist, dass häufige Pausen die geistige Beweglichkeit verbessern
                            können. Zu Beginn nutzte Cirillo einen
                            Kurzzeitwecker aus seiner Küche, der die Form einer Tomate (ital. Pomodoro) hatte. Francesco
                            Cirillo arbeitete sich so an einem
                            Vormittag zunächst durch vier "Pomodori" (plural von Pomodoro), bevor er eine längere Pause
                            machte.</p>
                        <p>Nach dieser Technik planen Sie je nach Priorität den aktuellen Tag und visualisieren das, was
                            Sie geschafft haben. Ein wichtiges
                            Ziel der Technik ist zudem die Reduktion von Unterbrechungen. Sowohl interne (Abschweifen)
                            als auch externe Störungen sollten
                            als Unterbrechung vermerkt und zu einem späteren Zeitpunkt abgearbeitet werden.</p>
                        <p>Fangen Sie einfach einmal an und probieren Sie die folgenden Schritte aus:</p>
                        <ul>
                            <li>Wählen Sie Ihre Aufgaben und halten Sie diese als „Pomodori" fest.</li>
                            <li>Stellen Sie nun den Wecker und setzten Sie sich selbst Ihr Ziel, das Sie in 25 Minuten
                                ohne Unterbrechung erreichen möchten.
                            </li>
                            <li>Los geht's! Bearbeiten Sie die Aufgabe bis der Wecker klingelt.</li>
                            <li>Geschafft, diese „Pomodoro" kann abgehakt werden!</li>
                            <li>Nun machen Sie eine kurze Pause (5 Minuten) und dann geht es weiter mit der nächsten
                                „Pomodoro".</li>
                            <li>Alle vier „Pomodori" gibt es eine längere Pause (15-20 Minuten).</li>
                        </ul>
                        <p>Schauen Sie doch einmal in Ihrem App-Store, es gibt zahlreiche Pomodoro-Apps, die Sie nutzen
                            können. Eine einfache Stoppuhr und
                            ein Block erfüllen aber sicher auch ihren Zweck und Ihr Handy schalten Sie für den Anfang
                            einfach einmal in den Flugmodus.</p>
                        <p>Quelle:<br>
                            Cirillo, F. (2013). The Pomodoro Technique: do more and have fun with time management.
                            Berlin: FC Garage.
                            <a href="http://pomodorotechnique.com/">http://pomodorotechnique.com/</a>
                        </p>
                    </div>
                    <div v-if="currentStrategy=='partner'">
                        Nutzen Sie den Austausch mit Kommilitonen*innen, um Lernstoff zu diskutieren, um sich
                        gegenseitig Lerninhalte zu erklären, oder auf
                        spielerische Weise ein Speed-Quiz zu machen. Oft klärt ein Nachfragen bei einem Kommilitonen
                        offene Fragen schneller, wenn man
                        selbst die Antwort nicht auf Anhieb finden kann. Lernpartner können zudem dabei helfen ein
                        Motivationstief zu überwinden.
                    </div>
                    <div v-if="currentStrategy=='selfcommittment'">
                        Gerade das Fernstudium verlangt von Ihnen eigenständiges Arbeiten und Selbstorganisation. Nehmen
                        Sie sich also selbst in die Pflicht
                        und setzen Sie sich Teilziele, die systematisch erarbeitet werden können. Dafür ist ein
                        realistischer Zeitplan, in dem Sie
                        regelmäßige und feste Lernzeiten verbindlich festlegen, aber auch nötige Pausen, Ferien und
                        Entspannungszeiten berücksichtigen, sehr
                        hilfreich.
                    </div>
                    <div v-if="currentStrategy=='literature'">
                        Weiterführende Literatur ist im Studium eine wichtige Ressource. Schlagen Sie unbekannte
                        Fachbegriffe nach, oder schließen Sie
                        Verständnislücken, indem Sie zu weiterführender Literatur greifen, die Ihnen den Sachverhalt z.
                        B. aus einer anderen Perspektive
                        veranschaulicht. Nutzen Sie dazu auch das Angebot der Universitätsbibliothek in Hagen oder das
                        einer Bibliothek in der Nähe Ihres
                        Wohnortes.
                    </div>
                    <div v-if="currentStrategy=='timethefts'">
                        Die süßen kleinen „Zeitdiebe" können als objektive oder subjektive Störungen verstanden werden.
                        <ul>
                            <li>Sie lungern um uns herum - Zeitschrift; Smartphone; TV; Internet</li>
                            <li>Sie kommen zu uns - Lärm; Kinder; Besuch; der Partner; das Haustier oder die
                                Sonderangebote, die ihr Browser für Sie
                                gefunden hat</li>
                            <li>Sie verkleiden sich als der innere Schweinehund -Unlust; wenig Disziplin; Gedanken an
                                Unerledigtes; nicht NEIN sagen können;
                                Beziehungsstress oder Hilfsbereitschaft</li>
                            <li>Oder plötzlich und unerwartet haben sie sich angebahnt - Verspätungen im ÖPV;
                                Termindruck; Zeitdruck, weil man zu viel
                                hinausgeschoben hat; Unordnung im Zimmer, die stört; Prokrastination oder Lernblockaden
                            </li>
                            <li>Identifizieren Sie Ihre persönlichen Zeitdiebe. Benennen Sie Ihre fünf gefährlichsten
                                Gegner. Erforschen Sie die Ursachen
                                und überlegen Sie sich, wie Sie dagegen vorgehen könnten, damit Sie sich in Zukunft
                                nicht die Zeit stehlen lassen.</li>
                        </ul>
                        <br>
                        Quelle:<br> Meier, H. (1998). Selbstmanagement im Studium. Ludwigshafen (Rhein): Kiehl.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.strategy-introduction {
    font-size: .9em
}

.resources-title,
.strategy-title {
    font-weight: 700;
    font-size: 1.1em
}

.milestone-entry-details .resources-title,
.milestone-entry-details .strategy-title {
    font-size: 1em;
    font-weight: 400;
    margin: 4px 0 0 0
}

.strat-col-1 {
    min-width: 45px
}

.milestone-entry-details .strat-col-1 {
    min-width: 45px
}

.milestone-entry-details .strat-col-2 {
    margin-left: 19px
}

.strategy-list {
    padding: 0
}

.strategy-category {
    margin: 0
}

.strategy-category-title {
    font-weight: 700;
    font-size: .8em;
    color: #333536
}

.strategy-category-item {
    display: inline-block;
    font-size: .8em;
    margin: 0;
    width: 100%;
    line-height: 1;
    padding: 3px 3px
}

.strategy-category-item:hover {
    background-color: #ced4da
}

.strategy-category-item button.btn {
    display: inline;
    vertical-align: none;
    margin: 0;
    padding: 0 2px !important;
    line-height: 1;
    cursor: pointer
}

.resources-header,
.strategy-header {
    font-size: .8em;
    color: #83878b
}

.resources-selected-item,
.strategy-selected-item {
    padding-left: 10px;
    list-style: none
}

.resources-selected-item:hover,
.strategy-selected-item:hover {
    background-color: #ced4da
}

.resources-selected-item.ms-done,
.strategy-selected-item.ms-done {
    background-color: #80bd9e
}

.resources-selected-item.ms-done:hover,
.strategy-selected-item.ms-done:hover {
    background-color: #a7e7c7
}

.resources-selected-label,
.strategy-selected-label {
    padding: 0;
    margin: 0;
    position: relative;
    width: 100%
}

.recourses-selected-check,
.strategy-selected-check {
    vertical-align: middle
}

.resources-selected-name,
.strategy-selected-name {
    font-size: .8em;
    margin-left: 19px
}

a.resources-selected-name {
    text-decoration: underline
}

.resources-selected-item button.btn,
.resources-selected-remove,
.strategy-selected-item button.btn,
.strategy-selected-remove {
    display: inline;
    vertical-align: none;
    margin: 0;
    padding: 0 4px !important;
    line-height: 1;
    cursor: pointer;
    color: #333
}

.resources-selected-remove,
.strategy-selected-remove {
    right: 0;
    position: absolute;
    font-size: .9em
}

.resources-selected-item button.btn:hover,
.resources-selected-remove:hover,
.strategy-selected-item button.btn:hover,
.strategy-selected-remove:hover {
    color: #fff
}

.resources-selected-remove i,
.strategy-selected-remove i {
    padding-top: 4px
}

[data-toggle="collapse"]::after {
  content: none;
}

[data-toggle="collapse"].collapsed::after {
    content: none;
}

</style>