# Commands to Push to GitHub

Run these commands **ONE BY ONE** in PowerShell from the root directory (`Blog_Platform`):

```powershell
# Step 1: Remove all git folders
Remove-Item -Recurse -Force client\.git -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Step 2: Initialize git in ROOT directory
git init

# Step 3: Add all files (node_modules will be ignored by .gitignore)
git add .

# Step 4: Commit
git commit -m "Initial commit: MERN Stack Blog Platform"

# Step 5: Set branch to main
git branch -M main

# Step 6: Add remote (if it says already exists, skip this)
git remote add origin https://github.com/TOSEEB/Blog_Platform.git

# OR if remote exists, update it:
git remote set-url origin https://github.com/TOSEEB/Blog_Platform.git

# Step 7: Push to GitHub
git push -u origin main
```

**If Step 7 asks for authentication:**
- Use your GitHub username and a Personal Access Token (not password)
- Create token at: https://github.com/settings/tokens
- Select "repo" permissions

