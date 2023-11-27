"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
    console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    $allStoriesList.show();
}

/** Gets list of favorite stories from user, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
    console.debug("putFavoriteStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of the user's favortie stories and generate HTML for them
    for (let story of currentUser.favorites) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    generateFavoriteMarkup();
    $allStoriesList.show();
}

/** This function gets the data from the form, calls the .addStory method, and
 *  then put that new story on the page. */

async function addStoryFromForm(event) {
    event.preventDefault();

    const author = $("#create-author").val();
    const title = $("#create-title").val();
    const url = $("#create-url").val();

    // Add story via API
    let newStory = await storyList.addStory(currentUser, { title, author, url });

    // Add story to current user's ownStories property
    currentUser.ownStories.push(newStory);

    putStoriesOnPage();
}

$submitForm.on("submit", addStoryFromForm);

/* This function adds 'star' icons to the stories list so that user can favorite/unfavorite stories */
function generateFavoriteMarkup() {
    console.debug("generateFavoriteMarkup");

    // loop through all of our stories and generate 'star' icons for the favorites

    for (let story of $allStoriesList.children()) {
        const $story = $(story);

        // far = empty/not favorited | fas = full/favorited
        // by default, star icon is empty / story is not a favoite
        let iconType = "far";

        // if story is in user's favorites, fill star icon
        if (storyIsFavorite($story.attr("id"))) {
            iconType = "fas";
        }

        // create star icon and star span
        const starIcon = $("<i>").addClass(`fa-star ${iconType}`);
        const starSpan = $("<span>").addClass("star");

        // add click listener for the star icon:
        starIcon.on("click", toggleFavorite);

        // add star icon to star span, and prepend span to story li
        starSpan.append(starIcon);
        $story.prepend(starSpan);
    }
}

/** Return whether a story is in the user's favorites */

function storyIsFavorite(storyID) {
    let favoriteIndex = currentUser.favorites.findIndex(function (story) {
        return story.storyId === storyID;
    });

    if (favoriteIndex === -1) {
        return false;
    }

    return true;
}

/** Toggle whether a story is a user's favortie on favorite icon click */

async function toggleFavorite() {
    console.debug("toggleFavorite");
    // get story id associated with the icon
    const storyId = $(this).parent().parent().attr("id");

    // console.debug($(this));
    // console.debug($(this).parent().parent().attr("id"));

    if (storyIsFavorite(storyId)) {
        // if story is one of user's favorites:
        // remove favorite via API
        await currentUser.removeFavorite(storyId);

        // empty star icon
        $(this).addClass("far").removeClass("fas");
    } else {
        // else if story isn't one of user's favorites,
        // add favorite via API
        await currentUser.addFavorite(storyId, storyList);

        // fill star icon
        $(this).addClass("fas").removeClass("far");
    }
}

/** This function adds 'trash' icons to the stories list on the 'my stories' view so that user can delete their stories */

function generateDeleteMarkup() {
    console.debug("generateDeleteMarkup");

    // loop through all of the user's stories and generate 'trash' icons
    for (let story of $allStoriesList.children()) {
        const $story = $(story);

        // create trash icon and span
        const trashIcon = $("<i>").addClass("fa-trash-alt fas");
        const trashSpan = $("<span>").addClass("trash");

        // add click listener for the trash icon:
        trashIcon.on("click", deleteStory);

        // add trash icon to span, and prepend span to story li
        trashSpan.append(trashIcon);
        $story.prepend(trashSpan);
    }
}

/** This function runs when a 'trash' icon is clicked to call the deleteStory method*/

async function deleteStory() {
    // get story id associated with the icon
    const storyId = $(this).parent().parent().attr("id");

    console.debug("deleteStory");
    console.debug($(this));
    console.debug($(this).parent().attr("id"));

    // delete story via API & remove from user's stories list
    await currentUser.deleteStory(storyId);

    // refresh the story list so that stories are removed if user navigates to all stories.
    storyList = await StoryList.getStories();

    // refresh the stories list HTML:
    putUserStoriesOnPage();
}

function putUserStoriesOnPage() {
    console.debug("putUserStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of the user's stories and generate HTML for them
    for (let story of currentUser.ownStories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    generateDeleteMarkup();
    $allStoriesList.show();
}
