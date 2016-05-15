class Notify {
  constructor() {
    if (Notification) {
      document.addEventListener('DOMContentLoaded', v => {
        if (Notification.permission !== 'granted')
          Notification.requestPermission()
      })
    } else {
      console.info('W3C notifications API isn\'t available on this computer.')
    }
  }

  access () {
    return ("Notification" in window) && Notification.permission === 'granted'
  }

  notify (content) {
    if (!this.access()) {
      console.warn('Permission to notify API not granted!')
      return
    }
    var notify = new Notification(
      content.title,
      {
        icon: content.icon,
        body: content.body
      })
    notify.onclick = v => {
      window.open(content.url)
    }
  }
}

{

const notification = {
  title: 'Zastępstwa',
  icon: 'http://zastepstwa.esy.es/website/img/notify_img.png',
  body: 'Zastępstwa na jutro już są!',
  url: 'http://zastepstwa.esy.es/website/'
}

var firstRun = true
var notified = false
var link = generateApiUrl(generateDateHash('tomorrow'))

n = new Notify()

var watcher = setInterval(function () {
  $.get(link).done(function (json) {
    if (catchException(json) && firstRun === false) {
      n.notify(notification)
      clearInterval(watcher)
    }
    firstRun = false
  });
}, 1000 * 60 * 5)

}
