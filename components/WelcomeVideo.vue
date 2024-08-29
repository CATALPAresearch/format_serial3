<template>
    <div>
        <div v-if="is1801Course()" class="mb-3 mt-3" style="width:100%;height:auto;">
            <video controls='true' style='width:100%;max-height:400px;'>
                <source 
                    v-if="research_condition == 'treatment_group'" 
                    src="https://nise81.com/1801-Intro-WS2023_Versuchsgruppe.mp4" type="video/mp4"></source>
                
                <source 
                    v-if="research_condition == 'control_group'"
                    src="https://nise81.com/1801-Intro-WS2023_Kontrollgruppe.mp4" type="video/mp4"></source>
                
                Leider können wir Ihnen das Begrüßungsvideo nicht zeigen, da Ihr Browser keine Videos unterstützt.
            </video>
        </div>
        <div v-else></div>
    </div>
</template>
<script>
import {mapState, mapGetters} from 'vuex';


export default {
    name: "WelcomeVideo",

    computed: {
        ...mapState(['courseid', 'userid', 'research_condition']),
    },

    methods: {
        ...mapGetters(['is1801Course']),
    }
}
</script>