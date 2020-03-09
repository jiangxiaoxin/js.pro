### 查看 working copy 的状态，会提供很多参考信息

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

git log，查看历史纪录，不过一般都带上写参数使用。最常用的就是 **--oneline**，可以看简略信息。

```
git log --oneline 查看当前分支的历史记录
git log --oneline /path/to/file 查看跟这个文件有关的提交记录
git log --oneline -graph --all 以图的形式展示所有的分支间的历史记录情况
```

### 删除文件

```
git rm a.txt
git rm --cached a.txt
git rm -f a.txt
```

- 如果 a.txt 是刚创建的文件则没有任何效果，并且会报错，说找不到这个文件。
- 如果 a.txt 已经 commit 过，就会创建个新的提交，把 a.txt 删除，并且已经暂存过（add），就等着 commit。
- 如果 a.txt 暂存过，并且又有了新的修改，但是新修改没暂存，执行时会报错，因为 git 不知道要怎么做了。此时如果执行 `git rm --cached a.txt`，会把 a.txt 整个文件从暂存区移除，所有的数据成了未暂存的状态，但会保留下所有的修改。 `git rm -f a.txt` 就是把 a.txt 整个文件删除，本地也删除，并且暂存这个操作。

### 重命名

```
git mv a.txt b.txt
```

如果要重命名某个文件，有两种方法，一种是直接改名字，查看 `git status`，发现原来的文件状态 deleted，新文件 untracked，然后 add commit，还可以按照上面的简单方法，查看状态就是 renamed， 已经 add 过了，直接 commit 就可以。

### 远程仓库管理

```
git remote -v
```

查看当前的远程仓库列表，并显示推送 push 和拉取 fetch 的源地址，这俩链接可以一样，也可以不一样的。远程仓库可以有很多个，所以这里的列表可能会有很多条。

```
git remote show <remote-name>
```

查看远程仓库 remote-name 的详细信息。

```
git remote add <shortname> <url>
```

添加远程仓库，shortname 是仓库的简写，url 是仓库的链接。比如要将本地已有的 git 仓库推送到服务器上，跟服务器上的远端仓库建立连接，就用这个命令，`git remote add origin https://xxx.xxx.xx.git`。默认的远端仓库名用 origin 。这个命令是给仓库添加了很多远程仓库，使用 git push -u repo-name branch-name 可以将本地仓库上的分支，推送到远程上仓库的分支。就是一个本地的代码可以往不同的远程推送。

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

删除远程仓库。将本地 repo 与远端 repo 绑定时绑错了，可以取消掉，然后重新绑，这个很好用。

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

git branch -a //查看本地和远程的分支列表

git branch <branch_name> // 在当前分支基础上开辟新的 branch_name 分支

git branch -d <branch_name> // 删除分支
git branch -D <branch_name>

git checkout <branch_name> // 切换到 branch_name 分支

git checkout --track serverfix origin/serverfix // 从远端仓库origin里的serverfix分支拉取到本地新的分支serverfix
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

### 变基/衍合

```
git rebase
```

也是合并分支的一种方式，但这种方式，将 a 分支合并到 b 分支之后，历史记录机会被改动，在没有完整清晰的时间节点表示在某个时刻迁出什么分支做过什么事，只是记录下一堆提交，和提交的内容，时间线被打乱了

```
git chekcout a
git merge b // 将 b 的内容合并到当前所在的分支a上
```

合并代码的一种方式，也是最常用的方式，合并后，有完整清晰的时间脉络，可以以后查看在什么时候做了什么。

### 贮藏 stash

在一个分支上开发任务时，临时要在这个分支上做其他东西，而前面的这个任务还没完成，还不能 commit。这时候为了让这个分支干净，不会导致提交之后项目运行不了，并且已经改过的东西还不想丢掉，这时候就将所做的修改先 stash，然后再做新任务。结束后再把存起来的 stash 取出来继续开发。

其实可以 commit，一般分支都是自己开的，用来做自己的任务，跟别人的分支不会有牵扯，所以即使这时候把未完成的任务 commit 了，然后再从 master 上切分支出来改问题，改完问题再切回这个分支继续任务也可以。**所以 stash 不是一个没了就不行的功能**

> 应该尽量使用分支来管理开发，而不要在一个特定的功能分支上临时去开发别的东西。

存起来的改动，是跟分支脱钩的，它不与任何的分支强制的绑定，而是可以在任何的分支中把存的取出来。stash 就是一个全局的剪贴板。比如在 b1 上进行了 stash 之后，再切到 b2 分支上，然后在 b2 分支把 stash 合进来，那就相当于在 b2 上 commit 了新功能。

```
git stash // 将当前的修改存起来。执行完后再git status，就会发现没有任何需要提交的东西
git stash list // 列出当前所有存起来的修改。存起来的修改不是针对某个分支的。最新添加的在最上面显示
git stash pop // 将最新存的那次修改弹出，并使用。这样再list时就会发现，它没有了
git stash apply <stash name> // 使用某个stash，它的名字样式都是类似stash@{0}。这个只是使用，list时会发现它还在
git stash drop <stash name> // 将某个stash删除。apply和drop可以不加stash name，处理的就是最新的一次
```

### git submodules 子模块

https://www.git-tower.com/learn/git/ebook/cn/command-line/advanced-topics/submodules

### git-flow

就是 git 帮你完成一系列的建分支，合分支的操作。这些操作都是严格限定功能的，master develop release hotfix feature 等等

https://www.git-tower.com/learn/git/ebook/cn/command-line/advanced-topics/git-flow#start

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

先`git checkout <commit_id>`，commit_id 就是那个提交对应的 id。git 会警告这么做可能会有坏处，还告诉该怎么做。然后`git checkout -b <new_branch_name>`，以这个提交为蓝本创建一个新的分支，然后在分支上修正错误。改完后验证发布出去后，在将这个新的版本合并回 master 上。sourcetree 的"从这个提交开辟新分支"其实就是这俩操作合起来.

其实**最简单**就是`git checkout -b fix-xxx commit-hash-id`，以某个提交为基础切出一个分支，改完了再合并回去。

### 常见操作

- 重命名已经在仓库里的文件的名字

- 删除不需要的分支

```
git branch -d <branch_name_you_wanna_delete>
```

删除分支时，要注意必须确定要删除，否则会丢失数据的。git 会在删除前做一些验证并给出提示。要先切到另外一个分支，然后才能删除想删除的分支。而且要删除的分支的数据跟切换到的分支比较，要删除的分支的数据必须合并到切换到的分支，如果没合并会出报错提示，如果还想删除，就使用 `-D`。

- 刚才 commit 的 message 有问题，想要修改一下。或者有几个文件漏掉了，但是想跟上一次 commit 行成一个 commit 记录

刚才提交之后，如果没有修改或者添加任何东西，那此时再 commit，git 是不会发起新的 commit 操作的，会告诉你没有东西需要 commit。使用下面的命令可以简单的修改上次提交的 message 信息。

```
git commit --amend -m 'new_message'
```

会对最后一次的提交信息进行修改。只能是最后一次。其实际是把上一次提交撤回了，然后重新提交了一次。

- 修改之前的 commit 的 message 记录

对要修改的 commit 的父次提交进行交互式的变基`git rebase -i commit_id`

- 回滚（reverse commit）

在某一次提交上执行回滚操作，是将这次提交记录所涉及的修改全部还原成之前的样子，那么刚才修改的地方就会全丢失掉。

- 恢复暂存区（unstage）

```
git reset HEAD // 恢复整个暂存区的文件
git reset HEAD <file_name> // 只恢复暂存区的某个文件
```

- 对比文件差异(diff，跟对比差异有关的都使用 git diff，只是参数不一样)

```
git diff <branch_name> <branch_name> -- <file_name> // 对比两个分支中某个文件的差异
git diff <commit_id> <commit_id> -- <file_name> // 对比一个分支的某两个提交中，某个文件的差异
git diff aaa..bbb 比较两个分支或者两个版本之间的改动
```
