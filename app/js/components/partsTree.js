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
                partsTree.reloadTable(tableName);
            }
        },
        setFormPart: function (partObj, tableName) {
            $('.partName a').css('color', '');
            $(`[id='${partObj['Part Number']}'] a`).css('color', 'magenta');
            if (partForm.isFormChanged()) {
                if (confirm("Changes have been made. Reset changes?"))
                    partForm.resetChanges();
                else
                    return;
            }
            partForm.tableName = tableName;
            partForm.serverStatePart = partObj;
            partForm.part = jQuery.extend(true, { }, partObj);     // Deep Clone
            partForm.schema = partsTree.tables[tableName].schema;
            if (partObj['Part Number'] == "Add new part..")
                partForm.newPart = true;
            else
                partForm.newPart = false;
        }
    },
    template: `
        <li v-bind:id="table" v-on:click="loadParts(table)" class="treeName">
            <a>{{ table }}</a>
            <ul v-show="data.selected" class="treeParent">
                <li v-for="part in data.parts" v-bind:id="part['Part Number']" class="partName">
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
            },
            methods: {
                reloadTable: function (tableName) {
                    $.getJSON(`${window.location.origin}/tables?name=${tableName}`, data => {
                        this.tables[tableName].parts = data.parts;
                        this.tables[tableName].schema = parseTableSchema(data.schema);
                        this.tables[tableName].parts.unshift(buildEmptyPart(partsTree.tables[tableName].schema));
                        $('.partName a').css('color', '');
                        $(`[id='${partForm.part['Part Number']}'] a`).css('color', 'magenta');
                        setTimeout(function() {     // Try setting css again since it may take time for Vue.js to react to maodel change
                            $(`[id='${partForm.part['Part Number']}'] a`).css('color', 'magenta')
                        }, 1000);

                    });
                }
            }
        });  
    } else {
        location.reload();  // TODO: Possible refresh loop
    }
});
