<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import HelloWorld from '@/components/HelloWorld.vue';
    import Request from '@/service';

    @Component({
        components: {
            HelloWorld
        },
        directives: {
            // focus: {
            //     // 指令的定义
            //     inserted: function (el) {
            //         el.focus()
            //     }
            // }
        }
    })
    export default class Home extends Vue {
        // hello = 'world';
        //
        // get world() {
        //     return this.hello + 'world';
        // }

        mounted() {
            this.sayHello();
        }

        sayHello() {
            console.log("调用了",Request);
            //Request.service.get({name:"傅光曦"});
        }
    }
</script>
