(function () {

    var translationKey = 'TRANSLATIONS',
        transButton;

    function loadSavedState(callback) {
        chrome.storage.sync.get(translationKey, function(trans) {
            callback(trans[translationKey] !== undefined ? trans[translationKey] : false);
        });
    }

    function isPullRequestPage() {
        if (/pulls/.test(window.location.pathname)) {
            return true;
        }
    }

    function isTranslation(item) {
        if (/^\[Translations:/.test(item.textContent)) {
            return true;
        }
    }


    function toggleTranslations() {
        var data = {};
        data[translationKey] = ! transButton.classList.contains("selected");
        chrome.storage.sync.set(data);
    }

    function drawButton () {
        var menu = document.querySelector('.issues-list-options');

        transButton = document.createElement('a');
        transButton.appendChild(document.createTextNode('Translations'));
        transButton.classList.add("minibutton");

        transButton.addEventListener("click", toggleTranslations, false);
        menu.appendChild(transButton);
    }

    function updateButton(state) {
        if (state === true) {
            transButton.classList.add("selected");
        } else {
            transButton.classList.remove("selected");
        }
    }

    function updateList(state) {
        var list = document.querySelectorAll('.pulls-list-group .list-group-item-name a'),
            key;

        for (key in list) {
            if (list.hasOwnProperty(key) && key !== 'length') {
                if (!state) {
                    if (isTranslation(list[key])) {
                        list[key].parentElement.parentElement.style.display = "none";
                    } else {
                        list[key].parentElement.parentElement.style.display = "block";
                    }
                } else {
                    if (!isTranslation(list[key])) {
                        list[key].parentElement.parentElement.style.display = "none";
                    } else {
                        list[key].parentElement.parentElement.style.display = "block";
                    }
                }

            }
        }
    }

    function updateUi(state) {
        updateButton(state);
        updateList(state);
    }

    function init() {
        if (isPullRequestPage()) {
            drawButton();

            chrome.storage.onChanged.addListener(function (changes) {
                updateUi(changes[translationKey].newValue);
            });
            loadSavedState(updateUi);
        }
    }

    init();
}());