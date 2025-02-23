# Contributing to @ekino/config 🌟

First and foremost, thank you for considering a contribution to this project! 💖

Your time and effort make a difference, and every pull request, no matter the size, helps move this project forward.

Whether you're fixing a bug, adding a new feature, or improving documentation, your input is valuable. If you're new to open source, welcome! 🎉

Don't worry if you feel unsure about where to start—every bit of help is appreciated, and questions are welcome.

## How to contribute

Follow this guide to ensure a smooth contribution process. If you're planning significant work or substantial changes, please create an issue labeled "contribution enquiry" to discuss your proposal. This will help ensure that your work aligns with the project's goals.

### Steps to get started

- **Fork the repository**
  Start by [forking the repository](http://help.github.com/fork-a-repo/).

- **Clone your fork**
  Clone your forked repo to your local machine:

    ```bash
    git clone git@github.com:ekino/node-config.git
    ```

- **Set upstream**
  Link back to the main project repository:

    ```bash
    git remote add upstream git://github.com/ekino/node-config.git
    ```

- **Sync with upstream**
  Fetch the latest changes from upstream, usually the main development branch:

    ```bash
    git pull upstream <dev-branch>
    ```

- **Create a topic branch**
  Create a new branch for your feature, fix, or enhancement:

    ```bash
    git switch -c <topic-branch-name>
    ```

- **Write tests**
  Ensure your changes are reliable by including tests. For small patches, a simple test is fine; for new features, create a dedicated test suite.

- **Coding style and conventions**
  Maintain the project’s coding standards. Consistent indentation, comments, and style improve readability.

- **Commit changes in logical chunks**
  Split your commits into logical parts. Use git’s [interactive rebase](https://help.github.com/articles/interactive-rebase) to keep your commit history clean.

- **Merge with upstream**
  Sync your branch with the latest upstream changes:

    ```bash
    git pull --rebase upstream <dev-branch>
    ```

- **Push to your fork**
  Push your topic branch to your fork:

    ```bash
    git push origin <topic-branch-name>
    ```

- **Create a pull request**
  Open a [pull request](http://help.github.com/send-pull-requests/) with a clear title and description, explaining why and how you made your changes.

### Guidelines for a successful contribution

- Keep your PR focused; avoid unrelated changes.
- Write meaningful commit messages. See [this guide](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) for best practices.
- Follow the project’s formatting and coding style.
- Update documentation or comments as needed to explain your changes.

### Need Help?

If anything is unclear, or if you're facing any issues while contributing, please don’t hesitate to [open an issue](https://github.com/ekino/node-config/issues/new/choose). We're here to help!
