/***
 Created by picklesrus, originally for scratch-www. This should be kept in sync with the www version.

 This differs from jquery.timeago in that it returns "in X minutes/hours" instead of "until X minutes/hours"
 and it has special rounding rules for use in mute messaging.

 Given a timestamp in the future, calculate the largest, closest unit to show.
 On the high end we stop at hours. e.g. 15 days is still counted in hours not days or weeks.
 On the low end we stop at minutes.
 This rounds duration to the nearest integer. e.g. 5.7 minutes => will return 6 as duration.
 @param {number} timeStamp A future time stamp in ms.
 @returns {object} containing the unit (min, hours) and how many. e.g. {unit: minutes, duration: 3}
 */
function getTimeUnitAndDuration(timeStamp) {
    var diff = timeStamp - Date.now();
    var oneHourInMs = 1000 * 60 * 60;
    var oneMinuteInMs = 1000 * 60;

    var unit = 'minute';
    var duration = diff / oneMinuteInMs;
    // We show minutes up to 2 hours, then switch to hours.
    if (diff >= 2 * oneHourInMs) {
        unit = 'hour';
        duration = diff / oneHourInMs;
    }
    // Round to nearest hour or minute, but always have at least 1
    // so we don't show something like "0 minutes". Hours isn't
    // affected by the math.max because we choose minutes up to 2 hours.
    duration = Math.max(1, Math.round(duration));
    return {
        unit: unit,
        duration: duration
    };
};

/**
* Given a future timestamp and a langauge, constructs a phrase to describe that time relative to now.
* e.g. in 2 days, in 3 minutes, en 2 horas.
* The largest time unit is days, the smallest is minutes.
* @param {number} futureTime a timestamp in ms to build a phrase for.
* @param {string} lang Langauge to build the phrase in.
* @returns {string} A phrase representing the relative time in the future. e.g. 3 days 5 hours.
*/
function formatRelativeTime(futureTime, lang) {
    var languages = window.navigator.languages;

    if (lang) {
        languages = [lang].concat(languages);
    }

    if (typeof Intl.RelativeTimeFormat != "undefined") {
        var formatter = new Intl.RelativeTimeFormat(languages, {
            localeMatcher: 'best fit',
            numeric: 'always',
            style: 'long'
        });
        var timeInfo = getTimeUnitAndDuration(futureTime);
        return formatter.format(timeInfo.duration, timeInfo.unit);
    }
    if (typeof jQuery != "undefined" && typeof jQuery.timeago != "undefined" ) {
        jQuery.timeago.settings.allowFuture = true;
        return jQuery.timeago(futureTime);
    }
    // jQuery.timeago should always be there, but just in case it isn't return an empty
    // string to avoid errors.
    return '';
}

// If jQuery is included in the page, adds a jQuery plugin to handle it
if ( typeof jQuery != "undefined" ) {
  jQuery.fn.formatRelativeTime = function(futureTime, lang){
    return formatRelativeTime(futureTime, lang)
  };
}
