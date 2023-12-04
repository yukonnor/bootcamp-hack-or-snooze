"use strict";

/******************************************************************************
 * This file handles navbar clicks and updating navbar based on user state.
 */

/** Show main list of all stories when click site name */

async function navAllStories() {
    console.debug("navAllStories");
    hidePageComponents();

    // refetch stories from API to get newly posted stories since session started
    await getAndShowStoriesOnStart();

    console.log("Add Favorite Icons:");
    addFavoriteIcons($allStoriesList);
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
    hidePageComponents();
    console.debug("showSubmitForm");
    $submitForm.show();
}

$navSubmit.on("click", showSubmitStoryForm);

/** When a users click the Favorites nav link, the story list container should only show favortied stories */

function navFavoritesClick(evt) {
    hidePageComponents();
    console.debug("navFavoritesClick", evt);
    $favoritStoriesList.show();
    putFavoriteStoriesOnPage();
}

$navFavorites.on("click", navFavoritesClick);

/** When a users click the My Stories nav link, the story list container should only show their stories */

function navMyStoriesClick(evt) {
    hidePageComponents();
    console.debug("navMyStoriesClick", evt);
    $myStoriesList.show();
    putUserStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);
