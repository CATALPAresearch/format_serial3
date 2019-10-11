/* eslint-disable space-before-function-paren */
/* eslint-disable spaced-comment */
/* eslint-disable capitalized-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

/* eslint-disable valid-jsdoc */
/**
 * InitialSurvey
 *
 * @module     format/ladtopics
 * @package    format_ladtopics
 * @class      InitialSurvey
 * @copyright  2019 Niels Seidel, niels.seidel@fernuni-hagen.de
 * @license    MIT
 * @since      3.1
 */

define(['jquery'], function ($) {

    /**
     * Render a survey form
     * @param milestoneApp (Object) Data Driven Documents
     * @param utils (Object) Custome util class
     */
    var survey = function (Vue, Sortable, milestoneApp, utils, course) {
        var biwiCourse = 3;
        var csCourse = 2;
        var courseid = parseInt($('#courseid').text(), 10);
        var milestonePresets = {};
        milestonePresets.biwi = {};
        milestonePresets.biwi.exame = [
            {
                "id": 83,
                "name": "Willkommen im Modul 1D",
                "objective": "Orientierung im Modul 1D; Seminare auswählen; Lernpartner finden; Lernen vorbereiten",
                "start": "2019-10-08T10:06:40.107Z",
                "end": "2019-10-06T10:00:00.000Z",
                "status": "missed",
                "progress": 0,
                "resources": [
                    {
                        "id": 43,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "3",
                        "instance_url_id": "7",
                        "instance_type": "forum",
                        "instance_title": "Nachrichtenforum",
                        "section": "12",
                        "name": "Nachrichtenforum"
                    },
                    {
                        "id": 42,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "4",
                        "instance_url_id": "10",
                        "instance_type": "forum",
                        "instance_title": "Allgemeine und organisatorische Themen ",
                        "section": "12",
                        "name": "Allgemeine und organisatorische Themen "
                    },
                    {
                        "id": 40,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "13",
                        "section_name": "Vorstellungsrunde",
                        "instance_id": "6",
                        "instance_url_id": "17",
                        "instance_type": "forum",
                        "instance_title": "Vorstellungsrunde",
                        "section": "13",
                        "name": "Vorstellungsrunde"
                    },
                    {
                        "id": 55,
                        "course_id": "3",
                        "module_id": "17",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "8",
                        "instance_type": "resource",
                        "instance_title": "Vorstellung des Moduls 1D",
                        "section": "12",
                        "name": "Vorstellung des Moduls 1D"
                    },
                    {
                        "id": 54,
                        "course_id": "3",
                        "module_id": "17",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "2",
                        "instance_url_id": "9",
                        "instance_type": "resource",
                        "instance_title": "Betreuungskonzept",
                        "section": "12",
                        "name": "Betreuungskonzept"
                    },
                    {
                        "id": 5,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "5",
                        "instance_url_id": "96",
                        "instance_type": "url",
                        "instance_title": "Präsenz und Onlineseminare",
                        "section": "12",
                        "name": "Präsenz und Onlineseminare"
                    }
                ],
                "strategies": [
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 1
            },
            {
                "id": 113,
                "name": "KE 33060 Bildung in der digitalisierten Gesellschaft (2SWS)",
                "objective": "Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen; Inhalte zur Prüfungsvorbereitung aufarbeiten",
                "start": "2019-10-08T10:09:31.690Z",
                "end": "2019-11-10T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 8,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "2",
                        "instance_url_id": "67",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33060",
                        "section": "14",
                        "name": "Studienbrief 33060"
                    },
                    {
                        "id": 39,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "7",
                        "instance_url_id": "20",
                        "instance_type": "forum",
                        "instance_title": "2 Mediatisierung und Digitalisierung",
                        "section": "14",
                        "name": "2 Mediatisierung und Digitalisierung"
                    },
                    {
                        "id": 14,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "8",
                        "instance_url_id": "21",
                        "instance_type": "forum",
                        "instance_title": "Übungsaufgaben zu Mediatisierung und Digitalisierung",
                        "section": "14",
                        "name": "Übungsaufgaben zu Mediatisierung und Digitalisierung"
                    },
                    {
                        "id": 38,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "9",
                        "instance_url_id": "23",
                        "instance_type": "forum",
                        "instance_title": "3 Bildung im Wandel",
                        "section": "14",
                        "name": "3 Bildung im Wandel"
                    },
                    {
                        "id": 37,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "10",
                        "instance_url_id": "24",
                        "instance_type": "forum",
                        "instance_title": "Übungsaufgaben zu Bildung im Wandel",
                        "section": "14",
                        "name": "Übungsaufgaben zu Bildung im Wandel"
                    },
                    {
                        "id": 36,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "11",
                        "instance_url_id": "26",
                        "instance_type": "forum",
                        "instance_title": "4 Bildung, digitale Medien und Anwendungsfelder",
                        "section": "14",
                        "name": "4 Bildung, digitale Medien und Anwendungsfelder"
                    },
                    {
                        "id": 35,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "12",
                        "instance_url_id": "27",
                        "instance_type": "forum",
                        "instance_title": "Übungsaufgaben zu Bildung, digitale Medien und Anwendungsfelder",
                        "section": "14",
                        "name": "Übungsaufgaben zu Bildung, digitale Medien und Anwendungsfelder"
                    },
                    {
                        "id": 12,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "8",
                        "instance_url_id": "180",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial zum Kurs 33060",
                        "section": "14",
                        "name": "Zusatzmaterial zum Kurs 33060"
                    },
                    {
                        "id": 0,
                        "course_id": "3",
                        "module_id": "25",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "1",
                        "instance_url_id": "72",
                        "instance_type": "hvp",
                        "instance_title": "Platons Höhlengleichnis",
                        "section": "17",
                        "name": "Platons Höhlengleichnis"
                    },
                    {
                        "id": 58,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "3",
                        "instance_url_id": "60",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33060",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33060"
                    }
                ],
                "strategies": [
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "exzerpte",
                        "name": "Exzerpt",
                        "desc": "Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "transfer",
                        "name": "Neues Wissen auf Bekanntes übertr.",
                        "desc": "Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "examples",
                        "name": "Schemata auf Arbeit/Alltag übertr.",
                        "desc": "Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "critical",
                        "name": "Kritisches Hinterfragen",
                        "desc": "Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "structuring",
                        "name": "Bezug zu anderen Fächern herstellen",
                        "desc": "Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "pq4r",
                        "name": "PQ4R-Methode",
                        "desc": "Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung",
                        "url": "",
                        "category": "elaboration"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 2
            },
            {
                "id": 570,
                "name": "KE 33061 Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft (2SWS)",
                "objective": "Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen",
                "start": "2019-10-08T10:13:15.471Z",
                "end": "2019-12-15T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 7,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "3",
                        "instance_url_id": "68",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33061",
                        "section": "15",
                        "name": "Studienbrief 33061"
                    },
                    {
                        "id": 34,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "13",
                        "instance_url_id": "30",
                        "instance_type": "forum",
                        "instance_title": "1 Einleitung",
                        "section": "15",
                        "name": "1 Einleitung"
                    },
                    {
                        "id": 33,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "14",
                        "instance_url_id": "31",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 1 - Einleitung (S.9)",
                        "section": "15",
                        "name": "Aufgabenblock 1 - Einleitung (S.9)"
                    },
                    {
                        "id": 32,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "15",
                        "instance_url_id": "33",
                        "instance_type": "forum",
                        "instance_title": "2 Mediatisierung",
                        "section": "15",
                        "name": "2 Mediatisierung"
                    },
                    {
                        "id": 31,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "16",
                        "instance_url_id": "34",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 2 - Mediatisierung und Medienbiographie (S.29)",
                        "section": "15",
                        "name": "Aufgabenblock 2 - Mediatisierung und Medienbiographie (S.29)"
                    },
                    {
                        "id": 30,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "17",
                        "instance_url_id": "36",
                        "instance_type": "forum",
                        "instance_title": "3 Tiefgreifende Mediatisierung",
                        "section": "15",
                        "name": "3 Tiefgreifende Mediatisierung"
                    },
                    {
                        "id": 29,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "18",
                        "instance_url_id": "37",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 3 - Tiefgreifende Mediatisierung (S.34)",
                        "section": "15",
                        "name": "Aufgabenblock 3 - Tiefgreifende Mediatisierung (S.34)"
                    },
                    {
                        "id": 28,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "19",
                        "instance_url_id": "39",
                        "instance_type": "forum",
                        "instance_title": "4 Herausforderungen in formalen Bildungskontexten",
                        "section": "15",
                        "name": "4 Herausforderungen in formalen Bildungskontexten"
                    },
                    {
                        "id": 27,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "20",
                        "instance_url_id": "40",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 4 - Medienliteralität und Medienkompetenz (S.48)",
                        "section": "15",
                        "name": "Aufgabenblock 4 - Medienliteralität und Medienkompetenz (S.48)"
                    },
                    {
                        "id": 23,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "24",
                        "instance_url_id": "45",
                        "instance_type": "forum",
                        "instance_title": "5 Herausforderungen in informellen Bildungskontexten",
                        "section": "15",
                        "name": "5 Herausforderungen in informellen Bildungskontexten"
                    },
                    {
                        "id": 26,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "21",
                        "instance_url_id": "41",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 5 - Mediengrundbildung (S.62)",
                        "section": "15",
                        "name": "Aufgabenblock 5 - Mediengrundbildung (S.62)"
                    },
                    {
                        "id": 25,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "22",
                        "instance_url_id": "42",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 6 - Bildung in der digitalen Gesellschaft (S.66)",
                        "section": "15",
                        "name": "Aufgabenblock 6 - Bildung in der digitalen Gesellschaft (S.66)"
                    },
                    {
                        "id": 24,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "23",
                        "instance_url_id": "43",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 7 - Mediatisierungsdiskurs in formalern Bildungskontexten (S.74)",
                        "section": "15",
                        "name": "Aufgabenblock 7 - Mediatisierungsdiskurs in formalern Bildungskontexten (S.74)"
                    },
                    {
                        "id": 22,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "25",
                        "instance_url_id": "46",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 8 - Mediatisierungskollektive und CoPs (S.80)",
                        "section": "15",
                        "name": "Aufgabenblock 8 - Mediatisierungskollektive und CoPs (S.80)"
                    },
                    {
                        "id": 21,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "26",
                        "instance_url_id": "47",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 9 - Medeinrepertoire und Lerndomäne (S.95)",
                        "section": "15",
                        "name": "Aufgabenblock 9 - Medeinrepertoire und Lerndomäne (S.95)"
                    },
                    {
                        "id": 20,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "27",
                        "instance_url_id": "48",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 10 - Bildungsressource in Videoportalen (S.105)",
                        "section": "15",
                        "name": "Aufgabenblock 10 - Bildungsressource in Videoportalen (S.105)"
                    },
                    {
                        "id": 19,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "28",
                        "instance_url_id": "49",
                        "instance_type": "forum",
                        "instance_title": "Aufgabenblock 11 - Trends tiefgreifender Mediatisierung (S.115)",
                        "section": "15",
                        "name": "Aufgabenblock 11 - Trends tiefgreifender Mediatisierung (S.115)"
                    },
                    {
                        "id": 13,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "6",
                        "instance_url_id": "178",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial und Links zum Kurs 33061",
                        "section": "15",
                        "name": "Zusatzmaterial und Links zum Kurs 33061"
                    },
                    {
                        "id": 57,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "4",
                        "instance_url_id": "61",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33061",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33061"
                    },
                    {
                        "id": 56,
                        "course_id": "3",
                        "module_id": "10",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "12",
                        "instance_type": "glossary",
                        "instance_title": "Glossar zum Modul 1D",
                        "section": "12",
                        "name": "Glossar zum Modul 1D"
                    }
                ],
                "strategies": [
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "exzerpte",
                        "name": "Exzerpt",
                        "desc": "Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "transfer",
                        "name": "Neues Wissen auf Bekanntes übertr.",
                        "desc": "Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "examples",
                        "name": "Schemata auf Arbeit/Alltag übertr.",
                        "desc": "Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "critical",
                        "name": "Kritisches Hinterfragen",
                        "desc": "Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "structuring",
                        "name": "Bezug zu anderen Fächern herstellen",
                        "desc": "Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "pq4r",
                        "name": "PQ4R-Methode",
                        "desc": "Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung",
                        "url": "",
                        "category": "elaboration"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 3
            },
            {
                "id": 51,
                "name": "KE 33045 Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft (4SWS)",
                "objective": "Wissen aus der Kurseinheit erarbeiten und Wissen vertiefen",
                "start": "2019-10-08T10:14:17.952Z",
                "end": "2020-02-02T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 6,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "4",
                        "instance_url_id": "70",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33045",
                        "section": "16",
                        "name": "Studienbrief 33045"
                    },
                    {
                        "id": 56,
                        "course_id": "3",
                        "module_id": "10",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "12",
                        "instance_type": "glossary",
                        "instance_title": "Glossar zum Modul 1D",
                        "section": "12",
                        "name": "Glossar zum Modul 1D"
                    },
                    {
                        "id": 18,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "29",
                        "instance_url_id": "52",
                        "instance_type": "forum",
                        "instance_title": "Kurs 33045 Forum 1 - Einleitung",
                        "section": "16",
                        "name": "Kurs 33045 Forum 1 - Einleitung"
                    },
                    {
                        "id": 17,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "30",
                        "instance_url_id": "54",
                        "instance_type": "forum",
                        "instance_title": "Kurs 33045 Forum 2 - Theorien der menschlichen Entwicklung",
                        "section": "16",
                        "name": "Kurs 33045 Forum 2 - Theorien der menschlichen Entwicklung"
                    },
                    {
                        "id": 16,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "31",
                        "instance_url_id": "56",
                        "instance_type": "forum",
                        "instance_title": "Kurs 33045 Forum 3 - Entwicklung und Erziehung",
                        "section": "16",
                        "name": "Kurs 33045 Forum 3 - Entwicklung und Erziehung"
                    },
                    {
                        "id": 15,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "32",
                        "instance_url_id": "58",
                        "instance_type": "forum",
                        "instance_title": "Kurs 33045 Forum 4 - Theorien der Kommunikation",
                        "section": "16",
                        "name": "Kurs 33045 Forum 4 - Theorien der Kommunikation"
                    },
                    {
                        "id": 11,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "7",
                        "instance_url_id": "179",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial zum Kurs 33045",
                        "section": "16",
                        "name": "Zusatzmaterial zum Kurs 33045"
                    },
                    {
                        "id": 59,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "2",
                        "instance_url_id": "59",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33045",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33045"
                    }
                ],
                "strategies": [
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "exzerpte",
                        "name": "Exzerpt",
                        "desc": "Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "transfer",
                        "name": "Neues Wissen auf Bekanntes übertr.",
                        "desc": "Neues Wissen kann durch die Verknüpfung mit dem eigenen Erleben leichter veranschaulicht und gelernt werden.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "examples",
                        "name": "Schemata auf Arbeit/Alltag übertr.",
                        "desc": "Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "critical",
                        "name": "Kritisches Hinterfragen",
                        "desc": "Durch kritisches Hinterfragen kann man seine Aufmerksamkeit beim Lesen steigern.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "structuring",
                        "name": "Bezug zu anderen Fächern herstellen",
                        "desc": "Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.",
                        "url": "",
                        "category": "elaboration"
                    },
                    {
                        "id": "pq4r",
                        "name": "PQ4R-Methode",
                        "desc": "Hinter dem Kürzel verstecken sich sechs Schritte: (1) Preview – Übersicht gewinnen; (2) Questions – Fragen an den Text stellen;  (3) Read – Zweiter Leseschritt - Gründliches Lesen des Textes; (4) Reflect – Gedankliche Auseinandersetzung mit dem Text; (5) Recite – Wiederholen und aus dem Gedächtnis Verfassen; (6) Review – Rückblick und Überprüfung",
                        "url": "",
                        "category": "elaboration"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 1
            },
            {
                "id": 24,
                "name": "Prüfungsvorbereitung",
                "objective": "Prüfungsrelevante Inhalte wiederholen und Aufgaben für die Klausur üben, Aufgaben zur Prüfungssimulation erstellen",
                "start": "2019-10-08T10:23:15.101Z",
                "end": "2020-03-01T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 43,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "3",
                        "instance_url_id": "7",
                        "instance_type": "forum",
                        "instance_title": "Nachrichtenforum",
                        "section": "12",
                        "name": "Nachrichtenforum"
                    },
                    {
                        "id": 42,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "4",
                        "instance_url_id": "10",
                        "instance_type": "forum",
                        "instance_title": "Allgemeine und organisatorische Themen ",
                        "section": "12",
                        "name": "Allgemeine und organisatorische Themen "
                    },
                    {
                        "id": 8,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "2",
                        "instance_url_id": "67",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33060",
                        "section": "14",
                        "name": "Studienbrief 33060"
                    },
                    {
                        "id": 7,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "3",
                        "instance_url_id": "68",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33061",
                        "section": "15",
                        "name": "Studienbrief 33061"
                    },
                    {
                        "id": 6,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "4",
                        "instance_url_id": "70",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33045",
                        "section": "16",
                        "name": "Studienbrief 33045"
                    },
                    {
                        "id": 9,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "1",
                        "instance_url_id": "14",
                        "instance_type": "url",
                        "instance_title": "Anforderungen für Haus- und Abschlussarbeiten",
                        "section": "17",
                        "name": "Anforderungen für Haus- und Abschlussarbeiten"
                    },
                    {
                        "id": 53,
                        "course_id": "3",
                        "module_id": "17",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "3",
                        "instance_url_id": "13",
                        "instance_type": "resource",
                        "instance_title": "Operatoren - Anforderungen in den Aufgabenstellungen",
                        "section": "17",
                        "name": "Operatoren - Anforderungen in den Aufgabenstellungen"
                    },
                    {
                        "id": 56,
                        "course_id": "3",
                        "module_id": "10",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "12",
                        "instance_type": "glossary",
                        "instance_title": "Glossar zum Modul 1D",
                        "section": "12",
                        "name": "Glossar zum Modul 1D"
                    },
                    {
                        "id": 1,
                        "course_id": "3",
                        "module_id": "25",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "2",
                        "instance_url_id": "73",
                        "instance_type": "hvp",
                        "instance_title": "Zeitstrahl 2500 Jahre Bildungsgeschichte. Von der Antike bis zur Gegenwart",
                        "section": "17",
                        "name": "Zeitstrahl 2500 Jahre Bildungsgeschichte. Von der Antike bis zur Gegenwart"
                    },
                    {
                        "id": 58,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "3",
                        "instance_url_id": "60",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33060",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33060"
                    },
                    {
                        "id": 57,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "4",
                        "instance_url_id": "61",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33061",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33061"
                    },
                    {
                        "id": 59,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "2",
                        "instance_url_id": "59",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33045",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33045"
                    },
                    {
                        "id": 10,
                        "course_id": "3",
                        "module_id": "27",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "1",
                        "instance_url_id": "63",
                        "instance_type": "studentquiz",
                        "instance_title": "StudentQuiz zu Modul 1D",
                        "section": "17",
                        "name": "StudentQuiz zu Modul 1D"
                    },
                    {
                        "id": 0,
                        "course_id": "3",
                        "module_id": "6",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "1",
                        "instance_url_id": "64",
                        "instance_type": "data",
                        "instance_title": "Exzerpte zu \"Bildung und Medien\"",
                        "section": "17",
                        "name": "Exzerpte zu \"Bildung und Medien\""
                    }
                ],
                "strategies": [
                    {
                        "id": "exzerpte",
                        "name": "Exzerpt",
                        "desc": "Ein Exzerpt ist mehr als nur eine einfache Zusammenfassung der wichtigsten Inhalte.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "flashcards",
                        "name": "Auswendiglernen mit Lernkarten",
                        "desc": "Mit Lernkarten kann man Dinge systematisch wiederholen bis alles für die Prüfung sitzt. ",
                        "url": "",
                        "category": "repeatition"
                    },
                    {
                        "id": "repeatition",
                        "name": "Repetieren",
                        "desc": "Mit vielen Wiederholungen festigt sich das Wissen. ",
                        "url": "",
                        "category": "repeatition"
                    },
                    {
                        "id": "assoc",
                        "name": "Eselsbrücken",
                        "desc": "Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.",
                        "url": "",
                        "category": "repeatition"
                    },
                    {
                        "id": "loci",
                        "name": "Loci Methode",
                        "desc": "Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.",
                        "url": "",
                        "category": "repeatition"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 2
            },
            {
                "id": 61,
                "name": "Klausur Modul 1D am 02.März .2020, 14-18 Uhr",
                "objective": "Klausur bestehen",
                "start": "2019-10-08T10:24:00.174Z",
                "end": "2020-03-02T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 43,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "3",
                        "instance_url_id": "7",
                        "instance_type": "forum",
                        "instance_title": "Nachrichtenforum",
                        "section": "12",
                        "name": "Nachrichtenforum"
                    },
                    {
                        "id": 42,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "4",
                        "instance_url_id": "10",
                        "instance_type": "forum",
                        "instance_title": "Allgemeine und organisatorische Themen ",
                        "section": "12",
                        "name": "Allgemeine und organisatorische Themen "
                    }
                ],
                "strategies": [
                    {
                        "id": "assoc",
                        "name": "Eselsbrücken",
                        "desc": "Mit einem Reim oder einer Eselsbrücke kann man sich Begriffe oder Reihenfolgen leichter merken.",
                        "url": "",
                        "category": "repeatition"
                    },
                    {
                        "id": "loci",
                        "name": "Loci Methode",
                        "desc": "Bei der Loci Methode verknüpft man Lerninhalte mit Orten oder Gegenständen. Für Abfolgen übt man eine Strecke/einen Spaziergang ein.",
                        "url": "",
                        "category": "repeatition"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 3
            }
        ];
        milestonePresets.biwi.orientation = [
            {
                "id": 315,
                "name": "Willkommen im Modul 1D",
                "objective": "Orientierung im Modul 1D; Seminare erkunden",
                "start": "2019-09-06T22:00:00.000Z",
                "end": "2019-10-05T22:00:00.000Z",
                "status": "missed",
                "progress": 0,
                "resources": [
                    {
                        "id": 40,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "APLE",
                        "instance_id": "3",
                        "instance_url_id": "7",
                        "instance_type": "forum",
                        "instance_title": "Nachrichtenforum",
                        "section": "12",
                        "name": "Nachrichtenforum"
                    },
                    {
                        "id": 39,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "12",
                        "section_name": "APLE",
                        "instance_id": "4",
                        "instance_url_id": "10",
                        "instance_type": "forum",
                        "instance_title": "Allgemeine und organisatorische Themen ",
                        "section": "12",
                        "name": "Allgemeine und organisatorische Themen "
                    },
                    {
                        "id": 52,
                        "course_id": "3",
                        "module_id": "17",
                        "section_id": "12",
                        "section_name": "APLE",
                        "instance_id": "1",
                        "instance_url_id": "8",
                        "instance_type": "resource",
                        "instance_title": "Vorstellung des Moduls 1D",
                        "section": "12",
                        "name": "Vorstellung des Moduls 1D"
                    },
                    {
                        "id": 51,
                        "course_id": "3",
                        "module_id": "17",
                        "section_id": "12",
                        "section_name": "APLE",
                        "instance_id": "2",
                        "instance_url_id": "9",
                        "instance_type": "resource",
                        "instance_title": "Betreuungskonzept",
                        "section": "12",
                        "name": "Betreuungskonzept"
                    },
                    {
                        "id": 5,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "12",
                        "section_name": "APLE",
                        "instance_id": "5",
                        "instance_url_id": "96",
                        "instance_type": "url",
                        "instance_title": "Präsenz und Onlineseminare",
                        "section": "12",
                        "name": "Präsenz und Onlineseminare"
                    }
                ],
                "strategies": [
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 1
            },
            {
                "id": 266,
                "name": "KE 33060 Bildung in der digitalisierten Gesellschaft (2SWS)",
                "objective": "Überblick über die Inhalte der Kurseinheit gewinnen",
                "start": "2019-10-08T07:53:58.223Z",
                "end": "2019-11-10T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 8,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "2",
                        "instance_url_id": "67",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33060",
                        "section": "14",
                        "name": "Studienbrief 33060"
                    },
                    {
                        "id": 36,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "7",
                        "instance_url_id": "20",
                        "instance_type": "forum",
                        "instance_title": "2 Mediatisierung und Digitalisierung",
                        "section": "14",
                        "name": "2 Mediatisierung und Digitalisierung"
                    },
                    {
                        "id": 35,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "9",
                        "instance_url_id": "23",
                        "instance_type": "forum",
                        "instance_title": "3 Bildung im Wandel",
                        "section": "14",
                        "name": "3 Bildung im Wandel"
                    },
                    {
                        "id": 33,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "11",
                        "instance_url_id": "26",
                        "instance_type": "forum",
                        "instance_title": "4 Bildung, digitale Medien und Anwendungsfelder",
                        "section": "14",
                        "name": "4 Bildung, digitale Medien und Anwendungsfelder"
                    },
                    {
                        "id": 1,
                        "course_id": "3",
                        "module_id": "25",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "2",
                        "instance_url_id": "73",
                        "instance_type": "hvp",
                        "instance_title": "Zeitstrahl 2500 Jahre Bildungsgeschichte. Von der Antike bis zur Gegenwart",
                        "section": "17",
                        "name": "Zeitstrahl 2500 Jahre Bildungsgeschichte. Von der Antike bis zur Gegenwart"
                    },
                    {
                        "id": 0,
                        "course_id": "3",
                        "module_id": "25",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "1",
                        "instance_url_id": "72",
                        "instance_type": "hvp",
                        "instance_title": "Platons Höhlengleichnis",
                        "section": "17",
                        "name": "Platons Höhlengleichnis"
                    },
                    {
                        "id": 55,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "3",
                        "instance_url_id": "60",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33060",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33060"
                    },
                    {
                        "id": 12,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "14",
                        "section_name": "Kurs 33060: Bildung in der digitalisierten Gesellschaft",
                        "instance_id": "8",
                        "instance_url_id": "180",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial zum Kurs 33060",
                        "section": "14",
                        "name": "Zusatzmaterial zum Kurs 33060"
                    }
                ],
                "strategies": [
                    {
                        "id": "reading",
                        "name": "Überblick durch Lesen/Querlesen",
                        "desc": "Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "structuring",
                        "name": "Bezug zu anderen Fächern herstellen",
                        "desc": "Bekanntes Wissen und Bezüge zu anderen Kursen erleichtern das Verständnis von Zusammenhängen.",
                        "url": "",
                        "category": "elaboration"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 2
            },
            {
                "id": 749,
                "name": "KE 33061 Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft (2SWS)",
                "objective": "Überblick über die Inhalte der Kurseinheit gewinnen",
                "start": "2019-10-08T08:00:07.946Z",
                "end": "2019-12-15T11:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 7,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "3",
                        "instance_url_id": "68",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33061",
                        "section": "15",
                        "name": "Studienbrief 33061"
                    },
                    {
                        "id": 53,
                        "course_id": "3",
                        "module_id": "10",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "12",
                        "instance_type": "glossary",
                        "instance_title": "Glossar zum Modul 1D",
                        "section": "12",
                        "name": "Glossar zum Modul 1D"
                    },
                    {
                        "id": 31,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "13",
                        "instance_url_id": "30",
                        "instance_type": "forum",
                        "instance_title": "1 Einleitung",
                        "section": "15",
                        "name": "1 Einleitung"
                    },
                    {
                        "id": 29,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "15",
                        "instance_url_id": "33",
                        "instance_type": "forum",
                        "instance_title": "2 Mediatisierung",
                        "section": "15",
                        "name": "2 Mediatisierung"
                    },
                    {
                        "id": 27,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "17",
                        "instance_url_id": "36",
                        "instance_type": "forum",
                        "instance_title": "3 Tiefgreifende Mediatisierung",
                        "section": "15",
                        "name": "3 Tiefgreifende Mediatisierung"
                    },
                    {
                        "id": 25,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "19",
                        "instance_url_id": "39",
                        "instance_type": "forum",
                        "instance_title": "4 Herausforderungen in formalen Bildungskontexten",
                        "section": "15",
                        "name": "4 Herausforderungen in formalen Bildungskontexten"
                    },
                    {
                        "id": 20,
                        "course_id": "3",
                        "module_id": "9",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "24",
                        "instance_url_id": "45",
                        "instance_type": "forum",
                        "instance_title": "5 Herausforderungen in informellen Bildungskontexten",
                        "section": "15",
                        "name": "5 Herausforderungen in informellen Bildungskontexten"
                    },
                    {
                        "id": 54,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "4",
                        "instance_url_id": "61",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33061",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33061"
                    },
                    {
                        "id": 13,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "15",
                        "section_name": "Kurs 33061: Der Wandel von Kommunikations- und Medienkulturen durch digitale Medien und die Herausforderung für die Bildungswissenschaft",
                        "instance_id": "6",
                        "instance_url_id": "178",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial und Links zum Kurs 33061",
                        "section": "15",
                        "name": "Zusatzmaterial und Links zum Kurs 33061"
                    }
                ],
                "strategies": [
                    {
                        "id": "reading",
                        "name": "Überblick durch Lesen/Querlesen",
                        "desc": "Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "gliederung",
                        "name": "Gliederung",
                        "desc": "Themenfelder lassen sich mit einer Gliederung übersichtlich strukturieren.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "examples",
                        "name": "Schemata auf Arbeit/Alltag übertr.",
                        "desc": "Ein Beispiel aus dem eigenen Umfeld hilft dabei, neue Wissensschemata schneller zu lernen.",
                        "url": "",
                        "category": "elaboration"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 3
            },
            {
                "id": 941,
                "name": "KE 33045 Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft (4SWS)",
                "objective": "Überblick über die Inhalte der Kurseinheit gewinnen",
                "start": "2019-10-08T08:31:56.147Z",
                "end": "2020-02-01T23:00:00.000Z",
                "status": "urgent",
                "progress": 0,
                "resources": [
                    {
                        "id": 32,
                        "course_id": "3",
                        "module_id": "20",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "4",
                        "instance_url_id": "70",
                        "instance_type": "url",
                        "instance_title": "Studienbrief 33045",
                        "section": "16",
                        "name": "Studienbrief 33045"
                    },
                    {
                        "id": 79,
                        "course_id": "3",
                        "module_id": "10",
                        "section_id": "12",
                        "section_name": "Home",
                        "instance_id": "1",
                        "instance_url_id": "12",
                        "instance_type": "glossary",
                        "instance_title": "Glossar zum Modul 1D",
                        "section": "12",
                        "name": "Glossar zum Modul 1D"
                    },
                    {
                        "id": 82,
                        "course_id": "3",
                        "module_id": "16",
                        "section_id": "17",
                        "section_name": "Prüfungsvorbereitung",
                        "instance_id": "2",
                        "instance_url_id": "59",
                        "instance_type": "quiz",
                        "instance_title": "Lernquiz - Kurs 33045",
                        "section": "17",
                        "name": "Lernquiz - Kurs 33045"
                    },
                    {
                        "id": 11,
                        "course_id": "3",
                        "module_id": "15",
                        "section_id": "16",
                        "section_name": "Kurs 33045- Entwicklung und Kommunikation als Grundbegriffe der Bildungswissenschaft",
                        "instance_id": "7",
                        "instance_url_id": "179",
                        "instance_type": "page",
                        "instance_title": "Zusatzmaterial zum Kurs 33045",
                        "section": "16",
                        "name": "Zusatzmaterial zum Kurs 33045"
                    }
                ],
                "strategies": [
                    {
                        "id": "reading",
                        "name": "Überblick durch Lesen/Querlesen",
                        "desc": "Durch schnelles Querlesen verschaffen Sie sich einen Überblick über das Themengebiet. Schauen Sie sich doch auch einmal die PQ4R-Methode an.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "mindmap",
                        "name": "Mindmap",
                        "desc": "Eine Mindmap hilft dabei, Zusammenhänge darzustellen.",
                        "url": "",
                        "category": "organization"
                    },
                    {
                        "id": "strukturierung",
                        "name": "Strukturierung von Wissen",
                        "desc": "Fachausdrücke oder Definitionen lassen sich gut in Listen oder Tabellen sammeln.",
                        "url": "",
                        "category": "organization"
                    }
                ],
                "reflections": [],
                "g": 1,
                "y": 1
            }
        ];
        milestonePresets.cs = {};
        milestonePresets.cs.exame = [];
        milestonePresets.cs.orientation = [];


        new Vue({
            el: '#planningsurvey',
            data: function () {
                return {
                    modalSurveyVisible: false,
                    surveyComplete: false,
                    objectives: '',
                    availableTime: 0,
                    planingStyle: '',
                    selectedMonth: 0,
                    selectedYear: 0,
                    resources: [],
                    availableResources: [],
                    invalidAvailableTime: false,
                    invalidAvailableTimeNotEnough: false,
                    invalidObjective: false,
                    invalidResources: false,
                    invalidPlaningStyle: false
                };
            },
            mounted: function () {
                // Obtain course structure form DB
                var _this = this;
                utils.get_ws('coursestructure', {
                    courseid: parseInt(course.id, 10)
                    // eslint-disable-next-line space-before-function-paren
                }, function (e) {
                    try {
                        _this.availableResources = JSON.parse(e.data);
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                    }
                });
                // load status
                utils.get_ws('userpreferences', {
                    data: {
                        'setget': 'get',
                        'fieldname': 'ladtopics_survey_done'
                    }
                }, function (e) {
                    try {
                        e = JSON.parse(e.response);
                        console.log('got data from user pref ', e);
                        if (e[0]) {
                            if (parseInt(e[0].value, 10)) {
                                _this.surveyComplete = parseInt(e[0].value, 10) > 0 ? true : false;
                                milestoneApp.surveyDone = parseInt(e[0].value, 10);
                            }
                        }
                        
                        if (milestoneApp.surveyDone > 0) {
                            $('#planing-component').show();
                        } else{
                            $('#planningsurvey').show();
                        }
                        /* 
                        if (localStorage.surveyDone) {
                            this.surveyDone = localStorage.surveyDone;
                            if (this.surveyDone) {
                                $('#planing-component').show();
                            } 
                        }
                        */
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Could not fetch user_preferences: ', e);
                    }

                });
                //if (localStorage.surveyComplete) {
                //localStorage.surveyComplete;
                //console.log('local ',localStorage.surveyComplete)
                //}
            },
            /*watchwatch: {
                surveyComplete: function (newStatus) {
                    //localStorage.surveyComplete = newStatus;
                }
            },*/
            created: function () {
                //$('#planningsurvey').show();
            },
            methods: {
                showModal: function (e) {
                    this.modalSurveyVisible = true;
                },
                closeModal: function (e) {
                    this.modalSurveyVisible = false;
                },
                monthRange: function () {
                    return utils.monthRange;
                },
                yearRange: function () {
                    return [2019, 2020, 2021, 2022]; // xxx should become a plugin setting
                },
                monthSelected: function (event) {
                    this.selectedMonth = event.target.value;
                },
                yearSelected: function (event) {
                    this.selectedYear = event.target.value;
                },
                resourcesBySection: function (id) {
                    return this.availableResources.filter(function (s) {
                        return parseInt(s.section_id, 10) === parseInt(id, 10) ? true : false;
                    });
                },
                resourceSections: function () {
                    var sections = {};
                    for (var i = 0; i < this.availableResources.length; i++) {
                        sections[this.availableResources[i].section_id] = {
                            name: this.availableResources[i].section_name === ' ' ?
                                '(Einführung)' :
                                this.availableResources[i].section_name,
                            id: this.availableResources[i].section_id
                        };
                    }
                    return sections;
                },
                resourceById: function (id) {
                    return this.availableResources.filter(function (s) {
                        return parseInt(s.id, 10) === parseInt(id, 10) ? true : false;
                    })[0];
                },
                resourceSelected: function (event) {
                    this.resources.push(this.resourceById(event.target.value));
                    var el = document.getElementById('selected_resources');
                    var sor = Sortable.create(el, {});
                    this.invalidResources = this.resources.length > 0 ? false : true;
                },
                resourceRemove: function (id) {
                    for (var s = 0; s < this.resources.length; s++) {
                        if (this.resources[s].id === id) {
                            this.resources.splice(s, 1);
                        }
                    }
                    this.invalidResources = this.resources.length > 0 ? false : true;
                },
                updateObjective: function (e) {
                    this.invalidObjective = this.objectives === '' ? true : false;
                },
                updateAvailableTime: function () {
                    this.invalidAvailableTime = this.availableTime <= 0 ? true : false;
                    this.invalidAvailableTimeNotEnough = this.availableTime <= 10 ? true : false;
                },
                updatePlaningStyle: function (e) {
                    this.invalidPlaningStyle = this.planingStyle === '' ? true : false;
                },
                validateSurveyForm: function () {
                    var isValid = true;
                    if (this.objectives === '') {
                        this.invalidObjective = true;
                        isValid = false;
                    }
                    if (this.availableTime <= 0) {
                        this.invalidAvailableTime = true;
                        isValid = false;
                    }
                    /*if (this.availableTime <= 0) {
                        this.invalidAvailableTime = true;
                        isValid = false;
                    }*/
                    if (this.planingStyle === '') {
                        this.invalidPlaningStyle = true;
                        isValid = false;
                    }
                    if (this.objectives === 'f1c' && this.resources.length === 0 &&
                        this.availableResources.length > 0
                    ) {
                        this.invalidResources = true;
                        isValid = false;
                    }
                    if (isValid) {
                        this.saveSurvey();
                    }
                    //return ! isValid;
                },
                saveSurvey: function () {
                    // generate milestones automatically
                    switch (this.objectives) {
                        case 'f1a': // wants examination
                            if (courseid === biwiCourse) {
                                milestoneApp.addMilestones(milestonePresets.biwi.exame);
                            } else if (courseid === csCourse) {
                                milestoneApp.addMilestones(milestonePresets.cs.exame);
                            }
                            break;
                        case 'f1b': // wants orientation
                            if (courseid === biwiCourse) {
                                milestoneApp.addMilestones(milestonePresets.biwi.orientation);
                            } else if (courseid === csCourse) {
                                milestoneApp.addMilestones(milestonePresets.cs.orientation);
                            }
                            break;
                        case 'f1c': // wants certain topics
                            break;
                        case 'f1d': // doesn't want anything
                            break;
                    }
                    var _this = this;
                    // set survey as done
                    utils.get_ws('userpreferences', {
                        data: {
                            'setget': 'set',
                            'fieldname': 'ladtopics_survey_done',
                            'value': 1
                        }
                    }, function (e) {
                        try {
                            e = JSON.parse(e.response);
                            // console.log('got data from user pref ', e);
                            milestoneApp.surveyDone = 1;
                            this.surveyComplete = true;
                            $('#theSurveyModal').modal('hide');
                            $('#planing-component').show();
                            $('.survey-btn').hide();
                            utils.get_ws('userpreferences', {
                                data: {
                                    'setget': 'set',
                                    'fieldname': 'ladtopics_survey_results',
                                    'value': JSON.stringify({
                                        objectives: _this.objectives,
                                        availableTime: _this.availableTime,
                                        planingStyle: _this.planingStyle,
                                        selectedMonth: _this.selectedMonth,
                                        selectedYear: _this.selectedYear,
                                        resources: _this.resources//,
                                        //availableResources: _this.availableResources
                                    })
                                }
                            }, function (e) {
                                // console.log('saved survey ', e);
                            });

                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('Could not fetch user_preferences: ', e);
                        }

                    });

                }
            }
        });
    };
    return survey;
});
