# github-utils for Atom

This package extends the behavior of the [open-on-github package](https://github.com/atom/open-on-github) in that it allows you to open the url of all pull requests on GitHub made from the current branch.

## Authentication
This package assumes (for the time being) that it can read the environment variables `GITHUB_USERNAME` and `GITHUB_ACCESS_TOKEN`. To create an access token for your GitHub account, login and visit https://github.com/settings/tokens. Then set the environment variables in your `.bash_aliases` file.
