# Soundmap
--------------
<img src="http://secretdino.com/soundmap-logo-small.png" align="right">
A heat map overlay on the waveform to visualize the most liked area of a song. Select a song from your Soundcloud favorites and mark the part you like the best. Share the link with your friends to see which part they liked.

This site uses the amazing Soundcloud Javascript API to retrieve your favorite songs. If you can't find the song you're looking for on Soundcloud, you can quickly create an account and upload a song to share it with the rest of the world.

### Technical Overview

Soundmap is written entirely in Javascript using Node.js on the server side. The audio scrubber collects meta data for a song (including the waveform graphic) from Soundcloud's API. The play progress line is generated using HTML5 Canvas and the graph is generated with D3.js.