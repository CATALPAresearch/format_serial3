<template>
    <div class="d-flex align-items-center">
        <button class="button" @click="$emit('editmode')">
            <i class="fa fa-gear icon m-0" aria-hidden="true"></i>
        </button>
        <button class="button">
            <i class="fa fa-info icon m-0" aria-hidden="true"></i>
        </button>
        <button type="button" class="button" data-toggle="modal" data-target="#informationModal">
            <i class="fa fa-question icon m-0" aria-hidden="true"></i>
        </button>
        <button class="button">
            <i class="fa fa-comment icon m-0" aria-hidden="true"></i>
        </button>
        <button class="button pr-0">
            <i class="fa fa-thumbs-up icon m-0" aria-hidden="true"></i>
        </button>

        <div class="modal fade" id="informationModal" tabindex="-1" role="dialog" aria-labelledby="informationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="informationModalLabel">{{ strings.informationTitle }}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        {{ strings.informationContent }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';


export default {
    name: "MenuBar",

    computed: {
        ...mapState(['strings']),
    },
}
</script>

<style lang="scss" scoped>
.icon {
    color: rgba(0, 0, 0, 0.6);
    width: 35px;
    height: 35px;
    font-size: 25px;
    border: 1px solid #dee2e6;
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