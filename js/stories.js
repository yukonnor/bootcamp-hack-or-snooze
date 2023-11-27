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

    let newStory = await storyList.addStory(currentUser, { title, author, url });

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

        $story.prepend(`<span class="star"><i class="fa-star ${iconType}"></i></span>`);
    }

    // add click listener for the favorite icons:
    $allStoriesList.on("click", ".star", toggleFavorite);
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
    // get story id associated with the icon
    const storyId = $(this).parent().attr("id");

    if (storyIsFavorite(storyId)) {
        // if story is one of user's favorites, remove favorite and empty star icon
        await currentUser.removeFavorite(storyId);

        console.log($(this).children("i"));
    } else {
        // else if story isn't one of user's favorites, add favorite and fill star icon
        await currentUser.addFavorite(storyId);
    }
}
