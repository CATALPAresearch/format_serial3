<template>
    <div class="d-flex">
        <i class="fa fa-gear icon" aria-hidden="true"></i>
        <i class="fa fa-info icon" aria-hidden="true"></i>
        <i class="fa fa-question icon" aria-hidden="true"></i>
        <i class="fa fa-comment icon" aria-hidden="true"></i>
        <i class="fa fa-thumbs-up icon" aria-hidden="true"></i>
    </div>
</template>

<script>
export default {
  name: "MenuBar"
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
    margin: 0 1px 0.5rem 0.5rem;

    &:hover {
        color: rgba(0, 0, 0, 0.9);
    }
}
</style>