import Vue from "vue";
import {store} from "./store/store";
import App from "./App.vue";
import Communication from "./scripts/communication";

function init(courseid, fullPluginName, userid, isModerator, policyAccepted, sectionCollapsEnabled=false, sectionInitiallyCollapsed=false) {
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

	//console.log('-- policy accepted? '+policyAccepted)
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

	// Setting: Collapsable Sections
	// TODO: store and load opened and closed sections using the local storage
	if(sectionCollapsEnabled){
		$('.course-content .topics li.section div.content h3').attr('style', 'cursor: pointer;')

		if(sectionInitiallyCollapsed){
			$('.course-content .topics li.section div.content ul.section')
				.slideToggle('fast');
			$('.course-content .topics #section-0 div.summary')
				.slideToggle('fast');
			$('.course-content .topics li.section div.content h3')
				.prepend('<i style="display:inline-block; font-size:1.2em; padding: 0 4px 0 0px; width: 18px;" class="section-toggle-icon fa fa-caret-right">')
		} else {
			$('.course-content .topics li.section div.content h3')
				.prepend('<i style="display:inline-block; font-size:1.2em; padding: 0 4px 0 0px; width: 18px;" class="section-toggle-icon fa fa-caret-down">')
		}
		
		$('.course-content .topics li.section div.content').each(function(){
			$(this).find('h3').click(function(){
				$(this).parent().parent().find('ul.section').slideToggle('fast');
				$(this).parent().parent().find('div.summary').slideToggle('fast');
				if($(this).find('i').hasClass('fa-caret-right')){
					$(this).find('i').removeClass('fa-caret-right').addClass('fa-caret-down');
				}else{
					$(this).find('i').removeClass('fa-caret-down').addClass('fa-caret-right');
				}
			});
		});
	}  
	

	
}

export {init};