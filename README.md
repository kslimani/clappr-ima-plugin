# IMA SDK Plugin for Clappr

[Google IMA HTML5 SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/quickstart) advert plugin for [Clappr](https://github.com/clappr/clappr) video player.

Note: Clappr player version must be >= 0.2.97.

To see the plugin in action, check out [demo page](https://kslimani.github.io/clappr-ima-plugin/).

# Usage

Add both Clappr and the plugin scripts to your HTML:

```html
<head>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/clappr-ima-plugin@latest/dist/clappr-ima-plugin.min.js"></script>
</head>
```

Then add `ClapprImaPlugin` into the list of plugins of your player instance, and the options for the plugin go in the `imaPlugin` property as shown below.

```javascript
var player = new Clappr.Player({
  source: "https://your.video/here.mp4",
  plugins: [
    ClapprImaPlugin
  ],
  imaPlugin: {
    // requestAdIfNoAutoplay: true,
    // disableNonLinearForIOS: true,
    // resetAdOnEnded: true,
    // onAdPlayerReady: function (adPlayer) { console.log(adPlayer); },
    imaAdPlayer: {
      tag: 'https://myadserver.com/path/to/vast/tag.xml',
      // vpaidMode: 2,
      // locale: 'fr',
      // maxDuration: 30000,
      // nonLinearMaxDuration: 8000,
    },
  },
});
```

This plugin assumes that `imaAdPlayer` configuration property is [IMA Ad player](https://github.com/kslimani/ima-ad-player) configuration object.

# Development

Install dependencies :

```shell
  yarn
```

Start HTTP dev server (http://0.0.0.0:8080) :

```shell
  npm start
```
