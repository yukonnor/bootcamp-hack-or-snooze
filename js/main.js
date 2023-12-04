"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritStoriesList = $("#favorite-stories-list");
const $myStoriesList = $("#my-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");
const $editForm = $("#edit-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navSubmit = $("#nav-submit-story");
const $navFavorites = $("#nav-favorites");
const $navMyStories = $("#nav-my-stories");

/** Helper function to hide all content sections on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
    const components = [
        $allStoriesList,
        $favoritStoriesList,
        $myStoriesList,
        $loginForm,
        $signupForm,
        $submitForm,
        $editForm,
    ];
    components.forEach((c) => c.hide());
}

/** Start function to kick off the app on page load. */

async function start() {
    console.debug("start");

    // "Remember logged-in user" and log in, if credentials in localStorage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();

    // if we got a logged-in user
    if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app:

console.warn(
    "HEY STUDENT: This program sends many debug messages to" +
        " the console. If you don't see the message 'start' below this, you're not" +
        " seeing those helpful debug messages. In your browser console, click on" +
        " menu 'Default Levels' and add Verbose"
);
$(start);
