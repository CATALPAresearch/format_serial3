import Vue from 'vue';
import Vuex from 'vuex';
import moodleAjax from 'core/ajax';
import moodleStorage from 'core/localstorage';
import Notification from 'core/notification';
import $ from 'jquery';

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        pluginName: '',
        courseModuleID: 0,
        contextID: 0,
        courseid: 0,
        userid: -1,
        isModerator: false,
        policyAccepted: false,
        url: '',
        title: '',
        strings: {},
        alert: {
            show: false,
            type: 'primary',
            message: 'unknown'
        },
        confValue: '',
        dashboardSettings: [],
        currentSection: -1,
        sectionNames: [],
        allSections: [],
    },

    //strict: process.env.NODE_ENV !== 'production',
    mutations: {
        setCourseid(state, val){
            state.courseid = val;
        },
        setisModerator(state, val){
            state.isModerator = val;
        },
        setUserid(state, val){
            state.userid = val;
        },
        setPolicyAccepted(state, val){
            state.policyAccepted = val;
        },
        setConfigValue(state, value){
            state.confValue = value;
        },
        setPluginName(state, name){
            state.pluginName = name;
        },
        setModerator(state, isModerator){
            state.isModerator = isModerator;
        },
        setCourseModuleID(state, id) {
            state.courseModuleID = id;
        },
        setContextID(state, id) {
            state.contextID = id;
        },
        setStrings(state, strings) {
            state.strings = strings;
        },
        showAlert(state, [type, message]){
            const timeout = 3000;
            state.alert.type = type;
            state.alert.message = message;
            state.alert.show = true;
            new Promise(
                resolve => setTimeout(resolve, timeout)
            ).then(
                (resolve) => {
                    state.alert.show = false;
                    state.alert.type = "primary";
                    state.message = "unknown";
                }
            );
        },
        setDashboardSettings(state, ajaxdata) {
            state.dashboardSettings = ajaxdata;
        },
        setCurrentSection(state, section) {
            state.currentSection = section;
        },
        setAllSections(state, sections) {
            state.allSections = sections;
        },
        setSectionNames(state, names) {
            state.sectionNames = names;
        }
    },

    getters: {
        getCourseid: function(state){
            return state.courseid;
        },
        getisModerator: function(state){
            return state.isModerator;
        },
        getUserid: function(state){
            return state.userid;
        },
        getPolicyAccepted: function(state){
            return state.policyAccepted;
        },
        getConfigValue: function(state){
            return state.confValue;
        },
        getModeratorStatus: function(state){
            return state.isModerator;
        },
        getAlertType: function(state){
            return `alert-${state.alert.type}`;
        },
        getAlertState: function(state){
            return state.alert.show;
        },
        getAlertMessage: function(state){
            return state.alert.message;
        },
        getContextID: function(state){
            return state.contextID;
        },
        getCourseModuleID: function(state){
            return state.courseModuleID;
        },
        getPluginName: function(state){
            return state.pluginName;
        },
        getCMID: function(state){
            return state.courseModuleID;
        },
        getDashboardSettings: function(state){
            return state.dashboardSettings;
        },
        getCurrentSection: function(state){
            return state.currentSection;
        },
        getAllSections: function(state){
            return state.allSections;
        },
        getSectionNames: function(state){
            return state.sectionNames;
        },
    },
    actions: {
        /**
         * Fetches the i18n data for the current language.
         *
         * @param context
         * @returns {Promise<void>}
         */
        async loadComponentStrings(context) {
            const lang = $('html').attr('lang').replace(/-/g, '_');
            const cacheKey = 'format_ladtopics/strings/' + lang;
            const cachedStrings = moodleStorage.get(cacheKey);
            if (cachedStrings) {
                context.commit('setStrings', JSON.parse(cachedStrings));
            } else {
                const request = {
                    methodname: 'core_get_component_strings',
                    args: {
                        'component': 'format_ladtopics',
                        lang,
                    },
                };
                const loadedStrings = await moodleAjax.call([request])[0];
                let strings = {};
                loadedStrings.forEach((s) => {
                    strings[s.stringid] = s.string;
                });
                context.commit('setStrings', strings);
                moodleStorage.set(cacheKey, JSON.stringify(strings));
            }
        },

        /**
         * Saves a learning goal.
         *
         * @param context
         * @param settings
         *
         * @returns {Promise<void>}
         */
        async saveDashboardSettings(context, settings) {
            const payload = {
                userid: Number(context.state.userid),
                course: Number(context.state.courseid),
                settings: settings
            };
            console.log(settings);
            console.log("Payload: ", payload);
            try {
                const response =  await ajax('format_ladtopics_saveDashboardSettings', payload);
                console.log("response: ", response);
                // commit('setDashboardSettings', response.data);
            } catch (error) {
                console.error(error);
            }
        },

        /**
         * Fetch dashbaord settings.
         *
         * @param context
         * @param payload
         *
         * @returns {Promise<void>}
         */
        async fetchDashboardSettings(context) {
            const payload = {
                userid: Number(context.state.userid),
                course: Number(context.state.courseid),
            };
            const response =  await ajax('format_ladtopics_fetchDashboardSettings', payload);

            if (response.success) {
                response.data = JSON.parse(response.data);
                console.log('input settings::', JSON.parse(response.data.settings));
                context.commit('setDashboardSettings',  JSON.parse(response.data.settings));
            } else {
                if (response.data) {
                    console.log('No dashboard settings stored');
                } else {
                    console.log('No connection to webservice /overview/');
                }
            }
        },
    }
});

/**
 * Single ajax call to Moodle.
 */
export async function ajax(method, args) {
    const request = {
        methodname: method,
        args: args,
    };

    try {
        return await moodleAjax.call([request])[0];
    } catch (e) {
        Notification.exception(e);
        throw e;
    }
}
