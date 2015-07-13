'use babel';

import GitHubApi from 'github';
import Shell from 'shell';

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

let github = new GitHubApi({
  version: '3.0.0',
  host: 'api.github.com'
});

function authenticate () {
  github.authenticate({
    type: 'basic',
    username: GITHUB_USERNAME,
    password: GITHUB_ACCESS_TOKEN
  });
}

function getRepositories () {
  return Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project)));
}

function parseRepositoryInfoFromURL (url) {
  let matched = url.match(/github\.com[:\/](.*?)(\.git)?$/)
  return matched ? matched[1].split('/') : null;
}

function getPullRequestURLs (pullRequests, branch) {
  return pullRequests.filter((pr) => pr.head.ref === branch).map((pr) => pr.html_url);
}

function viewPullRequests () {
  authenticate();
  getRepositories().then((repos) => {
    repos.forEach((repo) => {
      let [repoOwner, repoName] = parseRepositoryInfoFromURL(repo.getOriginURL());
      if (!(repoOwner && repoName)) {
        return;
      }

      let branch = repo.getShortHead()
      github.pullRequests.getAll({
        user: repoOwner,
        repo: repoName
      }, (err, pullRequests) => {
        if (err) {
          return console.error(err);
        }
        getPullRequestURLs(pullRequests, branch).filter((url) => url).forEach(Shell.openExternal);
      });
    });
  });
}

export default {
  activate() {
    atom.commands.add('atom-workspace', 'github-utils:view-pull-request', viewPullRequests);
  },
  parseRepositoryInfoFromURL,
  getPullRequestURLs
};
