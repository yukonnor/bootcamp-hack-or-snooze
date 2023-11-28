"use strict";

/** TODO:
 * Add ability to hide "submit" form (maybe add a 'cancel' button to the form page)
 * Fix idendentation issue when logged out / when extra icons added (add classes for user state / page being viewed)
 *
 * Add sign up error handling
 *
 * Add 'edit story' functionality:
 *   - on "My Stories", add pencil icons
 *   - clicking replaces story list with form showing current story information
 *   - submitting form: sends update to API, updates currentUser's stories, hides form and shows story list
 *
 *  Add 'edit user' functionality:
 *   - add "account" link next to logout link
 *   - clicking replaces story list with form showing current user information
 *   - submitting form: sends update to API / error handling / success message / updates currentUser / updates form values
 */

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");
const $cancelButton = $("#cancel-btn");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navSubmit = $("#nav-submit-story");
const $navFavorites = $("#nav-favorites");
const $navMyStories = $("#nav-my-stories");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
    const components = [$allStoriesList, $loginForm, $signupForm];
    components.forEach((c) => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
    console.debug("start");

    // "Remember logged-in user" and log in, if credentials in localStorage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();

    // if we got a logged-in user
    if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn(
    "HEY STUDENT: This program sends many debug messages to" +
        " the console. If you don't see the message 'start' below this, you're not" +
        " seeing those helpful debug messages. In your browser console, click on" +
        " menu 'Default Levels' and add Verbose"
);
$(start);
