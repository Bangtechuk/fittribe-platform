# Git Initialization Guide for FitTribe.fitness

This guide provides detailed instructions for initializing Git in your FitTribe project directory and preparing it for deployment.

## Step 1: Navigate to Your Project Directory

First, make sure you're in the FitTribe project directory:

```bash
cd /home/ubuntu/FitTribe
```

## Step 2: Initialize Git Repository

Initialize a new Git repository in this directory:

```bash
git init
```

This command creates a new `.git` subdirectory that will contain all of your Git repository information.

## Step 3: Configure Git User Information

If this is your first time using Git on this machine, you'll need to configure your user information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace "Your Name" and "your.email@example.com" with your actual name and email.

## Step 4: Create a .gitignore File

Create a `.gitignore` file to specify files that Git should ignore:

```bash
# Create .gitignore file
cat > .gitignore << 'EOL'
# OS files
.DS_Store
Thumbs.db

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependency directories
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Build outputs
/build
/dist
EOL
```

## Step 5: Add Files to Git Staging Area

Add all files to the Git staging area:

```bash
git add .
```

This command adds all files in the current directory (except those specified in `.gitignore`) to the staging area.

If you want to be more selective, you can add specific files or directories:

```bash
# Add only the static_demo directory
git add static_demo/

# Add specific files
git add deployment_guide.md deployment_verification.md
```

## Step 6: Commit Your Changes

Commit the staged files to your local repository with a descriptive message:

```bash
git commit -m "Initial commit of FitTribe static demo"
```

## Step 7: Create a Remote Repository (GitHub Example)

Before pushing your code, you need to create a repository on a Git hosting service like GitHub:

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "fittribe-fitness")
4. Add an optional description
5. Choose public or private visibility
6. Do not initialize with README, .gitignore, or license (since you're importing an existing repository)
7. Click "Create repository"

## Step 8: Link Local Repository to Remote Repository

After creating the remote repository, link your local repository to it:

```bash
git remote add origin https://github.com/YOUR_USERNAME/fittribe-fitness.git
```

Replace `YOUR_USERNAME` and `fittribe-fitness` with your GitHub username and repository name.

## Step 9: Push Your Code to the Remote Repository

Push your committed code to the remote repository:

```bash
git push -u origin main
```

Note: If you're using an older version of Git that still uses `master` as the default branch name instead of `main`, use:

```bash
git push -u origin master
```

## Step 10: Verify Your Repository

Visit your GitHub repository URL to verify that your code has been successfully pushed:

```
https://github.com/YOUR_USERNAME/fittribe-fitness
```

## Common Git Commands for Future Use

Here are some common Git commands you might need in the future:

```bash
# Check repository status
git status

# View commit history
git log

# Create and switch to a new branch
git checkout -b new-feature

# Switch to an existing branch
git checkout main

# Pull latest changes from remote repository
git pull

# Add and commit changes in one command (only for tracked files)
git commit -am "Update feature X"

# Discard changes to a file
git checkout -- filename

# Merge a branch into current branch
git merge branch-name
```

## Troubleshooting

If you encounter issues with Git initialization or pushing to the remote repository, here are some common solutions:

### Authentication Issues

If you're having trouble authenticating with GitHub:

1. You might need to use a personal access token instead of your password
2. Go to GitHub → Settings → Developer settings → Personal access tokens
3. Generate a new token with appropriate permissions
4. Use this token instead of your password when prompted

### Permission Denied Errors

If you get "Permission denied" errors:

1. Check that you have the correct permissions for the remote repository
2. Verify that you're using the correct URL format (HTTPS or SSH)
3. For SSH, ensure your SSH keys are properly set up

### Branch Name Issues

If you get an error about the branch name:

1. Check your default branch name with `git branch`
2. Use that name in your push command: `git push -u origin YOUR_BRANCH_NAME`

### Large File Issues

If you have large files that exceed GitHub's file size limits:

1. Consider using Git LFS (Large File Storage)
2. Or remove large files from your repository history
