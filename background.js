(function () {

    var optionKey = 'option',
        buttonGroup, allButton, transButton, docsButton, wipButton, data = {};

    function loadSavedState(callback) {
        chrome.storage.sync.get(optionKey, function(options) {
            callback(options[optionKey] !== undefined ? options[optionKey] : false);
        });
    }

    function isPullRequestPage() {
        return /pulls/.test(window.location.pathname);
    }

    function isTranslation(item) {
        return (/^\[Translations:/.test(item.textContent));
    }

    function isDocs(item) {
        return (/^\[Docs/.test(item.textContent));
    }

    function isWIP(item) {
        return (/^\[WIP/.test(item.textContent));
    }

    function show(item) {
        item.style.display = "block";
    }

    function hide(item) {
        item.style.display = "none";
    }


    /**
     * Check All button
     */
    function toggleAll() {
        if (!checkButton(allButton)) {
            data[optionKey] = "all";
            updateButton("all");
            chrome.storage.sync.set(data);
        }
    }

    /**
     * Check Translations button
     */
    function toggleTranslations() {
        if (!checkButton(transButton)) {
            data[optionKey] = "trans";
            updateButton("trans");
            chrome.storage.sync.set(data);
        }
    }

    /**
     * Check Docs button
     */
    function toggleDocs() {
        if(!checkButton(docsButton)) {
            data[optionKey]  = "docs";
            updateButton("docs");
            chrome.storage.sync.set(data);
        }
    }

    /**
     * Check WIP button
     */
    function toggleWIP() {
        if (!checkButton(wipButton)) {
            data[optionKey]  = "wip";
            updateButton("wip");
            chrome.storage.sync.set(data);
        }
    }

    /**
     * Check to see if a button is selected.
     * If a selected button is clicked, it removes all filters.
     *
     * @param button
     * @returns {boolean}
     */
    function checkButton(button) {
        if(button.classList.contains('selected')) {
            data[optionKey] = false;
            chrome.storage.sync.set(data);
            return true;
        }
        return false;
    }

    function drawButtons () {
        var menu = document.querySelector('.issues-list-options');

        // Make more room
        document.querySelector('.issues-list-options .add-button').innerHTML = 'New';
        /**
         * Create button group
         * @type {HTMLElement}
         */
        buttonGroup = document.createElement('div');
        buttonGroup.classList.add("button-group");

        /**
         * Create All button
         * @type {HTMLElement}
         */
        allButton = document.createElement('a');
        allButton.appendChild(document.createTextNode('All'));
        allButton.classList.add("minibutton");

        /**
         * Create Translations button
         * @type {HTMLElement}
         */
        transButton = document.createElement('a');
        transButton.appendChild(document.createTextNode('Trans'));
        transButton.classList.add("minibutton");

        /**
         * Create documentation button
         * @type {HTMLElement}
         */
        docsButton = document.createElement('a');
        docsButton.appendChild(document.createTextNode('Docs'));
        docsButton.classList.add("minibutton");

        /**
         * Create WIP button
         * @type {HTMLElement}
         */
        wipButton = document.createElement('a');
        wipButton.appendChild(document.createTextNode('WIP'));
        wipButton.classList.add("minibutton");

        /**
         * Shh.. listening for clicks.
         */
        allButton.addEventListener("click", toggleAll, false);
        transButton.addEventListener("click", toggleTranslations, false);
        docsButton.addEventListener("click", toggleDocs, false);
        wipButton.addEventListener("click", toggleWIP, false);

        /**
         * Add button group to the UI
         */
        buttonGroup.appendChild(allButton);
        buttonGroup.appendChild(transButton);
        buttonGroup.appendChild(docsButton);
        buttonGroup.appendChild(wipButton);
        menu.appendChild(buttonGroup);
    }

    function updateButton(state) {
        /**
         * Un-select previously selected buttons
         * @type {Node}
         */
        var selected = buttonGroup.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        /**
         * Toggle the button clicked.
         */
        switch (state) {
            case "all":
                allButton.classList.toggle("selected");
                break;
            case "trans":
                transButton.classList.toggle("selected");
                break;
            case "docs":
                docsButton.classList.toggle("selected");
                break;
            case "wip":
                wipButton.classList.toggle("selected");
                break;
            default:
                break;
        }
    }

    function updateList(state) {
        var list = document.querySelectorAll('.pulls-list-group .list-group-item-name a'),
            count = list.length,
            key;

        for (key in list) {
            if (list.hasOwnProperty(key) && key !== 'length') {
                var itemParent = list[key].parentElement.parentElement;
                if (!state) {
                    // Display everything
                    if (isTranslation(list[key]) || isDocs(list[key]) || isWIP(list[key])) {
                        hide(itemParent);
                        count -=1;
                    } else {
                        show(itemParent);
                    }
                } else {
                    switch (state) {
                        case "all": // Display all
                            show(itemParent);
                            break;
                        case "trans": // Display translations
                            if (!isTranslation(list[key])) {
                                hide(itemParent);
                                count -=1;
                            } else {
                                show(itemParent);
                            }
                            break;
                        case "docs": // Display documentation
                            if (!isDocs(list[key])) {
                                hide(itemParent);
                                count -=1;
                            } else {
                                show(itemParent);
                            }
                            break;
                        case "wip": // Display WIP
                            if (!isWIP(list[key])) {
                                hide(itemParent);
                                count -=1;
                            } else {
                                show(itemParent);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        document.querySelector('.filter-list .count').innerHTML = count;
    }

    function updateUi(state) {
        updateButton(state);
        updateList(state);
    }

    function initUi() {
        drawButtons();
        loadSavedState(updateUi);
    }

    function initStorage() {
        chrome.storage.onChanged.addListener(function (changes) {
            updateUi(changes[optionKey].newValue);
        });
    }

    function init() {
        if (isPullRequestPage()) {
            initStorage();
            initUi();

            var container = document.querySelector('#js-repo-pjax-container');
            function listener (e) {
                if (e.relatedNode.className === "repository-content context-loader-container") {
                    initUi();
                }
            }

            container.addEventListener("DOMNodeInserted", listener);
        }
    }

    init();
}());