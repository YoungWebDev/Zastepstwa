{
    const apiPattern = 'http://localhost:8888/Projekty/Zastepstwa/public/scrape/{{DATE}}/false';
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
    const select = document.getElementById('select');
    const typePicker = document.getElementById('typePicker');

    var storage, api, currentDay, dayInProgress, elInProgress, appMode;
    currentDay = '';
    appMode = 'normal';

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
                $('.selection').show();
                if (appMode == 'normal') {
                  options();
                } else if (appMode == 'alternative') {
                  useAlternativeStorage();
                }
                hideEl(warning);
              }
            } else {
              //showEl(warning);
              if (callback != false) callback(day, true, next);
            }
            //hideEl(loader);
            //showEl(daysPicker, 'flex');
        });
    }

    function useAlternativeStorage () {
      convertStorageToAlternativeStorage()
    }

    function convertStorageToAlternativeStorage() {
      var convertedStorage = [];
      var teachers = {};
      storage.forEach(function (obj, key) {
          var teacher = obj.teacher;
          obj.lessons.forEach(function (_obj, key) {
              if (_obj.zastepca != '')
                if (typeof teachers[_obj.zastepca] != 'object') {
                  teachers[_obj.zastepca] = {
                    'teacher': _obj.zastepca,
                    'lessons': []
                  };
                  var zastepca = _obj.zastepca;
                  _obj.zastepca = teacher;
                  teachers[zastepca]['lessons'].push(_obj);
                } else {
                  var zastepca = _obj.zastepca;
                  _obj.zastepca = teacher;
                  teachers[zastepca]['lessons'].push(_obj);
                }
          });
      });
      // Convert back to array
      var teachersArr = [];
      for (let i in teachers) {
        teachersArr.push(teachers[i]);
      }
      storage = teachersArr;
      options();
    }

    function makeOption (key, value) {
        return new Option(value, key);
    }

    function options () {
      destroySelect();
      var newSelect = makeSelect();
      newSelect.append(makeOption('', 'Nauczyciele'));
      storage.forEach( function (obj, key) {
        newSelect.append(makeOption(key, obj.teacher));
      });
      rebuildDropdown(newSelect);
    }

    function destroySelect () {
      select.innerHTML = '';
    }

    function makeSelect () {
      var select = $('<select id="teachers" class="ui fluid dropdown large" />');
      $('#select').append(select);
      return select;
    }

    function rebuildDropdown (newSelect) {
      newSelect.dropdown({
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
        //showEl(warning);
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
      hideEl(boxes);
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
          setTimeout(()=>{
            hideEl(loader);
            showEl(typePicker, '');
            showEl(daysPicker, 'flex');
            showEl(warning);
          }, 150);
          break;
        default:
          hash = generateDateHash(day);
          generateApiUrl(hash);
          download(daysValidator, day, 'today');
      }
    }

    function changeAppMode(mode) {
      appMode = mode;
      hideEl(boxes);
      //showEl(warning);
      hideEl(dropdown);
      $('.selection').hide(); // dropdown
    }

    function blockPick (day) {
      window[day].className += ' disabled';
    }

    hideEl(typePicker);
    daysValidator();
    //changeDay('today', today);
}


// TYMCZASOWE

$('.ui.checkbox').checkbox({
  onChecked: function () {
    changeAppMode('alternative');
    $('#zastepca').text('Zastepstwo za');
  },
  onUnchecked: function () {
    changeAppMode('normal');
    $('#zastepca').text('Zastępca');
  }
});
