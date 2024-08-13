// Function to inject our custom script into the webpage
const injectCustomScript = () => {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");
  (document.head || document.documentElement).appendChild(script);
};

// Function to observe dynamic changes in the DOM and apply the provided callback to relevant nodes
const observeDOMChanges = (selector, callback) => {
  const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
          mutation.addedNodes.forEach(addedNode => {
              if (addedNode.nodeType === 1) { // Check if the added node is an element
                  const matchedElements = addedNode.querySelectorAll?.(selector);
                  if (matchedElements && matchedElements.length > 0) {
                      callback(matchedElements);
                  }
              }
          });
      });
  });

  // Start observing the document body for dynamic content changes
  observer.observe(document.body, {
      childList: true,
      subtree: true
  });

  // Initial check for any already present elements
  const initialElements = document.querySelectorAll(selector);
  if (initialElements.length > 0) {
      callback(initialElements);
  }
};

// Function to create a reusable "Copy URL" button using Swagger-UI styles
const createCopyButton = (onClickHandler) => {
  const copyToClipboard = document.createElement('div');
  copyToClipboard.className = 'copy-to-clipboard'; // Use existing Swagger-UI styles
  copyToClipboard.ariaLabel = 'Copy to Clipboard';
  copyToClipboard.title = 'Copy to Clipboard';
  copyToClipboard.style.right = '10px';
  
  const copyButton = document.createElement('button');  
  
  // Attach the provided click handler
  copyButton.addEventListener('click', onClickHandler);
  
  // Add the button to the container
  copyToClipboard.appendChild(copyButton);

  return copyToClipboard;
};

// Function to show a toast notification on the screen
const showToast = (message, duration = 3000) => {
  const toast = document.createElement('div');
  toast.style = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #45a047;
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      text-align: center;
  `;
  toast.textContent = message;

  // Add the toast to the document body
  document.body.appendChild(toast);

  // Remove the toast after the specified duration
  setTimeout(() => document.body.removeChild(toast), duration);
};

// Function to append "Copy URL" buttons to specified elements
const appendCopyButtons = (elements, urlBuilder) => {
  elements.forEach(element => {
      const linkElement = element.querySelector('a');
      if (!linkElement) return; // Skip if no link is found

      // Construct the new URL by appending the link href to the cleaned base URL
      const url = urlBuilder(linkElement.getAttribute('href'));

      // Create the "Copy URL" button using Swagger-UI styles
      const copyButton = createCopyButton(() => {
          navigator.clipboard.writeText(url)
              .then(() => showToast(`${url} Successfully Copied to Clipboard`))
              .catch(err => showToast(`${url} Copying Process Failed`, err));
      });

      // Append the button to the element
      element.appendChild(copyButton);
  });
};

// Function to create and append a "Copy Swagger Definition" button to the specified hgroup
const appendCopyDefinitionButton = () => {
  const onClickHandler = () => {
      // Dispatch an event to request the Swagger definition
      document.dispatchEvent(new CustomEvent("requestSwaggerDefinition"));
  };

  // Create the "Copy Swagger Definition" button using existing styles
  const copyDefinitionButton = createCopyButton(onClickHandler);
  copyDefinitionButton.ariaLabel = 'Copy Swagger Definition';
  copyDefinitionButton.style.marginLeft = '10px'; // Space between text and button
  copyDefinitionButton.style.position = 'relative';
  copyDefinitionButton.style.right = '0px';
  copyDefinitionButton.style.display = 'inline-flex';

  // Use observeDOMChanges to monitor the DOM for the target element and insert the button
  observeDOMChanges('hgroup.main h2.title', (headerElements) => {
      headerElements.forEach(headerElement => {
          const versionSpan = headerElement.querySelector('span');
          if (versionSpan) {
              versionSpan.insertAdjacentElement('beforebegin', copyDefinitionButton);
          } else {
              headerElement.appendChild(copyDefinitionButton);
          }
      });
  });
};

// // Function to observe for the <h2> element and add the button once it's available
// const observeForHeader = () => {
//   const observer = new MutationObserver(mutations => {
//       mutations.forEach(mutation => {
//           mutation.addedNodes.forEach(addedNode => {
//               if (addedNode.nodeType === 1) { // Check if the added node is an element
//                   const hgroup = addedNode.querySelector('hgroup.main h2.title');
//                   if (hgroup) {
//                       appendCopyDefinitionButton();
//                       observer.disconnect(); // Stop observing once the button is added
//                   }
//               }
//           });
//       });
//   });

//   // Check if the element already exists
//   const hgroupExists = document.querySelector('hgroup.main h2.title');
//   if (hgroupExists) {
//       appendCopyDefinitionButton();
//   } else {
//       // Start observing the document body for changes
//       observer.observe(document.body, {
//           childList: true,
//           subtree: true
//       });
//   }
// };

// Listen for the event that carries the Swagger definition to copy it to the clipboard
document.addEventListener("swaggerDefinitionRetrieved", (event) => {
  const swaggerDefinition = event.detail;
  navigator.clipboard.writeText(swaggerDefinition)
      .then(() => showToast('Swagger Definition Successfully Copied to Clipboard'))
      .catch(err => showToast('Copying Swagger Definition Failed', err));
});

// Function to create and append "Copy Schema" buttons to each model-box inside model-container
const appendCopySchemaButtons = () => {
  observeDOMChanges('.model-container', (modelContainers) => {
      modelContainers.forEach(container => {
          const schemaName = container.getAttribute('data-name');
          const modelBoxElement = container.querySelector('.model-box');

          if (modelBoxElement) {
              const onClickHandler = () => {
                  // Dispatch an event to request the schema definition
                  document.dispatchEvent(
                      new CustomEvent("requestSchemaDefinition", {
                          detail: schemaName,
                      })
                  );
              };

              // Create the "Copy Schema" button using existing styles
              const copySchemaButton = createCopyButton(onClickHandler);
              copySchemaButton.ariaLabel = `Copy ${schemaName} Schema`;
              copySchemaButton.style.marginLeft = '10px'; // Space between text and button

              // Append the button to the model-box element
              modelBoxElement.appendChild(copySchemaButton);
          }
      });
  });
};

// Listen for the schema definition to be retrieved and copied to clipboard
document.addEventListener("schemaDefinitionRetrieved", (event) => {
  const { schemaName, schemaDefinition } = event.detail;

  // Copy the JSON schema to the clipboard
  navigator.clipboard.writeText(`${schemaName}: ${schemaDefinition}`)
      .then(() => showToast(`${schemaName} Schema Successfully Copied to Clipboard`))
      .catch(err => showToast(`Copying ${schemaName} Schema Failed`, err));
});

// Function to create and append the "Copy All Schemas" button
const appendCopyAllSchemasButton = () => {
  observeDOMChanges('.models h4', (headerElements) => {
      headerElements.forEach(headerElement => {
          // Create the button
          const copyAllButton = createCopyButton(() => {
              document.dispatchEvent(new CustomEvent("requestCopyAllSchemas"));
          });
          copyAllButton.ariaLabel = 'Copy All Schemas';
          copyAllButton.style.position = 'relative';
          copyAllButton.style.marginLeft = '20px'; // Space between text and button
          copyAllButton.style.bottom = '0px';

          // Insert the button as the last child of the <h4> element
          headerElement.appendChild(copyAllButton);
      });
  });
};

// Listen for the event to copy all schemas to the clipboard
document.addEventListener("allSchemasCopied", (event) => {
  const allSchemasJson = event.detail;

  // Copy all schemas JSON to the clipboard
  navigator.clipboard.writeText(allSchemasJson)
      .then(() => showToast('All Schemas Successfully Copied to Clipboard'))
      .catch(err => showToast('Copying All Schemas Failed', err));
});

// Function to append "Copy" buttons to code blocks with the class 'microlight'
const appendCopyButtonsToCodeBlocks = () => {
  observeDOMChanges('.microlight', (codeBlocks) => {
      // Filter out code blocks that already contain a copy button
      const filteredCodeBlocks = [...codeBlocks].filter(block => 
          !block.parentElement.querySelector('button') &&
          !block.parentNode.querySelector('.copy-to-clipboard') &&
          !block.parentNode.parentNode.querySelector('.copy-to-clipboard')
      );

      // Add a copy button to each filtered code block
      filteredCodeBlocks.forEach(codeBlock => {
          const copyButton = createCopyButton(() => {
              navigator.clipboard.writeText(codeBlock.innerText)
                  .then(() => showToast(`Successfully Copied to Clipboard`))
                  .catch(err => showToast(`Copying Process Failed`, err));
          });
          copyButton.style.height = '20px';
          copyButton.style.width = '20px';
          codeBlock.parentElement.style.position = 'relative';          
          codeBlock.parentElement.append(copyButton);
      });
  });
};

// Inject the custom script into the webpage
injectCustomScript();

// Extract the base URL by removing any fragment identifiers
const cleanedUrl = window.location.href.split('#/')[0];

// Select all open tag sections and add "Copy URL" buttons
const tagSections = document.querySelectorAll('.opblock-tag-section.is-open');
appendCopyButtons(tagSections, href => `${cleanedUrl}${href}`);

// Select all operation blocks and add "Copy URL" buttons
const opblockElements = document.querySelectorAll('.opblock-put, .opblock-get, .opblock-post, .opblock-delete');
appendCopyButtons(opblockElements, href => `${cleanedUrl}${href}`);

// Append the additional buttons to the page
appendCopyButtonsToCodeBlocks();
appendCopyDefinitionButton();
appendCopySchemaButtons();
appendCopyAllSchemasButton();