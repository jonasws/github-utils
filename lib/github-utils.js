'use babel';

import GitHubApi from 'github';
import Shell from 'shell';

let github = new GitHubApi({
  version: '3.0.0',
  host: 'api.github.com'
});

function getGitHubCredentials() {
  let {githubUsername, githubAuthorizationToken} = atom.config.get('github-utils');

  if (githubUsername === '' || githubAuthorizationToken === '') {
    githubUsername = process.env.GITHUB_USERNAME;
    githubAuthorizationToken = process.env.GITHUB_ACCESS_TOKEN;
  }

  if (typeof githubAuthorizationToken === 'undefined' || typeof githubAuthorizationToken === 'undefined') {
    atom.notifications.addError('In order to view pull requests, you must configure your GitHub API credentials!');
    return null;
  }

  return [githubUsername, githubAuthorizationToken];
}

function authenticate () {
  let creds = getGitHubCredentials();

  if (creds === null) {
    return false;
  }
  let [githubUsername, githubAuthorizationToken] = creds;

  github.authenticate({
    type: 'basic',
    username: githubUsername,
    password: githubAuthorizationToken
  });

  return true;
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
  let authenticated = authenticate();

  if (!authenticated) {
    return;
  }

  getRepositories().then((repos) => {
    repos.forEach((repo) => {
      let remotes = [repo.getConfigValue('remote.origin.url')];
      let upstreamRemote = repo.getConfigValue('remote.upstream.url');
      if (upstreamRemote) {
        remotes.push(upstreamRemote);
      }
      remotes.forEach((remoteUrl) => {
        let repoInfo = parseRepositoryInfoFromURL(remoteUrl);
        if (!repoInfo) {
          return;
        }

        let [repoOwner, repoName] = repoInfo;
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
          getPullRequestURLs(pullRequests, branch).forEach(Shell.openExternal);
        });
      })

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
  getPullRequestURLs,
  getGitHubCredentials
};
