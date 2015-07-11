GitHubApi = require 'github'
Shell = require 'shell'

GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN
GITHUB_USERNAME = process.env.GITHUB_USERNAME


github = new GitHubApi
  version: '3.0.0',
  host: 'api.github.com'

authenticate = ->
  github.authenticate
    type: 'basic',
    username: GITHUB_USERNAME,
    password: GITHUB_ACCESS_TOKEN

getRepositories = ->
  Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project)))

parseRepositoryInfoFromURL = (url) ->
  matched = url.match /github\.com[:\/](.*?)(\.git)?$/
  [repoOwner, repoName] = matched[1].split('/') if matched

getPullRequestURLs = (pullRequests, branch) ->
  urls = pullRequests.filter((pr) -> pr.head.ref == branch).map((pr) -> pr.html_url)

viewPullRequests = ->
  authenticate()
  getRepositories().then (repos) ->
    repos.forEach (repo) ->
      [repoOwner, repoName] = parseRepositoryInfoFromURL repo.getOriginURL()
      return unless repoOwner and repoName
      branch = repo.getShortHead()
      github.pullRequests.getAll
        user: repoOwner
        repo: repoName
      , (err, pullRequests) ->
        return console.error err if err
        urls = getPullRequestURLs pullRequests, branch
        urls.forEach (url) ->
          Shell.openExternal url if url

module.exports =
  activate : ->
    atom.commands.add 'atom-workspace', 'github-utils:view-pull-request', viewPullRequests

  parseRepositoryInfoFromURL:  parseRepositoryInfoFromURL
  getPullRequestURLs: getPullRequestURLs
