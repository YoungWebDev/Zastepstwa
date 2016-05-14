{
    const apiPattern = 'http://zastepstwa.esy.es/scrape/{{DATE}}/false';
    const $dropdown = $('.ui.dropdown');
    const dropdown = document.getElementById('teachers');
    const boxes = document.getElementById('teachers-boxes');
    const teacherName = document.getElementById('teacher-name');
    const lessons = document.getElementById('lessons');
    const warning = document.getElementById('warning');
    const yesterday = document.getElementById('yesterday');
    const today = document.getElementById('today');
    const tomorrow = document.getElementById('tomorrow');
    const loader = document.getElementById('loader');
    const daysPicker = document.getElementById('daysPicker');

    var storage, api, currentDay, dayInProgress, elInProgress;
    currentDay = '';

    function clearLessons () {
        lessons.innerHTML = "";
    }

    function addLesson (obj) {
        var tr = document.createElement('tr');
        var hour = document.createElement('td');
        var desc = document.createElement('td');
        var repl = document.createElement('td');
        hour.textContent = obj.lekcja;
        desc.textContent = obj.opis;
        repl.textContent = obj.zastepca;
        tr.appendChild(hour);
        tr.appendChild(desc);
        tr.appendChild(repl);
        lessons.appendChild(tr);
    }

    function generateApiUrl (date) {
      api = apiPattern.replace('{{DATE}}', date);
    }

    function changeTeachersName (name) {
        teacherName.innerHTML = name;
    }

    function update (value) {
        clearLessons();
        showEl(boxes);
        changeTeachersName(storage[value].teacher);
        storage[value].lessons.forEach(function (obj) {
            addLesson(obj);
        });
    }

    function download (callback = false, day, next) {
        $.get(api).done(function (json) {
            if (hideTeachersBoxesIfEmpty(json) == false) {
              if (callback != false) callback(day, false, next);
              else {
                storage = JSON.parse(json);
                options();
                hideEl(warning);
              }
            } else {
              showEl(warning);
              if (callback != false) callback(day, true, next);
            }
        });
    }

    function makeOption (key, value) {
        return new Option(value, key);
    }

    function options () {
        storage.forEach( function (obj, key) {
            dropdown.appendChild(makeOption(key, obj.teacher));
        });
        initDropdown();
    }

    function initDropdown () {
        $('.ui.dropdown').dropdown({
            onChange: function (value, text, $selectedItem) {
                update(value);
            }
        });
    }

    function showEl (El, type = 'block') {
      El.style.display = type;
    }

    function hideEl (El) {
      El.style.display = 'none';
    }

    function hideTeachersBoxesIfEmpty (json) {
      if (catchException(json)) {
        hideEl(boxes);
        hideEl(dropdown);
        showEl(warning);
        return true;
      } else {
        return false;
      }
    }

    function catchException (serverResponse) {
      return serverResponse.indexOf('Warning') > -1;
    }

    function generateDateHash (date) {
      var now, hash;
      now = new Date();
      switch (date) {
        case 'yesterday':
          hash = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'tomorrow':
          hash = new Date(now.setDate(now.getDate() + 1));
          break;
        default:
          hash = now;
      }
      var year, month, day;
      year = hash.getFullYear().toString()
      month = hash.getMonth() + 1;
      month = month < 10 ? '0' + month.toString() : month.toString();
      day = hash.getDate().toString();
      return year + month + day;
    }

    function success () {

    }

    function error () {

    }

    function changeDay (day, el) {
      dayInProgress = day;
      elInProgress = el;
      var hash = generateDateHash(day);
      generateApiUrl(hash);
      download();
    }

    // function init () {
    //   var hash = generateDateHash(currentDay);
    //   generateApiUrl(hash);
    //   download();
    // }

    function daysValidator (day = 'yesterday', error = false, next = '') {
      if (error == true) blockPick(day);
      var hash;
      switch (next) {
        case 'today':
          hash = generateDateHash(next);
          generateApiUrl(hash);
          download(daysValidator, next, 'tomorrow');
          break;
        case 'tomorrow':
          hash = generateDateHash(next);
          generateApiUrl(hash);
          download(daysValidator, next, 'end');
        case 'end':
            hideEl(loader);
            showEl(daysPicker, 'flex');
          break;
        default:
          hash = generateDateHash(day);
          generateApiUrl(hash);
          download(daysValidator, day, 'today');
      }
    }

    function blockPick (day) {
      window[day].className += ' disabled';
    }

    daysValidator();
    //changeDay('today', today);
}
