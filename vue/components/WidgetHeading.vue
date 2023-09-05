<template>
    <div class="heading__underline d-flex justify-content-between pb-1 mb-2">
        <div class="d-flex align-items-center">
            <i v-if="icon" :class="icon" aria-hidden="true" class="heading__icon fa mr-3"></i>
            <h3 class="mb-1">{{ title }}</h3>
        </div>
        <button v-if="infoContent" :data-content="infoContent" class="heading__popover" data-container="body" data-placement="top"
                data-toggle="popover" data-trigger="click focus" title="Informationen" type="button">
            <i aria-hidden="true" class="heading__info fa fa-info mb-1"></i>
        </button>
    </div>
</template>

<script>
export default {
    name: "WidgetHeading",

    props: {
        title: { type: String, required: true },
        icon: { type: String, default: '' },
        infoContent: { type: String, default: '' },
    }
}
</script>

<style lang="scss" scoped>
@import "../scss/variables.scss";

.heading {
    &__underline {
        border-bottom: 1px solid $light-grey;
    }

    &__icon {
        font-size: 1.6rem;
    }

    &__popover {
        border: none;
        background: none;
    }

    &__info {
        color: rgba(0, 0, 0, 0.6);
        width: 25px;
        height: 25px;
        font-size: 16px;
        border: 2px solid rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: rgba(0, 0, 0, 0.9);
            border-color: rgba(0, 0, 0, 0.9);
        }
    }
}
</style>