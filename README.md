# github-utils for Atom

This package extends the behavior of the [open-on-github package](https://github.com/atom/open-on-github) in that it allows you to open the url of all pull requests on GitHub made from the current branch.

## Optional: GitHub API token creation
In order for this package to view PRs at private repos, you must first obtain an authorization token to be used with the GitHub API. Such a token may be created [here](https://github.com/settings/tokens/new).

There are two ways for this package to access to your newly created token. You may paste it, along with your GitHub username in the settings view for this package or you may assign them to environment variables, as follows:

```bash
# In your .bashrc file or similar, depending on platform
export GITHUB_USERNAME="yourusernamehere";
export GITHUB_ACCESS_TOKEN="yourtokenhere";
```

This approach is useful, in particular, when used together with a  ["sophisticated" dotfiles management strategy](https://dotfiles.github.io/)
