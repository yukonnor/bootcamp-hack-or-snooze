"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
    /** Make instance of Story from data object about story:
     *   - {title, author, url, username, storyId, createdAt}
     */

    constructor({ storyId, title, author, url, username, createdAt }) {
        this.storyId = storyId;
        this.title = title;
        this.author = author;
        this.url = url;
        this.username = username;
        this.createdAt = createdAt;
    }

    /** Parses hostname out of URL and returns it. */

    getHostName() {
        // UNIMPLEMENTED: complete this function!
        return "hostname.com";
    }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
    constructor(stories) {
        this.stories = stories;
    }

    /** Generate a new StoryList. It:
     *
     *  - calls the API
     *  - builds an array of Story instances
     *  - makes a single StoryList instance out of that
     *  - returns the StoryList instance.
     */

    static async getStories() {
        // Note presence of `static` keyword: this indicates that getStories is
        //  **not** an instance method. Rather, it is a method that is called on the
        //  class directly. Why doesn't it make sense for getStories to be an
        //  instance method?

        // query the /stories endpoint (no auth required)
        const response = await axios({
            url: `${BASE_URL}/stories`,
            method: "GET",
        });

        // turn plain old story objects from API into instances of Story class
        const stories = response.data.stories.map((story) => new Story(story));

        // build an instance of our own class using the new array of stories
        return new StoryList(stories);
    }

    /** Adds story data to API, makes a Story instance, adds it to story list.
     * - user - the current instance of User who will post the story
     * - obj of {title, author, url}
     *
     * Returns the new Story instance
     */

    async addStory(user, newStory) {
        // newStory is an object: {title , author, url}

        // post to the /stories endpoint to add a story (requires auth token)
        // this will give us storyID, username and created at.
        const response = await axios.post(`${BASE_URL}/stories`, {
            token: user.loginToken,
            story: { author: newStory.author, title: newStory.title, url: newStory.url },
        });

        // create a new story instance
        const newStoryInstance = new Story({
            storyId: response.data.story.storyId,
            title: response.data.story.title,
            author: response.data.story.author,
            url: response.data.story.url,
            username: response.data.story.username,
            createdAt: response.data.story.createdAt,
        });

        // add the new story to the story list
        // console.log(this.stories);
        this.stories.push(newStoryInstance);

        return newStoryInstance;
    }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
    /** Make user instance from obj of user data and a token:
     *   - {username, name, createdAt, favorites[], ownStories[]}
     *   - token
     */

    constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
        this.username = username;
        this.name = name;
        this.createdAt = createdAt;

        // instantiate Story instances for the user's favorites and ownStories
        this.favorites = favorites.map((s) => new Story(s));
        this.ownStories = ownStories.map((s) => new Story(s));

        // store the login token on the user so it's easy to find for API calls.
        this.loginToken = token;
    }

    /** Register new user in API, make User instance & return it.
     *
     * - username: a new username
     * - password: a new password
     * - name: the user's full name
     */

    static async signup(username, password, name) {
        const response = await axios({
            url: `${BASE_URL}/signup`,
            method: "POST",
            data: { user: { username, password, name } },
        });

        let { user } = response.data;

        return new User(
            {
                username: user.username,
                name: user.name,
                createdAt: user.createdAt,
                favorites: user.favorites,
                ownStories: user.stories,
            },
            response.data.token
        );
    }

    /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

    static async login(username, password) {
        const response = await axios({
            url: `${BASE_URL}/login`,
            method: "POST",
            data: { user: { username, password } },
        });

        let { user } = response.data;

        return new User(
            {
                username: user.username,
                name: user.name,
                createdAt: user.createdAt,
                favorites: user.favorites,
                ownStories: user.stories,
            },
            response.data.token
        );
    }

    /** When we already have credentials (token & username) for a user,
     *   we can log them in automatically. This function does that.
     */

    static async loginViaStoredCredentials(token, username) {
        try {
            const response = await axios({
                url: `${BASE_URL}/users/${username}`,
                method: "GET",
                params: { token },
            });

            let { user } = response.data;

            return new User(
                {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories,
                },
                token
            );
        } catch (err) {
            console.error("loginViaStoredCredentials failed", err);
            return null;
        }
    }

    async addFavorite(storyId) {
        const token = this.loginToken;
        const username = this.username;

        // Call API to add story to user's favorites
        const response = await axios
            .post(`${BASE_URL}/users/${username}/favorites/${storyId}`, {
                token,
            })
            .catch(function (error) {
                if (error.response) {
                    // Server responded with a status code that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // No response was received
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error", error.message);
                }
            });

        // Add to this user's favorites list property
        const storyToAdd = storyList.stories.find((story) => story.storyId === storyId);
        this.favorites.push(storyToAdd);
    }

    async removeFavorite(storyId) {
        const token = this.loginToken;
        const username = this.username;
        const idToRemove = storyId;

        // Call API to add story to user's favorites
        const response = await axios
            .delete(`${BASE_URL}/users/${username}/favorites/${idToRemove}`, {
                data: {
                    token,
                },
            })
            .catch(function (error) {
                if (error.response) {
                    // Server responded with a status code that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    // No response was received
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log("Error", error.message);
                }
            });

        // Remove from this user's favorites list property
        this.favorites = this.favorites.filter((story) => story.storyId !== idToRemove);
    }

    async deleteStory(storyId) {
        console.debug("deleteStory Method");

        const token = this.loginToken;
        const idToRemove = storyId;

        // Call API to delete one of user's stories
        const response = await axios.delete(`${BASE_URL}/stories/${idToRemove}`, {
            data: {
                token,
            },
        });

        console.log(response.data.message);

        // Remove from this user's ownStories property
        this.ownStories = this.ownStories.filter((story) => story.storyId !== idToRemove);
    }
}
