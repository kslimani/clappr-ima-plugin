![](https://github.com/kslimani/clappr-ima-plugin/workflows/Functional%20tests/badge.svg)

# Interactive Media Ads (IMA) SDK plugin for Clappr

[Google IMA HTML5 SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/quickstart) ads plugin for [Clappr](https://github.com/clappr/clappr) video player.

Note: Clappr player version must be >= 0.2.97 and <= 0.4.0.

To see the plugin in action, check out [demo page](https://kslimani.github.io/clappr-ima-plugin/).

# Getting started

Add both Clappr and the plugin scripts to your HTML :

```html
<head>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/clappr-ima-plugin@latest/dist/clappr-ima-plugin.min.js"></script>
</head>
```

Then add `ClapprImaPlugin` into the list of plugins of your player instance, and the options for the plugin go in the `imaPlugin` property as shown below :

```javascript
var player = new Clappr.Player({
  source: "https://your.video/here.mp4",
  playback: {
    playInline: true, // Required by skippable ads on iOS (not fullscreen)
  },
  plugins: [
    ClapprImaPlugin
  ],
  imaPlugin: {
    // requestAdIfNoAutoplay: true,
    // disableNonLinearForIOS: true,
    // resetAdOnEnded: true,
    // onAdPlayerReady: function (adPlayer) { adPlayer.on('midpoint', function(o) { console.log(o); }); },
    imaAdPlayer: {
      tag: 'https://myadserver.com/path/to/vast/tag.xml',
      // vpaidMode: 2,
      // locale: 'fr',
      // maxDuration: 30000,
      // nonLinearMaxDuration: 8000,
      // adsRenderingOptions: {
      //   useStyledNonLinearAds: true,
      // },
    },
  },
});
```

[Skippable ads](https://developers.google.com/interactive-media-ads/docs/sdks/html5/skippable-ads) require that your video player play content inline (not fullscreen) on iPhone.

# Plugin options

| Name | Type | Required | Description |
| ---  | :---: | :---: | --- |
| imaAdPlayer | object | __yes__ | The IMA Ad player [configuration object](https://github.com/kslimani/ima-ad-player/blob/master/docs/config.md). _(must at least contain "tag" property)_ |
| disableNonLinear | boolean | no | Set this option to `true` to not display non-linear ads (default is false) |
| disableNonLinearForIOS | boolean | no | Set this option to `true` to not display non-linear ads on iOS devices. There is a [known issue](https://github.com/kslimani/clappr-ima-plugin/issues/3) with non-linear ads and "click_to_play" Clappr internal plugin on iOS devices. (default is false) |
| onAdPlayerReady | Function | no | Can be used to retrieve [IMA Ad Player](https://github.com/kslimani/ima-ad-player) instance. For example, to bind specific [ad player events](https://github.com/kslimani/ima-ad-player/blob/master/docs/events.md). |
| requestAdIfNoAutoplay | boolean | no | Set this option to `true` to attempt to pre-request ads if autoplay is not allowed by browser. By default, ads are requested when video content is started. (default is false) |
| resetAdOnEnded | boolean | no | Set this option to `true` to reset ads scenario when content video is ended. By default, ads are not displayed again if video content is restarted. (default is false) |

# Development

Install dependencies :

```shell
  yarn
```

Start HTTP dev server (http://0.0.0.0:8080) :

```shell
  npm start
```
