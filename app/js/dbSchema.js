function parseTableSchema(schema) {
    schemaObj = {};
    for (column of schema) {
        schemaObj[column.Field] = column;
        if (column.Null === "YES")
            schemaObj[column.Field].nullAllowed = true;
        else if (column.Null === "NO")
            schemaObj[column.Field].nullAllowed = false;
        else
            console.log(`Unknown value ${column.Null} for schema Null attribute`);
        
        if (column.Type.toLowerCase().indexOf("enum") > -1) {
            schemaObj[column.Field].parsedType = "enum";
            schemaObj[column.Field].enums = column.Type.replace(/\'/g, "").slice(5, -1).split(',');
        } else if (column.Type.toLowerCase().indexOf("tinytext") > -1) {
            schemaObj[column.Field].parsedType = "string";
            schemaObj[column.Field].fieldLength = 255;
        } else if (column.Type.toLowerCase().indexOf("text") > -1) {
            schemaObj[column.Field].parsedType = "string";
            schemaObj[column.Field].fieldLength = 511;    // Theoretically can support up to 2^16
        } else if (column.Type.toLowerCase().indexOf("float") > -1) {
            schemaObj[column.Field].parsedType = "number";
        } else if (column.Type.toLowerCase().indexOf("varchar") > -1) {
            schemaObj[column.Field].parsedType = "string";
            schemaObj[column.Field].fieldLength = Number(column.Type.slice(8, -1));
        } else {
            console.log(`Unknown value ${column.Type} for schema Type attribute`);
        }

    }
    return schemaObj;
}

function validateField(name, value, schema) {
    if (schema[name].parsedType == "enum") 
        return schema[name].enums.indexOf(value) > -1 ? true : false;
    else if (schema[name].parsedType == "string")
        return value.length <= schema[name].fieldLength;
    else if (schema[name].parsedType == "number")
        return isNaN(Number(value));
    else 
        return false;
}
