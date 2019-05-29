### 查看 wording repo 的状态

```
git status
```

### 暂存，提交，推送

```bash
git add xxxx

git commit -m 'xxxx'

git push

// or

git commit -a -m 'xxxxx'

git push

```

### 查看历史纪录

```
git log // 查看历史纪录
git log --graph --pretty=oneline --abbrev-commit
```

### 删除文件

```
git rm a.txt
git rm --cached a.txt
git rm -f a.txt
```

- 如果 a.txt 是刚创建的文件则没有任何效果，并且会报错。
- 如果 a.txt 已经 commit 过，之后没有修改过，则会把 a.txt 从 working repo(本地工作目录)中删除，并执行暂存(add)操作
- 如果 a.txt 暂存过，并且又有了新的修改，但是新修改没暂存，执行时会报错，因为 git 不知道你到底要干嘛。此时如果执行 `git rm --cached a.txt`，会把 a.txt 整个文件从暂存区移除，所有的数据成了未暂存的状态，但会保留下所有的数据。 `git rm -f a.txt` 就是把 a.txt 整个文件删除，本地也删除，并且暂存这个操作。

### 重命名

```
git mv a.txt b.txt
```

如果要重命名某个文件，有两种方法，一种是直接改名字，查看 `git status`，发现原来的文件状态 deleted，新文件 untracked，然后 add commit，还可以按照上面的简单方法，查看状态就是 renamed， 已经 add 过了，直接 commit 就可以。

### 远程仓库管理

```
git remote -v
```

查看当前的远程仓库列表，并显示推送和拉取的源地址。远程仓库可以有很多，所以这里的列表可能会有很多条。

```
git remote show <remote-name>
```

查看远程仓库 remote-name 的详细信息。

```
git remote add <shortname> <url>
```

添加远程仓库，shortname 是仓库的简写，url 是仓库的链接。比如要将本地已有的 git 仓库推送到服务器上，跟服务器上的远端仓库建立连接，就用这个命令，`git remote add origin https://xxx.xxx.xx.git`。默认的远端分支用 origin 。

```
git fetch <remote-name>
```

从远端仓库拉取数据到本地，可以获得远端仓库所有的分支的引用，可以随时进行合并，但不会自动合并，要手动合并才行。

```
git pull
```

也是拉取远端仓库，但是这个会尝试将远端仓库的内容合并到本地的 working repo，如果没有发生冲突之类的问题，就会自动合并进去。

```
git push [remote-name] [branch-name]
```

将本地 commit 过的内容推送到远端仓库的分支上。 `git push`是种简化用法，推送到已经设置好的远端仓库和分支上。如果是在本地创建了一个 repo，在服务器上创建了一个 repo，现在第一次推送，想将本地的 repo 推送到服务器并且跟服务器的 repo 关联起来，那就要类似这种`git push -u origin master`。`-u`的参数就是设置 upstream 的。之后就可以简化操作了 `git push origin master` 或者 `git push`

```
git remote rename <remote-name> <new-name>
```

将远程仓库的名字重命名

```
git remote rm <remote-name>
```

删除远程仓库

### 标签管理

每隔一段时间，功能稳定后，都要打一个标签，作为一个发布版本

```
git tag //标签列表

git tag v1.0.0 //打个简单的标签,以当前最新的代码为基础打
git tag -a v2.0.0 -m 'stable version 2.0.0'//打个详细的标签，带注释的
git tag v2.0.0 <commit_id> // 以某个版本的提交为基础打


git checkout v1.0.0 // 检出标签，用于查看
git checkout -b fix-v1.0.0-bug v1.0.0//如果需要改bug，就检出标签到一个分支上改

git push orgin v1.0.0 //把本地的tag推送到远端

git tag -d v1.0.0 // 删除本地的标签
git push <remote> :refs/tags/<tagname> // 删除本地后，提交删除，就把远端的标签也删了
```

### 分支管理

```
git branch //查看本地分支列表

git branch <branch_name> // 在当前分支基础上开辟新的 branch_name 分支

git branch -d <branch_name> // 删除分支

git checkout <branch_name> // 切换到 branch_name 分支

git merge <branch_name> // 将 branch_name 的内容合并到当前所在的分支上

git checkout -b serverfix origin/serverfix // 从远端仓库origin里的serverfix分支拉取到本地新的分支serverfix
```

### 撤销修改

```
git reset HEAD <file>
git checkout -- <file>
```

某个文件已经添加到暂存区（git add），但是想要撤回，不想暂存了。已经暂存的内容不会丢掉，并且如果 git add 之后还修改了文件但是没有执行 git add， 这部分新数据也不会丢失。然后用 git checkout 将文件的内容全部恢复，就将新的内容删除掉了，注意 -- 的操作符很重要，不然就成了切换分支了

```
git reset
```

### 变基

```
git rebase
```

### fix bug 常见的状况

现在在 dev 分支写东西，然后忽然要先修复 bug，而且这个 bug 还要从 master 分支上改。这时 dev 分支的东西还没暂存，就更没提交了，切换分支就会丢失，但是此时代码才写了一半，也不能提交，否则提交后运行报错。

```
git stash
```

先把当前分支的内容存起来。

```
git checkout master
git branch fixbug-101
git checkout fixbug-101
```

在 master 分支的基础上开辟新的分支 fixbug-101 用来修复 bug。

```
git add .
git commit -m 'fix bug 101'
```

提交 bug 的修复代码

```
git checkout master
git merge fixbug-101
```

将代码合并到 master 上，然后提交到远端仓库

```
git checkout dev
git stash list
git stash pop
```

切换到 dev 分支，然后查看都临时存储了哪些“分支”（不是 branch 这个分支）。把上次临时存储的内容弹出来，并且在 stash 列表里删除这条记录。

```
git add .
git commit -m 'feature:xxxxxx'
git push
```

写完代码后提交

还有种情况，在之前的某个提交上出错了，但是已经打包发布了，所以要跑去那个提交去修正回来，这就用到了游离 HEAD。

先`git checkout <commit_id>`，commit_id 就是那个提交对应的 id。git 会警告这么做可能会有坏处，还告诉该怎么做。然后`git checkout -b <new_branch_name>`，以这个提交为蓝本创建一个新的分支，然后在分支上修正错误。改完后验证发布出去后，在将这个新的版本合并回 master 上。sourcetree 的"从这个提交开辟新分支"其实就是这俩操作合起来

### 常见操作

- 重命名已经在仓库里的文件的名字

- 删除不需要的分支

```
git branch -d <branch_name_you_wanna_delete>
```

删除分支时，要注意必须确定要删除，否则会丢失数据的。git 会在删除前做一些验证并给出提示。要先切到另外一个分支，然后才能删除想删除的分支。而且要删除的分支的数据跟切换到的分支比较，要删除的分支的数据必须合并到切换到的分支，如果没合并会出报错提示，如果还想删除，就使用 `-D`。

- 修改刚才 commit 的 message 记录

```
git commit --amend -m 'new_message'
```

会对最后一次的提交信息进行修改。只能是最后一次

- 修改之前的 commit 的 message 记录
