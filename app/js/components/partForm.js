var partFormComponent = {
    props: ['data', 'schema'],
    methods: {
        resetChanges: function () {
            for (property in partForm.part) {
                partForm.part[property] = partForm.serverStatePart[property];
            }
        }
    },
    // TODO: Get submit working
    template: `
        <form action="/parts" method="post">
            <div v-for="(propValue, propKey) in data" v-bind:key="propKey">
                <label v-bind:for="propKey">{{ propKey }}</label>
                <input v-bind:id="propKey"
                       v-if="schema[propKey].parsedType == 'string'"
                       v-model.trim="data[propKey]"
                       v-bind:required="!schema.nullAllowed">
                <input v-bind:id="propKey"
                       v-else-if="schema[propKey].parsedType == 'number'"
                       v-model.number="data[propKey]"
                       v-bind:required="!schema.nullAllowed"
                       type="number" step="0.01">
                <select v-bind:id="propKey"
                        v-else-if="schema[propKey].parsedType == 'enum'"
                        v-model="data[propKey]"
                        v-bind:required="!schema.nullAllowed">
                    <option disabled value="">Please select one</option>
                    <option v-for="value in schema[propKey].enums">{{ value }}</option>
                </select>
            </div>
            <button v-on:click="resetChanges()" type="button">Reset Changes</button>
            <button type="submit">Submit</button>
        </form>`
};

var partForm = new Vue({
    el: '#partForm',
    components: {
        'part-form': partFormComponent
    },
    data: {
        part: {},
        serverStatePart: {},
        schema: []
    }
});



