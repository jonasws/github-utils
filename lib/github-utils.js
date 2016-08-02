'use babel';




import GitHubApi from 'github';
import Shell from 'shell';

const github = new GitHubApi({
  version: '3.0.0',
  host: atom.config.get('github-utils.githubEnterpriseEndpoint') || 'api.github.com',
  pathPrefix: atom.config.get('github-utils.githubEnterprisePathPrefix') || null
});

export const getGitHubCredentials = async () => {
  let {githubUsername, githubAuthorizationToken} = atom.config.get('github-utils');

  if (githubUsername === '') {
    githubUsername = process.env.GITHUB_USERNAME;
    githubAuthorizationToken = process.env.GITHUB_ACCESS_TOKEN;
  }

  if (typeof githubUsername === 'undefined') {
    atom.notifications.addError('In order to view pull requests, you must configure your GitHub username (and optionally an authorization token)');
    return null;
  }

  return [githubUsername, githubAuthorizationToken];
};

const authenticate = async () => {
  const creds = await getGitHubCredentials();
  console.log(creds);

  if (creds === null) {
    return false;
  }
  const [githubUsername, githubAuthorizationToken] = creds;

  if (!githubAuthorizationToken) {
    return false;
  }

  github.authenticate({
    type: 'basic',
    username: githubUsername,
    password: githubAuthorizationToken
  });

  return true;
};


const getRepositories = () => {
  return atom.project.getRepositories().map(r => r.async);
};

export const parseRepositoryInfoFromURL = url => {
  const matched = url.match(/github\.com[:\/](.*?)(\.git)?$/);
  return matched ? matched[1].split('/') : null;
}

const concatArrayAsync = async (array, item) => {
  return (await array).concat(await item);
};

const getPullRequestURLs = async (user, repo) => {
  // This function returns a prommise resolving to an array of pull requests found
  const remotes = [await repo.getConfigValue('remote.origin.url')];
  const upstreamRemote = await repo.getConfigValue('remote.upstream.url');
  if (upstreamRemote) {
    remotes.push(upstreamRemote);
  }

  return remotes.map(async (remoteUrl) => {
    const repoInfo = parseRepositoryInfoFromURL(remoteUrl);
    if (!repoInfo) {
      return;
    }

    const [repoOwner, repoName] = repoInfo;
    if (!(repoOwner && repoName)) {
      return;
    }

    const branch = await repo.getShortHead();

    const pullRequests = new Promise((resolve, reject) => {
      github.pullRequests.getAll({
        user: repoOwner,
        repo: repoName,
        head: `${user}:${branch}`,
        state: atom.config.get('github-utils.viewClosedPullRequests') ? 'all' : 'open'
      }, (err, pullRequests) => {
        if (err) {
          return reject(err);
        }
        return resolve(pullRequests);
      });
    });

    return (await pullRequests).map(pr => pr.html_url);

  }).reduce(concatArrayAsync, []);
};


const viewPullRequests = async () => {
  await authenticate();

  const [githubUsername, ] = await getGitHubCredentials();
  const pullRequestURLs = await getRepositories().map(getPullRequestURLs.bind(undefined, githubUsername)).reduce(concatArrayAsync, []);

  if (pullRequestURLs.length > 0) {
    pullRequestURLs.forEach(Shell.openExternal);
  } else {
    atom.notifications.addInfo('No pull requests were found for this branch.');
  }
};

export const activate = () => {
    atom.commands.add('atom-workspace', 'github-utils:view-pull-request', viewPullRequests);
};

export const config = {
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
    description: 'Optional. Needed to view pull requests made within private repositories',
    order: 1
  },
  githubEnterpriseEndpoint: {
    title: 'GitHub Enterprise API instance',
    type: 'string',
    description: 'Enter address of your Enterprise instance to use the package with repositories there',
    default: '',
    order: 3
  },
  githubEnterprisePathPrefix: {
    title: 'GitHub Enterprise API path prefix',
    type: 'string',
    description: 'Enter API prefix (if using GitHub Enterprise)',
    default: '',
    order: 4
  },
  viewClosedPullRequests: {
    title: 'View closed pull requests',
    description: 'Check to also view closed pull requests',
    type: 'boolean',
    default: false,
    order: 2
  }
};
