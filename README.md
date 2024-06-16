# cypress-image-diff-github-app

A GitHub App for Cypress Image Diff

Your go-to solution for visual testing with Cypress. Ensure pixel-perfect UIs with its seamless integration and extensive HTML reporting. Plus, enjoy effortless GitHub CI/CD integration, making UI testing a breeze.

Key Features:

- Pair up with Cypress for effortless visual testing.
- Extensive HTML reporting provides detailed insights into visual differences.
- Seamless GitHub CI/CD integration streamlines the testing workflow.
- Effortlessly commit baseline changes directly within the CI environment.

## Quick Start:

These are the steps that you need to take for a GitHub repository:

### Create a new Cypress Image Diff account

- Visit: https://cypress-image-diff.netlify.app/
- Click "Sign up with GitHub".
- Grant authorization to our app.

### Link your GitHub repositories

- After successful sign-up, you should be redirected to the projects page. Or visit the projects page [here](https://cypress-image-diff.netlify.app/projects).
- Click "Link GitHub repositories".
- Select the repositories where you want to install our GitHub app.

### Set up CircleCI

- Log in to your CircleCI account. If you don't have an account yet, create one [here](https://circleci.com/vcs-authorize/).
- Create a new project and link the associated GitHub repository.
- Replace the content of your `.circleci/config.yml` with the default setup below. If you don't have a `.circleci/config.yml` file, create one. If you already have a configuration file, append this workflow to the end of your current YAML file. Ensure to update the configuration below with your actual values:

```yaml
version: 2

jobs:
  visual-test:
    docker:
      - image: cypress/base:latest
    # your actual working directory
    working_directory: ~/your-working-directory
    steps:
      - checkout
      - run:
          name: Install Dependencies and Required Libraries
          command: |
            npm install
            apt-get update && apt-get install -y \
              libgtk2.0-0 \
              libgtk-3-0 \
              libgbm-dev \
              libnotify-dev \
              libnss3 \
              libxss1 \
              libasound2 \
              libxtst6 \
              xauth \
              xvfb
      - run:
          name: Run Tests
          # replace with your actual test command
          command: npm run test
      - store_artifacts:
          # replace with your actual folder path if you have a custom one
          path: cypress-image-diff-screenshots
      - store_artifacts:
          # replace with your actual folder path if you have a custom one
          path: cypress-image-diff-html-report

workflows:
  version: 2
  cypress-image-diff:
    jobs:
      # job name should NOT be modified
      - visual-test
```

- Commit and push this new config file to your github repo.

### Share CircleCI project token with Cypress Image Diff

- In the CircleCI application, select the project you just created. You can find your projects under the Projects tab.
- Click on the gear icon (⚙️) located on the top-right corner to open the project settings.
- In the project settings menu, find and select API Permissions.
- Create a new token with the scope of readonly and the key name `CIRCLE_CI_CYPRESS_IMAGE_DIFF_TOKEN`.
- Copy this token value, go to [Cypress Image Diff projects page](https://cypress-image-diff.netlify.app/projects), look for the associated project, click settings, add a new secret with the same key and value, and hit Save.

### Start pushing commits to your repository

- Push any commit to your repository. You will see two commit statuses created for your commit: one for the CircleCI pipeline and one for Cypress Image Diff.
- Wait until the Cypress Image Diff pipeline has finished, then click the "Details" link to view the Cypress Image Diff report.