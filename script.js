document.addEventListener("DOMContentLoaded", function () {
    
    const token = window.GITHUB_TOKEN;
    
    if (!token) {
        console.error('GitHub token is not defined. Make sure to set the GITHUB_TOKEN environment variable.');
        return; 
    }

    const username = 'someshkar';
    const apiUrl = `https://api.github.com/users/${username}`;

    fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(response => response.json())
    .then(user => {
        const avatarElement = document.getElementById('avatar');
        const nameElement = document.getElementById('name');
        const bioElement = document.getElementById('bio');
        const locationElement = document.getElementById('location');

        avatarElement.src = user.avatar_url;
        nameElement.textContent = user.name || user.login;
        bioElement.textContent = user.bio || 'No bio available';
        locationElement.textContent = user.location || 'Location not specified';
    })
    .catch(error => console.error('Error fetching user information:', error));

    const repositoriesList = document.getElementById('repositories-list');
    const repositoriesUrl = `https://api.github.com/users/${username}/repos`;
    

    // Function to fetch all pages of repositories
    async function fetchAllRepos(username, token) {
        let page = 1;
        let allRepos = [];

        try {
            while (true) {
                const response = await fetch(`${repositoriesUrl}?page=${page}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.length === 0) {
                    // No more items, break the loop
                    break;
                }

                allRepos = allRepos.concat(data);
                page++;
            }

            return allRepos;
        } catch (error) {
            console.error("Failed to fetch all repos:", error.message);
        }
    }

    // Function to fetch repository languages
    async function fetchRepoLanguages(username, repoName, token) {
        const languagesList = [];

        const repoLanguagesUrl = `https://api.github.com/repos/${username}/${repoName}/languages`;
        const languagesResponse = await fetch(repoLanguagesUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const languagesData = await languagesResponse.json();

        Object.keys(languagesData).forEach(language => {
            const languageItem = document.createElement('span');
            languageItem.textContent = language;
            languagesList.push(languageItem);
        });

        return languagesList;
    }




        fetchAllRepos(username, token)
        .then(repositories => {
            repositories.forEach(repo => {
                const listItem = document.createElement('li');
                listItem.className = "repositories_list_items";
                const nestedList = document.createElement('ul');

                const repoNameItem = document.createElement('li');
                repoNameItem.className = "repo_name";
                repoNameItem.textContent = ` ${repo.name}`;
                nestedList.appendChild(repoNameItem);

                const repoDescriptionItem = document.createElement('li');
                repoDescriptionItem.className = "repo_description";
                repoDescriptionItem.textContent = `${repo.description || 'No description available'}`;
                nestedList.appendChild(repoDescriptionItem);

                const repoLanguagesItem = document.createElement('li');

                // Call a separate function to fetch and create language list
                fetchRepoLanguages(username, repo.name, token)
                    .then(languagesList => {
                        repoLanguagesItem.className = "language_list";

                        languagesList.forEach(languageItem => {
                            languageItem.className = "language_list_item";
                            repoLanguagesItem.appendChild(languageItem);
                        });
                    })
                    .catch(error => console.error(`Error fetching languages for ${repo.name}:`, error));

                nestedList.appendChild(repoLanguagesItem);

                listItem.appendChild(nestedList);
                repositoriesList.appendChild(listItem);
            });
        });
});