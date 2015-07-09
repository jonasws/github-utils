{parseRepositoryInfoFromURL, getPullRequestURLs} = require '../lib/github-utils'



describe 'module github-utils', ->
  describe 'function parseRepositoryInfoFromURL', ->
    it 'should parse the owner and name of a ssh-style repository url', ->
      exampleRepoURL = 'git@github.com:someuser/somesweetrepo'
      [repoOwner, repoName] = parseRepositoryInfoFromURL exampleRepoURL
      expect(repoOwner).toEqual('someuser')
      expect(repoName).toEqual('somesweetrepo')

    it 'should parse the owner and name of a http-style repository url', ->
      exampleRepoURL = 'https://github.com/someuser/somesweetrepo.git'
      [repoOwner, repoName] = parseRepositoryInfoFromURL exampleRepoURL
      expect(repoOwner).toEqual('someuser')
      expect(repoName).toEqual('somesweetrepo')

    it 'should parse the owner and name of a subersion-style repository url', ->
      exampleRepoURL = 'https://github.com/someuser/somesweetrepo'
      [repoOwner, repoName] = parseRepositoryInfoFromURL exampleRepoURL
      expect(repoOwner).toEqual('someuser')
      expect(repoName).toEqual('somesweetrepo')

    it 'should return null if no information can be parsed', ->
      invalidRepoURL = 'git@notighub.com/user/repo'
      info = parseRepositoryInfoFromURL(invalidRepoURL)
      expect(info).not.toBeDefined()

  describe 'function getPullRequestURLS', ->
    it 'should return the HTML urls of the pull requests', ->
      examplePullRequests = [
        {
          html_url: 'https://someurl',
          head:
            ref: 'master'
        },
        {
          html_url: 'https://someotherurl',
          head:
            ref: 'master'
        },
        {
          html_url: 'https://urlnotreturned',
          head:
            ref: 'feature-branch'
        }
      ]
      expectedURLs = ['https://someurl', 'https://someotherurl']
      expect(getPullRequestURLs(examplePullRequests, 'master')).toEqual(expectedURLs)
