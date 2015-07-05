GitHubApi = require 'github'
Shell = require 'shell'

GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN
GITHUB_USERNAME = process.env.GITHUB_USERNAME


github = new GitHubApi
  version: '3.0.0',
  host: 'api.github.com'

module.exports =
  activate: ->
    atom.commands.add 'atom-workspace', 'github-utils:view-pull-request', @viewPullRequests

  viewPullRequests: ->
    github.authenticate
        type: 'basic',
        username: GITHUB_USERNAME,
        password: GITHUB_ACCESS_TOKEN

    Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project)))
      .then (repos) ->
        repos.forEach (repo) ->
          [repoOwner, repoName] = repo.getOriginURL().match(/github\.com[:\/](.*?)(\.git)?$/)[1].split('/')
          branch = repo.getShortHead()
          github.pullRequests.getAll
            user: repoOwner,
            repo: repoName
          , (err, pullRequests) ->
              url = pullRequests.filter((pr) -> pr.head.ref == branch)[0]?.html_url
              Shell.openExternal url if url?
