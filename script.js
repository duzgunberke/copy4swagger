var currentPageUrl = window.location.href;

var cleanedUrl = currentPageUrl.split('#/')[0];

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
  
    toast.style.position = 'fixed';
    toast.style.top = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#45a047';
    toast.style.color = 'white';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    toast.style.textAlign = 'center';
  
    toast.textContent = message;
  
    document.body.appendChild(toast);
  
    setTimeout(() => {
        document.body.removeChild(toast);
    }, duration);
}

var tagSections = document.querySelectorAll('.opblock-tag-section.is-open');

tagSections.forEach(function(tagSection) {
    var tagHeader = tagSection.querySelector('.opblock-tag');

    var copyButton = document.createElement('button');
    copyButton.textContent = 'Copy URL';
    copyButton.classList.add('copy-button');
    copyButton.style.backgroundColor = '#4CAF50';
    copyButton.style.border = 'none';
    copyButton.style.color = 'white';
    copyButton.style.padding = '5px 10px';
    copyButton.style.textAlign = 'center';
    copyButton.style.textDecoration = 'none';
    copyButton.style.display = 'inline-block';
    copyButton.style.fontSize = '14px';
    copyButton.style.margin = '4px 2px';
    copyButton.style.cursor = 'pointer';
    copyButton.style.borderRadius = '4px';
    copyButton.style.transitionDuration = '0.4s';

    copyButton.addEventListener('mouseover', function() {
        copyButton.style.backgroundColor = '#45a049';
    });

    copyButton.addEventListener('mouseout', function() {
        copyButton.style.backgroundColor = '#4CAF50';
    });

    tagHeader.appendChild(copyButton);

    copyButton.addEventListener('click', function() {
        var linkElement = tagHeader.querySelector('a');
        var url = linkElement.getAttribute('href');
        var newUrl = cleanedUrl + url;
        navigator.clipboard.writeText(newUrl)
            .then(function() {
                console.log('URL copied: ' + newUrl);
                showToast(newUrl + ' Successfully Copied to Clipboard')
            })
            .catch(function(err) {
                console.error('Copying failed: ', err);
                showToast(newUrl + ' Copying Process Failed')
            });
    });
});

var opblockElements = document.querySelectorAll('.opblock-put, .opblock-get, .opblock-post, .opblock-delete');

opblockElements.forEach(function(opblockElement) {
    var controlButton = opblockElement.querySelector('.opblock-summary-control');

    if (!controlButton) {
        return;
    }

    var pathDescriptionWrapper = controlButton.querySelector('.opblock-summary-path-description-wrapper');

    if (!pathDescriptionWrapper) {
        return;
    }

    var pathSpan = pathDescriptionWrapper.querySelector('.opblock-summary-path');

    if (!pathSpan) {
        return;
    }

    var linkElement = pathSpan.querySelector('a');

    if (!linkElement) {
        return;
    }

    var url = linkElement.getAttribute('href');

    var newUrl = cleanedUrl + url;

    var copyButton = document.createElement('button');
    copyButton.textContent = 'Copy URL';
    copyButton.classList.add('copy-button');
    copyButton.style.backgroundColor = '#4CAF50';
    copyButton.style.border = 'none';
    copyButton.style.color = 'white';
    copyButton.style.padding = '3px 6px';
    copyButton.style.textAlign = 'center';
    copyButton.style.textDecoration = 'none';
    copyButton.style.display = 'inline-block';
    copyButton.style.fontSize = '10px';
    copyButton.style.margin = '2px 1px';
    copyButton.style.cursor = 'pointer';
    copyButton.style.borderRadius = '4px';
    copyButton.style.transitionDuration = '0.4s';

    copyButton.addEventListener('mouseover', function() {
        copyButton.style.backgroundColor = '#45a049';
    });

    copyButton.addEventListener('mouseout', function() {
        copyButton.style.backgroundColor = '#4CAF50';
    });

    controlButton.appendChild(copyButton);

    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(newUrl)
            .then(function() {
                console.log('URL copied: ' + newUrl);
                showToast(newUrl + ' Successfully Copied to Clipboard')
            })
            .catch(function(err) {
                console.error('Copying failed: ', err);
                showToast(newUrl + ' Copying Process Failed')
            });
    });
});


function onCopyClick(codeBlock) {
    navigator.clipboard.writeText(codeBlock.innerText).then(() => {
      this.innerText = "Copied!"
      setTimeout(() => {
        this.innerText = "Copy";
      }, 2000)
    }).catch(() => {
      this.innerText = "Failed to Copy!"
      setTimeout(() => {
        this.innerText = "Copy";
      }, 2000)
    })
  }
  
  
  const copyButton = () => {
    const copyButton = document.createElement('button');
    copyButton.innerText = "Copy";
  
    copyButton.setAttribute('class', 'copy-swagger');
  
    return copyButton
  }
  
  const addCopyButtonToCodeBlocks = (codeBlocks) => {
    codeBlocks.forEach(codeBlock => {
      const newCopyButton = copyButton();
  
      newCopyButton.addEventListener("click", onCopyClick.bind(newCopyButton, codeBlock))
  
      codeBlock.parentElement.append(newCopyButton);
    })
  }
  
  const alreadyContainsCopyButton = (codeBlock) => {
    return !!codeBlock.parentNode.querySelector('.copy-to-clipboard') || !!codeBlock.parentNode.parentNode.querySelector('.copy-to-clipboard');
  }
  
  
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(addedNode => {
        const codeBlocks = addedNode.querySelector && addedNode.querySelectorAll('.microlight');
        if (codeBlocks && codeBlocks.length) {
          filteredCodeBlocks = [...codeBlocks].filter(block => !block.parentElement.querySelector('button') && !alreadyContainsCopyButton(block));
          if (filteredCodeBlocks.length) {
            addCopyButtonToCodeBlocks(filteredCodeBlocks);
          }
        }
      })
    })
  })
  
  observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
  })
