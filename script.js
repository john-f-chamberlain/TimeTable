const $day_names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const range = (start, stop) =>
    Array.from({length: stop - start + 1}, (_, i) => start + i);

function centerElementWithinParent(element, parent) {
    const elementWidth = element.offsetWidth;
    const parentRect = parent.getBoundingClientRect();
    const halfElementWidth = elementWidth / 2;

    let left = window.innerWidth / 2 - halfElementWidth;

    // Ensure the element does not overflow the parent's bounds
    const parentLeft = parentRect.left;
    const parentRight = parentRect.right;

    if (left < parentLeft) {
        left = parentLeft;
    } else if (left + elementWidth > parentRight) {
        left = parentRight - elementWidth;
    }

    element.style.left = `${left}px`;
}

function alignElementLeft(element, parent) {
    const parentRect = parent.getBoundingClientRect();
    element.style.left = `${parentRect.left}px`;
}

function alignElementRight(element, parent) {
    const parentRect = parent.getBoundingClientRect();
    element.style.left = `${parentRect.right - element.offsetWidth}px`;
}

window.addEventListener("load", function () {
    function updatePositions() {
        //centerElementWithinParent(thursdayHeader, thursdayParent);

        document.querySelectorAll(".day").forEach((header) => {
            const parent = header.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const containerRect = document
                .getElementById("timetable-container")
                .getBoundingClientRect();
            const viewportCenter = containerRect.left + containerRect.width / 2;

            if (
                parentRect.left <= viewportCenter &&
                parentRect.right >= viewportCenter
            ) {
                centerElementWithinParent(header, parent);
            } else if (parentRect.right < viewportCenter) {
                alignElementRight(header, parent);
            } else {
                alignElementLeft(header, parent);
            }
        });
    }

    updatePositions();

    window.addEventListener("resize", updatePositions);
    document
        .getElementById("timetable-container")
        .addEventListener("scroll", updatePositions);
});

$(function () {
    const times = $(".headers.times");
    const days = $(".headers.days");
    const $start_time = times.data("start");
    const $end_time = times.data("end");
    const $px_day = ($end_time - $start_time + 1) * 240;
    const $days = days.data("count");
    const $start_day = days.data("start");
    let event_days = [];

    let hourCount = ($end_time - $start_time + 1) * $days;
    $("#timetable").width(hourCount * 240);
    $(".headers").width(hourCount * 240);

    $.each(range($start_day, $start_day + $days - 1), function (i, $d) {
        let $dayName = $day_names[$d % $day_names.length];
        let $div = $("<div></div>");
        let $newDay = $("<div></div>").addClass("day").text($dayName);
        $div.append($newDay);
        $(".headers.days").append($div);
        let $hourDiv = [];
        $.each(range($start_time, $end_time), function (i, $h) {
            let $display_hour = ($h % 12 || 12).toString().padStart(2, '0');
            let $ampm = $h >= 12 ? "PM" : "AM";
            $hourDiv.push($("<div></div>").text($display_hour + ":00 " + $ampm + " EDT"));
        });
        $(".headers.times").append($hourDiv);
        event_days.push($dayName);
    });

    // Track event positions to detect overlaps
    let eventPositions = {};

    // Events
    $("#timetable > div:not(#current-time-line)").each(function () {
        let $event = $(this);
        let stage = $event.data("stage");
        let day = $event.data("day");
        let start = $event.data("start");
        let end = $event.data("end");

        let dayId = event_days.indexOf(day);
        let startHour = parseInt(start.split(":")[0]) - $start_time;
        let startMinute = parseInt(start.split(":")[1]);
        let endHour = parseInt(end.split(":")[0]) - $start_time;
        let endMinute = parseInt(end.split(":")[1]);

        let startDecimal = startHour + startMinute / 60;
        let endDecimal = endHour + endMinute / 60;

        let blockWidth = (endDecimal - startDecimal) * 240;
        let startPx = dayId * $px_day + startDecimal * 240;

        let blockHeight = 100;
        let blockTop = (stage - 1) * 100;

        if (stage === "all") {
            blockTop = 0;
            blockHeight = ($("#stages > div").length - 1) * 100;
        }

        let eventKey = `${day}-${stage}`;
        if (!eventPositions[eventKey]) {
            eventPositions[eventKey] = [];
        }

        // Check for overlaps and adjust position
        let overlap = eventPositions[eventKey].some(pos => {
            return (startPx < pos.endPx && startPx + blockWidth > pos.startPx);
        });

        if (overlap) {
            blockHeight = 50;
            blockTop += 50 * eventPositions[eventKey].length;
            // Adjust the height of all previous overlapping events
            eventPositions[eventKey].forEach(pos => {
                pos.element.css("height", "50px");
            });
        }

        eventPositions[eventKey].push({startPx, endPx: startPx + blockWidth, top: blockTop, element: $event});

        $event
            .css("top", blockTop + "px")
            .css("left", startPx + "px")
            .css("width", blockWidth + "px")
            .css("height", blockHeight + "px");
    });

    // var timetableContainer = document.getElementById('timetable-container');
    // timetableContainer.scrollLeft = 5520;

    function updateCurrentTime() {
        const d = new Date();

        let day = $day_names[d.getDay()];
        let hour = d.getHours() - $start_time;
        let minute = d.getMinutes();
        let second = d.getSeconds();

        let dayOffset = event_days.indexOf(day);


        if (hour < $start_time || hour > $end_time) {
            if (hour < $start_time) {
                dayOffset--;
            }
            hour = $end_time + 1;
            minute = 0;
            second = 0;
        }
        let leftPx = (dayOffset * $px_day) + ((hour + (minute / 60) + (second / 3600)) * 240)

        $("#current-time-line").css("left", leftPx + "px");

        $("#timetable-container")
    }

    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});



