{
    const api = 'http://localhost:8888/Projekty/Zastepstwa/public/scrape/20160422';
    const $dropdown = $('.ui.dropdown');
    const dropdown   = document.getElementById('teachers');
    const boxes         = document.getElementById('teachers-boxes');
    const teacherName = document.getElementById('teacher-name');
    const lessons = document.getElementById('lessons');
    var storage;

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

    function changeTeachersName (name) {
        teacherName.innerHTML = name;
    }

    function update (value) {
        clearLessons();
        changeTeachersName(storage[value].teacher);
        storage[value].lessons.forEach(function (obj) {
            addLesson(obj);
        });
    }

    function download () {
        $.get(api).done(function (json) {
            storage = JSON.parse(json);
            options();
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

    download();
}
