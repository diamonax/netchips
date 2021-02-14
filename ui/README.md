# UI

The frontend for Netchips.

## Modes

The files can be deployed in two environments: a standard web browser or Electron. When deployed with Netchips' App module, which uses Electron, the `window` object contains an extra property called `app` that can be used to call some functions defined in the App "backend" (i.e. to start VLC or WebTorrent). When deployed on the web however, it will not have the ability to open the videos in VLC. Instead, it will just provide you with the video URIs and the ability to download the subtitles separately.

## Development

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
