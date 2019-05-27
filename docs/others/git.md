```bash
git status

git add xxxx

git commit -m 'xxxx'

git commit -a -m 'xxxxx'

git diff
```

```
git rm a.txt
git rm --cached a.txt
git rm -f a.txt
```

- 如果 a.txt 是刚创建的文件则没有任何效果，并且会报错。
- 如果 a.txt 已经 commit 过，则会把 a.txt 从 working repo(本地工作目录)中删除，并执行暂存(add)操作
- 如果 a.txt 暂存过，并且又有了新的修改，但是新修改没暂存，执行时会报错，因为 git 不知道你到底要干嘛。此时如果执行 `git rm --cached a.txt`，会把 a.txt 整个文件从暂存区移除，所有的数据成了未暂存的状态。 `git rm -f a.txt` 就是把 a.txt 整个文件删除，本地也删除，并且暂存这个操作。

```
git mv a.txt b.txt
```

如果要重命名某个文件，有两种方法，一种是直接改名字，查看 `git status`，发现原来的文件状态 deleted，新文件 untracked，然后 add commit，还可以按照上面的简单方法，查看状态就是 renamed， 已经 add 过了，直接 commit 就可以。

```
git branch //查看本地分支列表

git branch <branch_name> // 在当前分支基础上开辟新的 branch_name 分支

git checkout <branch_name> // 切换到 branch_name 分支

git checkout -- <file_name> // 修改了文件之后，还没暂存，此时想恢复文件到未修改前
```

```
git remote
```

```
git rebase
```

```
git reset HEAD xxxx // 某个文件已经添加到暂存区，但是想要撤回，不想暂存了
```

```

```

```
git log // 查看历史纪录
git log --graph
```
