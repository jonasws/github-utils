'use babel';

import {parseRepositoryInfoFromURL, extractPullRequestURLs} from '../lib/github-utils';

describe('module github-utils', () => {
  describe('function parseRepositoryInfoFromURL', () => {

    it('should parse the owner and name of a ssh-style repository url', () => {
      const exampleRepoURL = 'git@github.com:someuser/somesweetrepo';
      const [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should parse the owner and name of a http-style repository url', () => {
      const exampleRepoURL = 'https://github.com/someuser/somesweetrepo.git';
      const [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should parse the owner and name of a subersion-style repository url', () => {
      const exampleRepoURL = 'https://github.com/someuser/somesweetrepo';
      const [repoOwner, repoName] = parseRepositoryInfoFromURL(exampleRepoURL);

      expect(repoOwner).toEqual('someuser');
      expect(repoName).toEqual('somesweetrepo');
    });

    it('should return null if no information can be parsed', () =>{
      const invalidRepoURL = 'git@notighub.com/user/repo';
      const info = parseRepositoryInfoFromURL(invalidRepoURL);
      expect(info).toBeNull();
    });
  });

  describe('function extractPullRequestURLs', () => {
    it('should return a Promise resolving with the HTML urls of the pull requests', (done) => {
      const examplePullRequests = [
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
      const expectedURLs = ['https://someurl', 'https://someotherurl'];

      extractPullRequestURLs(examplePullRequests, 'master').then((urls) => {
        expect(urls).toEqual(expectedURLs);
        done();
      });
    });
  });
});
