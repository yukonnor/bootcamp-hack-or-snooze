"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
    console.debug("navAllStories", evt);
    hidePageComponents();
    putStoriesOnPage();
    generateFavoriteMarkup();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
    console.debug("navLoginClick", evt);
    hidePageComponents();
    $loginForm.show();
    $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
    console.debug("updateNavOnLogin");
    $(".main-nav-links").show();
    $navLogin.hide();
    $navLogOut.show();
    $navUserProfile.text(`${currentUser.username}`).show();
}

/** When user clicks the Submit nav link, the submit story form should appear */

function showSubmitStoryForm() {
    // TODO: hide submit form if already showing?
    console.debug("showSubmitForm");
    $submitForm.show();
}

$navSubmit.on("click", showSubmitStoryForm);

/** When user clicks the "Cancel" button on the story form, the form should disappear */
function hideSubmitStoryForm() {
    // TODO: hide submit form if already showing?
    console.debug("hideSubmitStoryForm");
    $submitForm.hide();
}

$cancelButton.on("click", hideSubmitStoryForm);

/** When a users click the Favorites nav link, the story list container should only show favortied stories */

function navFavoritesClick(evt) {
    console.debug("navFavoritesClick", evt);
    putFavoriteStoriesOnPage();
}

$navFavorites.on("click", navFavoritesClick);

/** When a users click the My Stories nav link, the story list container should only show their stories */

function navMyStoriesClick(evt) {
    console.debug("navMyStoriesClick", evt);
    putUserStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);
