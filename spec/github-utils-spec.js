'use babel';

import {parseRepositoryInfoFromURL, getPullRequestURLs} from '../lib/github-utils';

describe('module github-utils', () => {
  describe('function parseRepositoryInfoFromURL', () => {

    it('should parse the owner and name of a ssh-style repository url', () => {
      let exampleRepoURL = 'git@github.com:someuser/somesweetrepo';
      let [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should parse the owner and name of a http-style repository url', () => {
      let exampleRepoURL = 'https://github.com/someuser/somesweetrepo.git';
      let [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should parse the owner and name of a subersion-style repository url', () => {
      let exampleRepoURL = 'https://github.com/someuser/somesweetrepo';
      let [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should return null if no information can be parsed', () =>{
      let invalidRepoURL = 'git@notighub.com/user/repo';
      let info = parseRepositoryInfoFromURL(invalidRepoURL);
      expect(info).toBeNull();
    });
  });

  describe('function getPullRequestURLS', () => {
    it('should return the HTML urls of the pull requests', () => {
      let examplePullRequests = [
        {
          html_url: 'https://someurl',
          head: {
            ref: 'master'
          }
        },
        {
          html_url: 'https://someotherurl',
          head: {
            ref: 'master'
          }
        },
        {
          html_url: 'https://urlnotreturned',
          head: {
            ref: 'feature-branch'
          }
        }
      ];
      let expectedURLs = ['https://someurl', 'https://someotherurl'];

      expect(getPullRequestURLs(examplePullRequests, 'master')).toEqual(expectedURLs);
    });
  });
});
