import {UICorePlugin, Events, Browser, Styler, Utils, $} from 'clappr'
import ImaAdPlayer from 'ima-ad-player'
import pluginStyle from './style.sass'

const svgPixel = 'data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect x="0" y="0" width="1" height="1" fill="#000000" /></svg>'

/* global google */
export default class ClapprImaPlugin extends UICorePlugin {
  get name() {
    return 'ima-plugin'
  }

  get supportedVersion() {
    return {
      min: '0.4.0',
    }
  }

  get attributes() {
    return {
      'class': this.name,
      'data-ima': ''
    }
  }

  static get vpaidMode() {
    return ImaAdPlayer.vpaidMode
  }

  constructor(core) {
    super(core)

    // Store autoplay value
    this._coreAutoplay = this.core.options.autoPlay

    // Disable autoplay if VAST tag is set to prevents content playback
    this._hasTag && (this.core._options.autoPlay = false)
  }

  bindEvents() {
    if (Events.CORE_ACTIVE_CONTAINER_CHANGED) {
      this.listenTo(this.core, Events.CORE_ACTIVE_CONTAINER_CHANGED, this._onContainerChanged)
    } else {
      this.listenTo(this.core.mediaControl, Events.MEDIACONTROL_CONTAINERCHANGED, this._onContainerChanged)
    }

    this.listenTo(this.core, Events.CORE_READY, this._onCoreReady)
    this.listenTo(this.core, Events.CORE_RESIZE, this._onResize)
  }

  get __config() {
    return this.options.imaPlugin || {}
  }

  get __container() {
    return this.core.activeContainer
      ? this.core.activeContainer
      : this.core.mediaControl.container
  }

  get __playback() {
    return this.core.activePlayback
      ? this.core.activePlayback
      : this.core.getCurrentPlayback()
  }

  get _hasTag() {
    return !!(this.__config.imaAdPlayer && this.__config.imaAdPlayer.tag)
  }

  get _playbackIsMedia() {
    return this.__playback.tagName === 'video'
      || this.__playback.tagName === 'audio'
  }

  get _playbackIsNativeVideo() {
    return this.__playback.name === 'html5_video'
  }

  get _sourceIsRestored() {
    // Video source is checked only if "native" video playback,
    // otherwise it assume that custom playback is not used by IMA SDK
    // See also https://github.com/kslimani/clappr-ima-plugin/issues/5
    return (this._playbackIsNativeVideo && ! this._isNonLinear)
      ? this._src === this.__playback.el.src
      : true
  }

  get _playbackCurrentTime() {
    return this.__playback.getCurrentTime
      ? this.__playback.getCurrentTime()
      : this.__playback.el.currentTime // Assume video element
  }

  get _isIOS10Plus() {
    return Browser.isiOS && Browser.os.majorVersion >= 10
  }

  get _isIOS10PlusWithAdError() {
    return this._hasAdError && this._isIOS10Plus
  }

  _onContainerChanged() {
    if (this._adPlayer) {
      // Assumes player has loaded another source
      this.$el.hide()
      this._adPlayer.destroy()

      // If autoplay is true on mobile device then player
      // must be consented and recycle video must be enabled
      this._coreAutoplay = this.core.options.autoPlay
    }

    // Reset ad scenario
    this._resetAd()

    this._isEnded = false

    this.listenTo(this.__playback, Events.PLAYBACK_PLAY_INTENT, () => {
      if (this._isPlayingAd) return

      // Assumes that "PLAYBACK_PLAY_INTENT" event is from user interaction
      if (this._adPlayer && this._isFirstPlay) {
        this._adPlayer.initAdDisplayContainer()
        this._disableUI()
      }
    })

    this.listenTo(this.__playback, Events.PLAYBACK_PLAY, () => {
      if (this._isPlayingAd) return

      // Playback source may have changed
      if (this._src !== this.__playback.el.src) {
        this._src = this.__playback.el.src
      }

      // FIXME: add a mechanism in Clappr to prevents playback to play on "PLAYBACK_PLAY_INTENT" event
      // FIXME: Alternatively, remove "dummy" source feature and autostart playback, with the risk to degrade user experience ?
      if (this._adPlayer && this._isFirstPlay) {
        this._isFirstPlay = false
        this._isEnded = false
        this._src = this.__playback.el.src
        this.__playback.pause()
        this._adPlayer.play()
      }
    })

    this.listenTo(this.__playback, Events.PLAYBACK_ENDED, () => {
      if (this._isPlayingAd || this._mayAutoStartMutedAdPlayer) return

      if (this._adPlayer && ! this._isEnded) {
        this._isEnded = true

        // Signal ad player that playback completed
        this._adPlayer && this._adPlayer.ended()

        this.__config.resetAdOnEnded && this._resetAd()
      }
    })

    this.listenTo(this.__container, Events.CONTAINER_VOLUME, (v) => {
      this._adPlayer && this._adPlayer.setVolume(v/100)
    })

    this.__container.$el.append(this.el)
  }

  _onCoreReady() {
    // Since Clappr 0.2.84, "CORE_READY" event is trigerred after container changed
    this._initPlugin()

    // Restore autoplay (if previously enabled)
    this._coreAutoplay && (this.core._options.autoPlay = true)
  }

  _onResize(evt) {
    if (evt.width && evt.width > 0) {
      this._adPlayer && this._adPlayer.resize(evt.width, evt.height)
    }
  }

  _resetAd() {
    this._isFirstPlay = true
    this._isNonLinear = false
  }

  _initPlugin() {
    // Build ad player configuration
    let config = this.__config.imaAdPlayer || {tag: false}
    config.video = this.__playback.el
    config.displayContainer = this._adContainer

    if (! this._playbackIsMedia && Browser.isMobile) {
      // Mobile device require an HTML5 video element
      config.tag = false
    } else if (this.__playback.name === 'no_op') {
      // Avoid to display an ad if player cannot play content
      config.tag = false
    }

    // Prevents ad player creation if no VAST tag
    if (! config.tag) {
      this._adPlayer = null

      return
    }

    // Attempt to get "error screen" core plugin
    this._errorScreenPlugin = this.core.getPlugin('error_screen')

    // Attempt to get "poster" container plugin
    this._posterPlugin = this.__container.getPlugin('poster')

    // Attempt to get "click to pause" container plugin
    this._clickToPausePlugin = this.__container.getPlugin('click_to_pause')

    // Hide video source preview using a black 1 pixel video poster for smoother user experience (iOS/MacOSX)
    if (this._playbackIsMedia && ! this.__playback.el.hasAttribute('poster')) {
      this.__playback.el.poster = svgPixel
    }

    // Create ad player
    ImaAdPlayer(config, (player, error) => {
      // Resume content if ad player creation failed
      if (error) {
        this._mayAutoStartMutedAdPlayer = false

        return this._resumeContent()
      }

      // Disable custom playback by default for iOS 10+ to handle skippable ads
      // Plugin will take care of video content source
      this.__config.enableCustomPlaybackForIOS10Plus || google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true)

      player.on('ad_begin', () => {
        this.$el.show()
        this._isPlayingAd = true
        this._hasAdError = false
        this._pauseContent()
      })

      player.on('ad_error', () => {
        this._hasAdError = true
      })

      player.on('ad_non_linear', () => {
        this._isNonLinear = true
      })

      player.on('ad_end', () => {
        if (this._isNonLinear) {
          if (this.__config.disableNonLinear || (this.__config.disableNonLinearForIOS && Browser.isiOS)) {
            // Non-linear conflicts with "click_to_play" plugin on iOS devices,
            // therefore it is skipped if disableNonLinearForIOS is set
            this._isPlayingAd = false
            this.$el.hide()
            this._adPlayer && this._adPlayer.stop()
          } else {
            this._isPlayingAd = true
            this.$el.show()
          }
        } else {
          this._isPlayingAd = false
          this.$el.hide()
        }

        this._mayAutoStartMutedAdPlayer = false

        // Avoid video to starts over after a post-roll
        if (this._isEnded) {
          this._restoreSourceIfMissing(() => {
            this._enableUI(false)
          })
        } else {
          this._restoreSourceIfMissing(() => {
            this._resumeContent()
          })
        }
      })

      this._adPlayer = player

      if (typeof this.__config.onAdPlayerReady === 'function') {
        this.__config.onAdPlayerReady(this._adPlayer)
      }

      // Check if autoplay was enabled
      if (this._coreAutoplay) {
        // Attempt to autoplay ad player
        this.__playback.canAutoPlay((result) => {
          if (result) {
            this._isFirstPlay = false
            this._isEnded = false
            this._setDummySourceIfMissing(() => {
              this._mayAutoStartMutedAdPlayer = true
              this._adPlayer.play()
            })
          } else {
            this._mayRequestAdIfNoAutoplay()
          }
        })
      } else {
        this._mayRequestAdIfNoAutoplay()
      }
    })
  }

  _mayRequestAdIfNoAutoplay() {
    this.__config.requestAdIfNoAutoplay && this._adPlayer.request()
  }

  _setDummySourceIfMissing(next) {
    if (this._playbackIsMedia) {
      let src = this.__playback.el && this.__playback.el.src

      // Video source may not be set yet by playback
      if (!src || src.length === 0) {
        this.__playback.el.src = Utils.Media.mp4
      } else {
        this._src = src
      }
    }

    next && next()
  }

  _restoreSourceIfMissing(next) {
    if (this._sourceIsRestored && ! this._isIOS10PlusWithAdError) {
      next && next()
    } else {
      // Source may not be restored on iOS 10 plus if IMA custom playback is disabled
      this._setSource(this._src, () => {
        // Check for seek after mid-roll
        if (this._pauseTime > 1 && ! this._isEnded) {
          this._seek(this._pauseTime, next)
        } else {
          next && next()
        }
      })
    }
  }

  _setSource(src, next) {
    let eh = () => {
      this.__playback.el.removeEventListener('loadedmetadata', eh, false)
      this.__playback.el.removeEventListener('error', eh, false)
      next && next()
    }

    this.__playback.el.addEventListener('loadedmetadata', eh, false)
    this.__playback.el.addEventListener('error', eh, false)
    this.__playback.el.src = src
    this.__playback.el.load()
  }

  _seek(seekTime, next) {
    if (this._playbackIsMedia && ! this.__playback.el.seekable.length) {
      return setTimeout(() => {
        this._seek(seekTime, next)
      }, 100)
    }

    // Assume playback implements seek method
    this.__playback.seek && this.__playback.seek(seekTime)
    next && next()
  }

  _disableUI() {
    if (this.core.disableMediaControl) {
      this.core.disableMediaControl()
    } else {
      let mediaControl = this.core.getPlugin('media_control')
      mediaControl && mediaControl.disable()
    }

    this._posterPlugin && this._posterPlugin.disable()
    this._clickToPausePlugin && this._clickToPausePlugin.disable()
    this._errorScreenPlugin && this._errorScreenPlugin.disable()
    this._uiEnabled = false
  }

  _enableUI(enableMediaControl = true) {
    if (this._uiEnabled) {
      return
    }

    this._errorScreenPlugin && this._errorScreenPlugin.enable()
    this._clickToPausePlugin && this._clickToPausePlugin.enable()
    this._posterPlugin && this._posterPlugin.enable()

    if (enableMediaControl) {
      if (this.core.enableMediaControl) {
        this.core.enableMediaControl()
      } else {
        let mediaControl = this.core.getPlugin('media_control')
        mediaControl && mediaControl.enable()
      }
    }

    this._uiEnabled = true
  }

  _pauseContent() {
    this._pauseTime = this._playbackCurrentTime
    this.__playback.pause()
    this._disableUI()
  }

  _resumeContent() {
    this._enableUI()
    this.__playback.play()
  }

  render() {
    this._$adContainer = $("<div />")
      .addClass("ima-ad-container")
      .attr('data-ima', '')

    this.$el.append(this._$adContainer)
    this.$el.append(Styler.getStyleFor(pluginStyle))
    this._adContainer = this._$adContainer[0]
    this.$el.hide()

    return this
  }

  destroy() {
    this._adPlayer && this._adPlayer.destroy()
    super.destroy()
  }
}
