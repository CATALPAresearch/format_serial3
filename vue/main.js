import Vue from "vue";
import {store} from "./store/store";
import App from "./App.vue";
import Communication from "./scripts/communication";

function init(courseid, fullPluginName, userid, isModerator, policyAccepted) {
	// We need to overwrite the variable for lazy loading.
	__webpack_public_path__ =
		M.cfg.wwwroot + "/course/format/serial3/amd/build/";

	Communication.setPluginName(fullPluginName);

	store.commit("setCourseid", courseid);
	store.commit("setisModerator", isModerator);
	store.commit("setPluginName", fullPluginName);
	store.commit("setUserid", userid);
	store.commit("setPolicyAccepted", policyAccepted);
	store.dispatch("loadComponentStrings");
	store.dispatch("fetchLearnerGoal");
	store.dispatch('learnermodel/loadUserUnderstanding');
	store.dispatch('learnermodel/calculateLearnerModel');
	store.dispatch("setupLogger");

	const currenturl = window.location.pathname;
	const base =
		currenturl.substring(0, currenturl.indexOf(".php")) +
		".php/?id=" +
		courseid +
		"/";

	console.log('-- policy accepted? '+policyAccepted)
	if (policyAccepted == false && courseid == 42) {
		$('.activity.quiz.modtype_quiz').hide();
		$('.activity.modtype_longpage').hide();
		$('.activity.modtype_usenet').hide();
		$('.activity.modtype_safran').hide();
	} else {
		new Vue({
			el: "#app",
			store,
			render: (h) => h(App),
		});
	}

	
}

export {init};