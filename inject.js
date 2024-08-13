// Description: This file is responsible for injecting the script into the current tab.
const checkSwaggerDefinition = () => {
    const swaggerDefinition = window.ui && window.ui.specSelectors && window.ui.specSelectors.specJson() && window.ui.specSelectors.specJson().toJS();
    
    if (swaggerDefinition) {
        document.dispatchEvent(
            new CustomEvent("swaggerDefinitionRetrieved", {
                detail: JSON.stringify(swaggerDefinition, null, 2),
            })
        );
    } else {
        setTimeout(checkSwaggerDefinition, 1000); // Retry after 1 second
    }
};

const checkSchemaDefinition = (schemaName) => {
    const schemaDefinition = window.ui && window.ui.specSelectors && window.ui.specSelectors.definitions().get(schemaName).toJS();
    
    if (schemaDefinition) {
        document.dispatchEvent(
            new CustomEvent("schemaDefinitionRetrieved", {
                detail: { schemaName, schemaDefinition: JSON.stringify(schemaDefinition, null, 2) },
            })
        );
    } else {
        setTimeout(() => checkSchemaDefinition(schemaName), 1000); // Retry after 1 second
    }
};

const copyAllSchemas = () => {
    const allSchemas = window.ui && window.ui.specSelectors && window.ui.specSelectors.definitions();
    
    if (allSchemas) {
        const allSchemasJson = JSON.stringify(allSchemas.toJS(), null, 2); // Convert ImmutableJS Map to plain JS object and then stringify
        document.dispatchEvent(
            new CustomEvent("allSchemasCopied", {
                detail: allSchemasJson,
            })
        );
    } else {
        setTimeout(copyAllSchemas, 1000); // Retry after 1 second
    }
};

// Listen for schema retrieval requests
document.addEventListener("requestSchemaDefinition", (event) => {
    const schemaName = event.detail;
    checkSchemaDefinition(schemaName);
});

// Listen for the request to copy all schemas
document.addEventListener("requestCopyAllSchemas", () => {
    copyAllSchemas();
});

document.addEventListener("requestSwaggerDefinition", () => {
    checkSwaggerDefinition();
});