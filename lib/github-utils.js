'use babel';

import GitHubApi from 'github';
import Shell from 'shell';

let github = new GitHubApi({
  version: '3.0.0',
  host: 'api.github.com'
});

function authenticate () {
  let {githubUsername, githubAuthorizationToken} = atom.config.get('github-utils');

  if (githubUsername === '' || githubAuthorizationToken === '') {
    githubUsername = process.env.GITHUB_USERNAME;
    githubAuthorizationToken = process.env.GITHUB_ACCESS_TOKEN;
  }

  github.authenticate({
    type: 'basic',
    username: githubUsername,
    password: githubAuthorizationToken
  });
}

function getRepositories () {
  return Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project)));
}

function parseRepositoryInfoFromURL (url) {
  let matched = url.match(/github\.com[:\/](.*?)(\.git)?$/);
  return matched ? matched[1].split('/') : null;
}

function getPullRequestURLs (pullRequests, branch) {
  return pullRequests.filter(pr => pr.head.ref === branch).map(pr => pr.html_url);
}

function viewPullRequests () {
  authenticate();
  getRepositories().then((repos) => {
    repos.forEach((repo) => {
      let [repoOwner, repoName] = parseRepositoryInfoFromURL(repo.getOriginURL());
      if (!(repoOwner && repoName)) {
        return;
      }

      let branch = repo.getShortHead();
      github.pullRequests.getAll({
        user: repoOwner,
        repo: repoName,
        state: atom.config.get('github-utils.viewClosedPullRequests') ? 'all' : 'open'
      }, (err, pullRequests) => {
        if (err) {
          return console.error(err);
        }
        getPullRequestURLs(pullRequests, branch).filter(Boolean).forEach(Shell.openExternal);
      });
    });
  });
}

export default {
  config: {
    githubUsername: {
      title: 'GitHub username',
      type: 'string',
      default: '',
      order: 0
    },
    githubAuthorizationToken: {
      title: 'GitHub authorization token',
      type: 'string',
      default: '',
      order: 1
    },
    viewClosedPullRequests: {
      title: 'View closed pull requests',
      description: 'Check to also view closed pull requests',
      type: 'boolean',
      default: false,
      order: 3
    }
  },

  activate() {
    atom.commands.add('atom-workspace', 'github-utils:view-pull-request', viewPullRequests);
  },
  parseRepositoryInfoFromURL,
  getPullRequestURLs
};
