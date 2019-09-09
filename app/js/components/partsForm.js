var partFormComponent = {
    props: ['data'],
    template: `
        <form>
            <div v-for="(propValue, propKey) in data" v-bind:key="propKey">
                <p>{{ propKey }}</p>
                <input v-model="data[propKey]">
            </div>
        </form>`
};

var partForm = new Vue({
    el: '#partForm',
    components: {
        'part-form': partFormComponent
    },
    data: {
        part: {}
    }
});



