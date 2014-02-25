
var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },
    onDeviceReady: function() {

        app.tick = new Media('/android_asset/www/click.wav');
        app.alarm = new Media('/android_asset/www/alarm.wav');

        app.timerInterval = null;

        app.start = document.getElementById('startButton');
        app.start.addEventListener('click', app.onStartClick, false);

        app.reset = document.getElementById('resetButton');
        app.reset.addEventListener('click', app.timerEnd, false);

        app.minutes = document.getElementById('minutes');
        app.minutes.value = window.localStorage.getItem('minutes') || 0;
        app.minutes.addEventListener('change', app.saveMinutes, false);

        app.seconds = document.getElementById('seconds');
        app.seconds.value = window.localStorage.getItem('seconds') || 30;
        app.seconds.addEventListener('change', app.saveSeconds, false);

        app.canvas = document.getElementById('canvas');
        app.ctx = app.canvas.getContext('2d');

        window.addEventListener('resize', app.onResize);
        window.addEventListener('orientationchange', app.onResize);

        document.addEventListener('menubutton', app.showMenu);

        app.overlay = document.getElementById('overlay');
        app.menu = document.getElementById('menu');
        app.beeps = document.getElementById('beeps');
        app.color = document.getElementById('color');

        app.showPrefs = document.getElementById('update-prefs');
        app.showPrefs.addEventListener('click', app.updatePrefs, false);

        app.onResize();

        app.centerX = app.canvas.width / 2;
        app.centerY = app.canvas.height / 2;

        var min = Math.min(app.centerX, app.centerY);
        // Define a radius that's a bit shorter than the smaller side.
        app.radius = min - Math.max(min * 0.1, 15);

        app.makeCircle();
    },
    saveMinutes: function() {
        window.localStorage.setItem('minutes', app.minutes.value);
    },
    saveSeconds: function() {
        window.localStorage.setItem('seconds', app.seconds.value);
    },
    showMenu: function() {
        app.overlay.style.display = 'block';
        app.menu.style.display = 'block';

        var beeps = window.localStorage.getItem('beeps');
        app.beeps.value = (beeps === 0 || beeps === '0') ? 0 : 1;

        var color = window.localStorage.getItem('color');
        app.color.value = color || 'green';
    },
    updatePrefs: function() {
        app.overlay.style.display = 'none';
        app.menu.style.display = 'none';
        window.localStorage.setItem('beeps', app.beeps.value);
        window.localStorage.setItem('color', app.color.value);
    },
    onResize: function() {
        app.canvas.width = app.canvas.clientWidth;
        app.canvas.height = app.canvas.clientHeight;
        app.makeCircle();
    },
    onStartClick: function() {
        if (app.timerInterval) {
            window.clearInterval(app.timerInterval);
            app.timerInterval = null;
            app.start.value = 'Start';
        } else {
            app.start.value = 'Pause';
            var minutes = parseInt(app.minutes.value, 10);
            var seconds = parseInt(app.seconds.value, 10);
            app.totalSeconds = app.totalSeconds || (minutes * 60) + seconds;
            app.secondsRemaining = app.secondsRemaining || app.totalSeconds;
            app.timerInterval = window.setInterval(app.updateTimer, 1000);
        }
    },
    makeCircle: function() {
        app.ctx.beginPath();
        app.ctx.arc(app.centerX, app.centerY, app.radius, 0, 2*Math.PI, false);
        app.ctx.closePath();
        app.ctx.fillStyle = 'white';
        app.ctx.fill();
    },
    updateTimer: function() {
        app.secondsRemaining--;
        app.updateFields();
        app.makeCircle();

        var radians = (app.secondsRemaining / app.totalSeconds) * 2 * Math.PI;
        app.ctx.beginPath();
        app.ctx.arc(app.centerX, app.centerY, app.radius, Math.PI*3/2, (Math.PI*3/2) - radians, false);
        app.ctx.lineTo(app.centerX, app.centerY);
        app.ctx.closePath();
        app.ctx.fillStyle = window.localStorage.getItem('color') || 'green';
        app.ctx.fill();

        if (window.localStorage.getItem('beeps')) {
            app.tick.play();
        }

        if (parseInt(app.secondsRemaining, 10) < 1) {
            app.timerEnd();
            app.endAlarm();
        }
    },
    endAlarm: function() {
        app.alarm.play();
        app.endAlarmCounter = 0;
        app.endAlarmInterval = window.setInterval(app.endAlarmCircle, 20);
    },
    endAlarmCircle: function() {
        if (app.endAlarmCounter > 120) {
            window.clearInterval(app.endAlarmInterval);
        } else {
            app.endAlarmCounter++;
            app.makeCircle();
            app.ctx.beginPath();
            var radius = (Math.sin(app.endAlarmCounter/4)*(app.radius/2)) + (app.radius/2);
            app.ctx.arc(app.centerX, app.centerY, radius, 0, 2*Math.PI, false);
            app.ctx.closePath();
            app.ctx.fillStyle = 'red';
            app.ctx.fill();
        }
    },
    updateFields: function() {
        var minutes, seconds;
        if (app.secondsRemaining > 60) {
            minutes = Math.floor(app.secondsRemaining / 60);
            seconds = app.secondsRemaining - (minutes * 60);
        } else {
            minutes = 0;
            seconds = app.secondsRemaining;
        }
        app.minutes.value = parseInt(minutes, 10);
        app.seconds.value = parseInt(seconds, 10);
    },
    timerEnd: function() {
        window.clearInterval(app.timerInterval);
        app.timerInterval = null;
        app.secondsRemaining = app.totalSeconds;
        app.updateFields();
        app.secondsRemaining = null;
        app.totalSeconds = null;
        app.makeCircle();
        app.start.value = 'Start';
    }
};
