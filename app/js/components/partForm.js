
var partFormComponent = {
    props: ['data', 'schema', 'errors'],
    methods: {
        resetChanges: function () {
            jQuery("#submitMessage").remove();
            partForm.resetChanges();
            jQuery("label").css("font-weight", "normal");
        },
        validateForm: function (e) {
            e.preventDefault();
            jQuery("#submitMessage").remove();
            partForm.errors = [];
            if (!partForm.isFormChanged()) {
                jQuery("#partForm > form").append("<p id='submitMessage'>No changes made</p>");
                return;
            }
            formValid = true;
            for (key in partForm.part) {
                valid = validateField(key, partForm.part[key], partForm.schema);
                if (!valid) {
                    partForm.errors.push({
                        "property": key,
                        "type": partForm.schema[key].parsedType,
                        "fieldLength": partForm.schema[key].fieldLength
                    });
                }
                formValid &= valid;
            }
            if (formValid) {
                jQuery("#partForm > form").append("<p id='submitMessage'>Submitting. This may take a moment...</p>");
                jQuery.ajax({
                    url: "/parts",
                    type: "post",
                    data: {
                        "tableName": partForm.tableName,
                        "originalPartNumber": partForm.serverStatePart["Part Number"],
                        "part": partForm.part
                    },
                    success: function (message) {
                        jQuery("#submitMessage").remove();
                        jQuery("#partForm > form").append(`<p id='submitMessage'>${message}</p>`);
                    },
                    error: function (xhr, status, message) {
                        jQuery("#submitMessage").remove();
                        jQuery("#partForm > form").append(`<p id='submitMessage'>ajax error in validateForm: ${status}: ${message}</p>`);
                    } 
                });
            }
        },
        formChangedHandler: function (property) {
            if (partForm.part[property] != partForm.serverStatePart[property]) 
                jQuery(`label[for='${property}']`).css("font-weight", "bold");
            else
                jQuery(`label[for='${property}']`).css("font-weight", "normal");
        }
    },
    template: `
        <form v-on:submit="validateForm">
            <ul id="messages">
                <li v-for="error in errors">
                    <p v-if="error.type == 'string'">{{ error.property }} must be less than {{ error.fieldLength }} characters and only contain ASCII values.</p>
                    <p v-else-if="error.type == 'number'">{{ error.property }} must be a number.</p>
                    <p v-else-if="error.type == 'enum'">{{ error.property }} must be selected from the dropdown.</p>
                    <p v-else>{{ error.property }} has an unkown error. Contact developer.</p>
                </li>
            </ul>
            <div v-for="(propValue, propKey) in data" v-bind:key="propKey" class="formField">
                <label v-bind:for="propKey">{{ propKey }}</label>
                <input v-bind:id="propKey"
                       v-if="schema[propKey].parsedType == 'string'"
                       v-model.trim="data[propKey]"
                       v-on:change="formChangedHandler(propKey)"
                       v-bind:required="!schema.nullAllowed">
                <a v-if="propKey == 'Link'" v-bind:href="data[propKey]">Go to link</a>
                <input v-bind:id="propKey"
                       v-else-if="schema[propKey].parsedType == 'number'"
                       v-model.number="data[propKey]"
                       v-bind:required="!schema.nullAllowed"
                       v-on:change="formChangedHandler(propKey)"
                       type="number" step="0.000001">
                <select v-bind:id="propKey"
                        v-else-if="schema[propKey].parsedType == 'enum'"
                        v-model="data[propKey]"
                       v-on:change="formChangedHandler(propKey)"
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
        tableName: "",
        part: {},
        serverStatePart: {},
        schema: {},
        errors: []
    },
    methods: {
        isFormChanged: function () {
            for (key in partForm.part) {
                if (partForm.part[key] != partForm.serverStatePart[key])
                    return true;
            }
            return false;
        }, 
        resetChanges: function () {
            for (property in partForm.part) {
                partForm.part[property] = partForm.serverStatePart[property];
            }
        }
    }
});
