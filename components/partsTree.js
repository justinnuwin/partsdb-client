var partsTreeComponent = {
    props: ['table', 'data'],
    methods: {
        loadParts: function (tableName) {
            for (_tableName in partsTree.tables) {
                if (_tableName != tableName) {
                    partsTree.tables[_tableName].selected = false;
                } else {
                    partsTree.tables[_tableName].selected = true;
                }
            }

            if (partsTree.tables[tableName].parts.length == 0) {
                jQuery.getJSON(`${window.location.origin}/tables?name=${tableName}`, data => {
                    partsTree.tables[tableName].parts = data;
                });
            }
        }
    },
    template: `
        <li v-bind:id="table" v-on:click="loadParts(table)">
            <a v-bind:href="'#' + table">{{ table }}</a>
            <ul v-show="data.selected">
                <li v-for="part in data.parts">
                    <a v-bind:href="'#' + table + '/' + part['Part Number']">{{ part['Part Number'] }}</a>
                </li>
            </ul>
        </li>`
};

var partsTree;
jQuery.getJSON(window.location.origin + "/tables", data => {
    let dbTables = {};
    for (name of data) {
        dbTables[name] = {
            "name": name,
            "parts": [],
            "selected": false
        };
    }
    partsTree = new Vue({   // Must create partsTree after dbTables is completed since Vue does not support reactivity using v-for on objects
        el: '#partsTree',
        components: {
            'table-name': partsTreeComponent
        },
        data: {
          tables: dbTables
        }
    })  
});
