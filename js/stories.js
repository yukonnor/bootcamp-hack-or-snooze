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
    console.debug("generateStoryMarkup");

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

    // clear out the stories container so that a fresh set of stories can be added.
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    // to vary styling for logged in vs out users, set a 'logged-out' class on the story list
    if (currentUser) {
        $allStoriesList.removeClass("logged-out");
        // addFavoriteIcons($allStoriesList);
    } else {
        $allStoriesList.addClass("logged-out");
    }

    $allStoriesList.show();
}

/** Gets list of favorite stories from user, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
    console.debug("putFavoriteStoriesOnPage");

    $favoritStoriesList.empty();

    // loop through all of the user's favortie stories and generate HTML for them
    for (let story of currentUser.favorites) {
        const $story = generateStoryMarkup(story);
        $favoritStoriesList.append($story);
    }

    addFavoriteIcons($favoritStoriesList);
}

/** This function gets the data from the submit form, calls the .addStory method, and
 *  then put that new story on the page. */

async function addStory(event) {
    event.preventDefault();

    const author = $("#create-author").val();
    const title = $("#create-title").val();
    const url = $("#create-url").val();

    // Add story via API
    let newStory = await storyList.addStory(currentUser, { title, author, url });

    // Add story to current user's ownStories property
    currentUser.ownStories.push(newStory);

    // go back to main page view
    $submitForm.hide();
    navAllStories();
}

$submitForm.on("submit", addStory);

/* Add 'star' icons to a list of stories so that user can favorite/unfavorite stories */

function addFavoriteIcons(storyList) {
    console.debug("addFavoriteIcons");

    // loop through all of our stories and generate 'star' icons for the favorites
    for (let story of storyList.children()) {
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

    // if story is one of user's favorites:
    if (storyIsFavorite(storyId)) {
        // remove favorite via API and client
        await currentUser.removeFavorite(storyId);

        // empty star icon
        $(this).addClass("far").removeClass("fas");
    } else {
        // else if story isn't one of user's favorites,
        // add favorite via API and client
        await currentUser.addFavorite(storyId, storyList);

        // fill star icon
        $(this).addClass("fas").removeClass("far");
    }
}

/** This function adds 'trash' icons to the stories list on the 'my stories' view so that user can delete their stories */

function addTrashIcons() {
    console.debug("addTrashIcons");

    // loop through all of the user's stories and generate 'trash' icons
    for (let story of $myStoriesList.children()) {
        const $story = $(story);

        // create trash icon and span
        const trashIcon = $("<i>").addClass("fas fa-trash-alt");
        const trashSpan = $("<span>").addClass("trash");

        // add click listener for the trash icon:
        trashIcon.on("click", deleteStory);

        // add trash icon to span, and prepend span to story li
        trashSpan.append(trashIcon);
        $story.prepend(trashSpan);
    }
}

/** This function runs when a 'trash' icon is clicked. It calls the deleteStory method*/

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

/** This function adds 'pencil' icons to the stories list on the 'my stories' view so that user can edit their stories */

function addPencilIcons() {
    console.debug("addPencilIcons");

    // loop through all of the user's stories and generate 'trash' icons
    for (let story of $myStoriesList.children()) {
        const $story = $(story);

        // create pencil icon and span
        const pencilIcon = $("<i>").addClass("fas fa-pencil");
        const pencilSpan = $("<span>").addClass("pencil");

        // add click listener for the pencil icon:
        pencilIcon.on("click", showEditStoryForm);

        // add pencil icon to span, and prepend span to story li
        pencilSpan.append(pencilIcon);
        $story.prepend(pencilSpan);
    }
}

/** This function runs when a 'pencil' icon is clicked to show and populate the edit story form */
// Q: Best file for this function?

function showEditStoryForm() {
    console.debug("showEditStoryForm");

    // get story id associated with the icon
    const idToEdit = $(this).parent().parent().attr("id");

    // get the story object given the id
    const storyToEdit = currentUser.ownStories.find((story) => story.storyId === idToEdit);
    console.log(storyToEdit);

    // get story's author, title and url
    const author = storyToEdit.author;
    const title = storyToEdit.title;
    const url = storyToEdit.url;

    // show the edit form and asssign populate with the current values from the story
    $editForm.show();

    $("#edit-author").val(author);
    $("#edit-title").val(title);
    $("#edit-url").val(url);

    // add story id to edit form
    $editForm.attr("id", idToEdit);
}

/** Run editStory when the edit story form is submitted*/

async function editStory(event) {
    event.preventDefault();

    const author = $("#edit-author").val();
    const title = $("#edit-title").val();
    const url = $("#edit-url").val();
    const storyId = $(this).attr("id");

    // Edit story via API
    let newStory = await currentUser.editStory(storyId, { title, author, url });

    // Add story to current user's ownStories property
    currentUser.ownStories.push(newStory);

    $editForm.hide();
    putUserStoriesOnPage();
}

$editForm.on("submit", editStory);

/** Put the User's stories in the $myStoriesList OL */

function putUserStoriesOnPage() {
    console.debug("putUserStoriesOnPage");

    $myStoriesList.empty();

    // loop through all of the user's stories and generate HTML for them
    for (let story of currentUser.ownStories) {
        console.log(story);
        const $story = generateStoryMarkup(story);
        $myStoriesList.append($story);
    }

    addTrashIcons();
    addPencilIcons();
}
