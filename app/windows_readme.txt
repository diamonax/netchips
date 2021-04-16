On Windows, the WebTorrent CLI dependency needs to be altered a bit to have the subtitles work correctly.

Edit the file "node_modules/webtorrent-cli/bin/cmd.js" and replace the following function (ca. line 564):

```
function openVLCWin32 (vlcCommand) {
  const args = [].concat(href, VLC_ARGS.split(' ')).map((x) => {
    if (!x.startsWith("--sub-file=")) return x;
    const pathname = x.slice("--sub-file=".length).replace(/"/g, "");
    return `--sub-file=${path.join(pathname)}`;
  });

  cp.execFile(vlcCommand, args, err => {
    if (err) {
      return fatalError(err)
    }
  }).on('exit', playerExit).unref()
}
```

