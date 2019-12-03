# Interactive Media Ads (IMA) SDK plugin for Clappr

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
    // onAdPlayerReady: function (adPlayer) { adPlayer.on('first_quartile', function(o) { console.log(o); }); },
    imaAdPlayer: {
      tag: 'https://myadserver.com/path/to/vast/tag.xml',
      // vpaidMode: 2,
      // locale: 'fr',
      // maxDuration: 30000,
      // nonLinearMaxDuration: 8000,
      // adsRenderingOptions: {
      //   useStyledLinearAds: true,
      //   useStyledNonLinearAds: true,
      // },
    },
  },
});
```

[Skippable ads](https://developers.google.com/interactive-media-ads/docs/sdks/html5/skippable-ads) require that your video player play content inline (not fullscreen) on iPhone.

# Plugin options

`requestAdIfNoAutoplay` : _(default is false)_ set this option to `true` to attempt to pre-request advert if autoplay is not allowed by browser. By default, advert is requested when video content is started.

`disableNonLinearForIOS` : _(default is false)_ set this option to `true` to not display non-linear advert on iOS devices. There is a [known issue](https://github.com/kslimani/clappr-ima-plugin/issues/3) with non-linear advert and "click_to_play" Clappr internal plugin on iOS devices.

`resetAdOnEnded` : _(default is false)_ set this option to `true` to reset advert scenario when content video is ended. By default, advert is not displayed again if video content is restarted.

`onAdPlayerReady` can be used to retrieve [AdPlayer](https://github.com/kslimani/ima-ad-player) instance, providing a Function. _(may be usefull to bind specific ad events)_

`imaAdPlayer` is [IMA Ad player](https://github.com/kslimani/ima-ad-player) configuration object. _(must at least contain "tag" property)_

# Development

Install dependencies :

```shell
  yarn
```

Start HTTP dev server (http://0.0.0.0:8080) :

```shell
  npm start
```
