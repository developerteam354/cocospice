# Git Commands to Fix Blocked Push

## 🎯 What We're Doing

We need to:
1. Stage the fixed `DEPLOYMENT_CHECKLIST.md` file (with dummy placeholders)
2. Amend the last commit to replace the version with secrets
3. Push to GitHub (which will now succeed)

## 📋 Step-by-Step Commands

### Step 1: Verify the Fix
First, let's verify the sensitive data has been removed:

```powershell
# Check the current changes
git status

# Verify DEPLOYMENT_CHECKLIST.md no longer has secrets
git diff DEPLOYMENT_CHECKLIST.md
```

You should see the AWS and Stripe keys replaced with placeholders like `your_aws_access_key_id`.

### Step 2: Stage the Fixed Files
```powershell
# Stage the fixed DEPLOYMENT_CHECKLIST.md
git add DEPLOYMENT_CHECKLIST.md

# Also stage the new security notice
git add SECURITY_NOTICE.md

# Stage the git fix commands file
git add GIT_FIX_COMMANDS.md
```

### Step 3: Amend the Last Commit
This replaces the last commit (with secrets) with a new commit (without secrets):

```powershell
git commit --amend --no-edit
```

**What this does:**
- `--amend`: Replaces the last commit
- `--no-edit`: Keeps the same commit message

If you want to update the commit message, use:
```powershell
git commit --amend -m "Fix: Remove sensitive credentials from documentation"
```

### Step 4: Push to GitHub
Now push the amended commit:

```powershell
git push origin main
```

This should succeed because the secrets are no longer in the commit!

## 🔍 Verification

After pushing, verify:

```powershell
# Check the commit history
git log --oneline -3

# Verify the commit hash changed (it should be different from 231ae85d)
git log -1
```

The commit hash will be different because we amended the commit.

## ⚠️ Important Notes

### About Amending Commits
- ✅ Safe to use when you haven't pushed yet (your case)
- ✅ Changes the commit hash (creates a new commit)
- ❌ Don't amend commits that others have already pulled

### If You Had Already Pushed
If you had already pushed the commit with secrets (you didn't), you would need:
```powershell
# Force push (ONLY if you had already pushed)
git push origin main --force

# Then rotate credentials immediately
```

But in your case, **regular push is fine** because the commit was never pushed to GitHub.

## 🚨 After Git Fix: Rotate Credentials

**CRITICAL**: Even though the secrets weren't pushed to GitHub, they exist in your local Git history. You should still rotate your credentials:

1. **AWS Access Key**: Deactivate the exposed key (starts with AKIA) and create a new one
2. **Stripe Secret Key**: Roll your secret key in Stripe Dashboard
3. **Stripe Webhook Secret**: Create a new webhook endpoint

See `SECURITY_NOTICE.md` for detailed steps.

## 📊 Expected Output

### After `git commit --amend --no-edit`:
```
[main abc1234] Fix user logout issue and add deployment documentation
 Date: Sun May 17 2026 ...
 14 files changed, 500 insertions(+), 50 deletions(-)
 create mode 100644 DEPLOYMENT_CHECKLIST.md
 create mode 100644 SECURITY_NOTICE.md
 ...
```

### After `git push origin main`:
```
Enumerating objects: 23, done.
Counting objects: 100% (23/23), done.
Delta compression using up to 4 threads
Compressing objects: 100% (14/14), done.
Writing objects: 100% (14/14), 10.25 KiB | 807.00 KiB/s, done.
Total 14 (delta 8), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (8/8), completed with 7 local objects.
To https://github.com/developerteam354/cocospice.git
   abc1234..def5678  main -> main
```

## ✅ Success Checklist

- [ ] Verified secrets removed from `DEPLOYMENT_CHECKLIST.md`
- [ ] Staged fixed files
- [ ] Amended commit
- [ ] Pushed to GitHub successfully
- [ ] Rotated AWS credentials
- [ ] Rotated Stripe credentials
- [ ] Updated local `.env` files with new credentials
- [ ] Updated production environment variables

## 🆘 Troubleshooting

### If push still fails with "push declined"
The secrets might still be in the commit. Check:
```powershell
# View the file content in the last commit
git show HEAD:DEPLOYMENT_CHECKLIST.md | Select-String -Pattern "your_aws_access_key"
```

If it still shows the secret, the amend didn't work. Try:
```powershell
# Reset to previous commit (keeps changes)
git reset --soft HEAD~1

# Stage only the files without secrets
git add DEPLOYMENT_CHECKLIST.md SECURITY_NOTICE.md GIT_FIX_COMMANDS.md

# Create new commit
git commit -m "Fix: Remove sensitive credentials from documentation"

# Push
git push origin main
```

### If you accidentally pushed with secrets
```powershell
# Rotate credentials IMMEDIATELY
# Then remove from history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch DEPLOYMENT_CHECKLIST.md" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin main --force
```

## 📞 Need Help?

If you encounter issues:
1. Check `git status` to see current state
2. Check `git log -1` to see last commit
3. Check `git diff HEAD` to see unstaged changes
4. Read the error message carefully

## 🎉 You're Done!

Once the push succeeds:
1. ✅ Your code is on GitHub (without secrets)
2. ⏳ Rotate your credentials (see `SECURITY_NOTICE.md`)
3. ✅ Continue development safely
