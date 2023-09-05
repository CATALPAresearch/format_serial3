<template>
    <div class="d-flex align-items-center">
        <button class="button" title="Dashboard bearbeiten" @click="$emit('editmode')">
            <i aria-hidden="true" class="fa fa-gear icon m-0"></i>
        </button>
        <button class="button" data-target="#informationModal" data-toggle="modal" title="Informationen über das Dashboard"
                type="button">
            <i aria-hidden="true" class="fa fa-info icon m-0"></i>
        </button>
        <button hidden class="button" data-target="#linkModal" data-toggle="modal" title="Hilfreiche Links" type="button">
            <i aria-hidden="true" class="fa fa-chain icon m-0"></i>
        </button>
        
        <a href="xxx">
            <button class="button" title="Newsgroup Beiträge ansehen">
                <i aria-hidden="true" class="fa fa-comments-o icon m-0"></i>
            </button>
        </a>
        <button hidden class="button pr-0" title="Kursbetreuer kontaktieren">
            <i aria-hidden="true" class="fa fa-send-o icon m-0"></i>
        </button>

        <div id="informationModal" aria-hidden="true" aria-labelledby="informationModalLabel" class="modal fade"
             role="dialog" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="informationModalLabel" class="modal-title">{{ strings.informationTitle }}</h5>
                        <button aria-label="Close" class="close" data-dismiss="modal" type="button">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        {{ strings.informationContent }}
                    </div>
                </div>
            </div>
        </div>

        <div id="linkModal" aria-hidden="true" aria-labelledby="linkModalLabel" class="modal fade"
             role="dialog" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="informationModalLabel" class="modal-title">{{ strings.linkTitle }}</h5>
                        <button aria-label="Close" class="close" data-dismiss="modal" type="button">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        {{ strings.linkContent }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';


export default {
    name: "MenuBar",

    computed: {
        ...mapState(['strings']),
    },
}
</script>

<style lang="scss" scoped>
@import "../scss/variables.scss";

.icon {
    color: rgba(0, 0, 0, 0.6);
    width: 35px;
    height: 35px;
    font-size: 22px;
    border: 1px solid $light-grey;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: rgba(0, 0, 0, 0.9);
    }
}

.button {
    border: none;
    background: none;
}
</style>