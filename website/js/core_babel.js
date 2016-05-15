'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

{
  var storage, api, currentDay, dayInProgress, elInProgress, appMode;

  (function () {
    var clearLessons = function clearLessons() {
      lessons.innerHTML = "";
    };

    var addLesson = function addLesson(obj) {
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
    };

    var generateApiUrl = function generateApiUrl(date) {
      api = apiPattern.replace('{{DATE}}', date);
    };

    var changeTeachersName = function changeTeachersName(name) {
      teacherName.innerHTML = name;
    };

    var update = function update(value) {
      clearLessons();
      showEl(boxes);
      changeTeachersName(storage[value].teacher);
      storage[value].lessons.forEach(function (obj) {
        addLesson(obj);
      });
    };

    var download = function download() {
      var callback = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      var day = arguments[1];
      var next = arguments[2];

      $.get(api).done(function (json) {
        if (hideTeachersBoxesIfEmpty(json) == false) {
          if (callback != false) callback(day, false, next);else {
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
    };

    var useAlternativeStorage = function useAlternativeStorage() {
      convertStorageToAlternativeStorage();
    };

    var convertStorageToAlternativeStorage = function convertStorageToAlternativeStorage() {
      var convertedStorage = [];
      var teachers = {};
      storage.forEach(function (obj, key) {
        var teacher = obj.teacher;
        obj.lessons.forEach(function (_obj, key) {
          if (_obj.zastepca != '') if (_typeof(teachers[_obj.zastepca]) != 'object') {
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
      for (var i in teachers) {
        teachersArr.push(teachers[i]);
      }
      storage = teachersArr;
      options();
    };

    var makeOption = function makeOption(key, value) {
      return new Option(value, key);
    };

    var options = function options() {
      destroySelect();
      var newSelect = makeSelect();
      newSelect.append(makeOption('', 'Nauczyciele'));
      storage.forEach(function (obj, key) {
        newSelect.append(makeOption(key, obj.teacher));
      });
      rebuildDropdown(newSelect);
    };

    var destroySelect = function destroySelect() {
      select.innerHTML = '';
    };

    var makeSelect = function makeSelect() {
      var select = $('<select id="teachers" class="ui fluid dropdown large" />');
      $('#select').append(select);
      return select;
    };

    var rebuildDropdown = function rebuildDropdown(newSelect) {
      newSelect.dropdown({
        onChange: function onChange(value, text, $selectedItem) {
          update(value);
        }
      });
    };

    var showEl = function showEl(El) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? 'block' : arguments[1];

      El.style.display = type;
    };

    var hideEl = function hideEl(El) {
      El.style.display = 'none';
    };

    var hideTeachersBoxesIfEmpty = function hideTeachersBoxesIfEmpty(json) {
      if (catchException(json)) {
        hideEl(boxes);
        hideEl(dropdown);
        //showEl(warning);
        return true;
      } else {
        return false;
      }
    };

    var catchException = function catchException(serverResponse) {
      return serverResponse.indexOf('Warning') > -1;
    };

    var generateDateHash = function generateDateHash(date) {
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
      year = hash.getFullYear().toString();
      month = hash.getMonth() + 1;
      month = month < 10 ? '0' + month.toString() : month.toString();
      day = hash.getDate().toString();
      return year + month + day;
    };

    var success = function success() {};

    var error = function error() {};

    var changeDay = function changeDay(day, el) {
      hideEl(boxes);
      dayInProgress = day;
      elInProgress = el;
      var hash = generateDateHash(day);
      generateApiUrl(hash);
      download();
    };

    // function init () {
    //   var hash = generateDateHash(currentDay);
    //   generateApiUrl(hash);
    //   download();
    // }

    var daysValidator = function daysValidator() {
      var day = arguments.length <= 0 || arguments[0] === undefined ? 'yesterday' : arguments[0];
      var error = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var next = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

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
          setTimeout(function () {
            hideEl(loader);
            showEl(typePicker);
            showEl(daysPicker, 'flex');
            showEl(warning);
          }, 150);
          break;
        default:
          hash = generateDateHash(day);
          generateApiUrl(hash);
          download(daysValidator, day, 'today');
      }
    };

    var changeAppMode = function changeAppMode(mode) {
      appMode = mode;
      hideEl(boxes);
      //showEl(warning);
      hideEl(dropdown);
      $('.selection').hide(); // dropdown
    };

    var blockPick = function blockPick(day) {
      window[day].className += ' disabled';
    };

    var apiPattern = 'http://localhost:8888/Projekty/Zastepstwa/public/scrape/{{DATE}}/false';
    var $dropdown = $('.ui.dropdown');
    var dropdown = document.getElementById('teachers');
    var boxes = document.getElementById('teachers-boxes');
    var teacherName = document.getElementById('teacher-name');
    var lessons = document.getElementById('lessons');
    var warning = document.getElementById('warning');
    var yesterday = document.getElementById('yesterday');
    var today = document.getElementById('today');
    var tomorrow = document.getElementById('tomorrow');
    var loader = document.getElementById('loader');
    var daysPicker = document.getElementById('daysPicker');
    var select = document.getElementById('select');
    var typePicker = document.getElementById('typePicker');

    currentDay = '';
    appMode = 'normal';

    daysValidator();
    //changeDay('today', today);
  })();
}

// TYMCZASOWE

$('.ui.checkbox').checkbox({
  onChecked: function onChecked() {
    changeAppMode('alternative');
    $('#zastepca').text('Zastepstwo za');
  },
  onUnchecked: function onUnchecked() {
    changeAppMode('normal');
    $('#zastepca').text('Zastępca');
  }
});
