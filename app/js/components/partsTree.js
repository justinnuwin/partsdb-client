var partsTreeComponent = {
    props: ['table', 'data'],
    methods: {
        loadParts: function (tableName) {
            for (_tableName in partsTree.tables) {
                if (_tableName != tableName)
                    partsTree.tables[_tableName].selected = false;
                else
                    partsTree.tables[_tableName].selected = true;
            }

            if (partsTree.tables[tableName].parts.length === 0) {
                jQuery.getJSON(`${window.location.origin}/tables?name=${tableName}`, data => {
                    partsTree.tables[tableName].parts = data.parts;
                    partsTree.tables[tableName].schema = parseTableSchema(data.schema);
                    partsTree.tables[tableName].parts.unshift(buildEmptyPart(partsTree.tables[tableName].schema));
                });
            }
        },
        setFormPart: function (partObj, tableName) {
            if (partForm.isFormChanged()) {
                if (confirm("Changes have been made. Reset changes?"))
                    partForm.resetChanges();
                else
                    return;
            }
            partForm.tableName = tableName;
            partForm.part = partObj;
            partForm.serverStatePart = jQuery.extend(true, { }, partObj);     // Deep Clone
            partForm.schema = partsTree.tables[tableName].schema;
        }
    },
    template: `
        <li v-bind:id="table" v-on:click="loadParts(table)">
            <a>{{ table }}</a>
            <ul v-show="data.selected">
                <li v-for="part in data.parts">
                    <a v-on:click="setFormPart(part, table)">
                        {{ part['Part Number'] }}
                    </a>
                </li>
            </ul>
        </li>`
};

var partsTree;

$.getJSON(window.location.origin + "/tables", data => {
    let dbTables = {};
    for (name of data) {
        dbTables[name] = {
            "name": name,
            "parts": [],
            "schema": [],
            "selected": false
        };
    }
    if (!$.isEmptyObject(dbTables)) {
        partsTree = new Vue({   // Must create partsTree after dbTables is completed since Vue does not support reactivity using v-for on objects
            el: '#partsTree',
            components: {
                'table-name': partsTreeComponent
            },
            data: {
              tables: dbTables
            }
        });  
    } else {
        location.reload();  // TODO: Possible refresh loop
    }
});
