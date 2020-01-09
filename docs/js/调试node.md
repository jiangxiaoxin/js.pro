在 vscode 里写 node 工程，大多数时间是希望写完代码之后，自动重启载入新代码，然后执行。有时遇到问题会想断点看看到底怎么回事。在 vscode 里可以这么做：

1. 在 `package.json` 里添加启动命令。`nodemon` 会监听文件变化，变化后会自动重启载入新代码。`babel-node` 可以直接执行 es7 写的代码，这样可以使用我喜欢的 **import/export** 方式。`--inspect`启动测试监听端口

```json
"dev": "cross-env NODE_ENV=development nodemon --inspect --exec babel-node src/index.js"
```

2. 在 vscode 里的测试里添加配置

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      // 连接到node进程调试
      "type": "node",
      "request": "attach",
      "name": "Attach to node",
      "restart": true,
      "port": 9229
    }
  ]
}
```

3. 正常开发时启动 `npm run dev`，要断点测试时在 vscode 里 **f5** 连接 debugger port，就可以断点调试了。

配置里的端口就是 `npm run dev` 启动时，console 打印的当前 debugger port。

`Debugger listening on ws://127.0.0.1:9229/408d5f4f-2ee1-4a85-a6a1-22af26f88b71`

这样子方便开发，又方便调试。
