import { funcs } from './funcs.js'

const iconIndex = {
    "check": {
        "contents": "<path d=\"M13 21c1-4 5-20 15-20 4 0 5 3 3 3-10 0-11 15-13 23-1 4-6 6-8 2-2-5-4-8-8-8-2 0-2-4-1-6 2-4 11 2 12 6Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "close": {
        "contents": "<path d=\"M16 11 26 1c3-3 8 2 5 5L21 16l10 10c3 3-2 8-5 5L16 21 6 31c-3 3-8-2-5-5l10-10L1 6c-3-3 2-8 5-5l10 10Z\"/>\n  <g class=\"icon-offset-shadow\">\n      <path d=\"M16 11 26 1c3-3 8 2 5 5L21 16l10 10c3 3-2 8-5 5L16 21 6 31c-3 3-8-2-5-5l10-10L1 6c-3-3 2-8 5-5l10 10Z\"/>\n  </g>",
        "viewBox": "0 0 32 32"
    },
    "coin": {
        "contents": "<path d=\"M10 14c6 0 10 2 10 5s-4 5-10 5-10-2-10-5 4-5 10-5Zm10 7v2c0 3-4 5-10 5S0 26 0 23v-2c0 3 4 5 10 5s10-2 10-5Zm0 4v2c0 3-4 5-10 5S0 30 0 27v-2c0 3 4 5 10 5s10-2 10-5Zm2-25c6 0 10 2 10 5s-4 5-10 5-10-2-10-5 4-5 10-5Zm10 7v2c0 3-4 5-10 5s-10-2-10-5V7c0 3 4 5 10 5s10-2 10-5Zm0 4v2c0 3-4 5-10 5h-1l-1-2h2c6 0 10-2 10-5Zm0 4v2c0 3-4 5-10 5h-1v-2h1c6 0 10-2 10-5Zm0 4v2c0 3-4 5-10 5h-1v-2h1c6 0 10-2 10-5Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "configure": {
        "contents": "<path d=\"M39 9H25l3-9h8l3 9Zm0 46-3 9h-8l-3-9h14ZM9 39l-9-3v-8l9-3v14Zm46 0V25l9 3v8l-9 3Zm-2-18L43 11l9-4 5 5-4 9ZM21 53l-9 4-5-5 4-9 10 10ZM11 21l-4-9 5-5 9 4-10 10Z\"/>\n  <path d=\"M41 43c-1-1-2-2-1-3s2 0 3 1l12 12c1 1 2 2 1 3s-2 0-3-1L41 43Zm-5 0 8 8c2 2 2 2 0 3l-2 1-10 2a25 25 0 1 1 25-25l-3 12c-1 2-1 2-3 0l-8-8 1-4c0-7-5-12-12-12-4 0-5 0-3 2l4 4c2 2 2 2 0 4l-3 3c-2 2-2 2-4 0l-3-3c-3-3-3-2-3 2 0 7 5 12 12 12l4-1Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "copy": {
        "contents": "<path class=\"FrontSheet\" d=\"M11 6c1.5 0 1.5 0 1.5 1.5V13c0 1.5 1 2.5 2.5 2.5h5.5c1.5 0 1.5 0 1.5 1.5v12c0 2-1 3-3 3H4c-2 0-3-1-3-3V9c0-2 1-3 3-3h7Zm10 8h-5c-1.5 0-2-.5-2-2V7c0-1 .3-.8 1 0l6 6c.7.7 1 1 0 1Z\"/>\n  <path class=\"BackSheet\" d=\"M11 5c-1 0-1 0-1-1V3c0-2 1-3 3-3h7c1.5 0 1.5 0 1.5 1.5V7c0 1.5 1 2.5 2.5 2.5h5.5c1.5 0 1.5 0 1.5 1.5v12c0 2-1 3-3 3h-3.5c-1 0-1 0-1-1V13.5c0-.3-.1-.6-.3-.8l-7.8-7.3c-.2-.3-.6-.4-1-.4H11Zm19 3h-5c-1.5 0-2-.5-2-2V1c0-1 .3-.8 1 0l6 6c.7.7 1 1 0 1Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "create": {
        "contents": "<path d=\"M41 15V1h1l14 16v1H44c-2 0-3-1-3-3Zm-3 18a16 16 0 0 1 21 15 16 16 0 1 1-21-15Zm3 13h-8v4h8v8h4v-8h8v-4h-8v-8h-4v8ZM27 60H11c-2 0-4-2-4-4V4c0-2 2-4 4-4h23c2 0 4 2 4 4v12c0 3 2 5 5 5h11c2 0 3 1 3 3v10a20 20 0 0 0-34 14c0 5 1 9 4 12Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "dash": {
        "contents": "<path d=\"M0 2c0-2 0-2 2-2h28c2 0 2 0 2 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2Zm17 26h12V4H17v24ZM3 27c0 2 0 2 2 2h7c2 0 2 0 2-2V5c0-2 0-2-2-2H5C3 3 3 3 3 5v22Zm9-20v18c0 2 0 2-2 2H7c-2 0-2 0-2-2V7c0-2 0-2 2-2h3c2 0 2 0 2 2Z\"/>\n  <g class=\"icon-offset-shadow\">\n     <path d=\"M0 2c0-2 0-2 2-2h28c2 0 2 0 2 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2Zm17 26h12V4H17v24ZM3 27c0 2 0 2 2 2h7c2 0 2 0 2-2V5c0-2 0-2-2-2H5C3 3 3 3 3 5v22Zm9-20v18c0 2 0 2-2 2H7c-2 0-2 0-2-2V7c0-2 0-2 2-2h3c2 0 2 0 2 2Z\"/>\n  </g>",
        "viewBox": "0 0 32 32"
    },
    "delete": {
        "contents": "<path d=\"m58 17-2 33c-1 14-3 14-7 14H15c-4 0-6 0-7-14L6 17h52Zm-10 7h-6v32h3l3-32ZM34 56l1-32h-6l1 32h4ZM16 24l3 32h3V24h-6ZM34 0c4 0 6 2 6 6h14c4 0 6 2 6 6v2H4v-2c0-4 2-6 6-6h14c0-4 2-6 6-6h4Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "dice": {
        "contents": "<path d=\"M2.5 6.1 16 2.5l13.5 3.6L16 12.4 2.5 6.1ZM16 5.5c-1.2 0-2.3.3-2.3.7 0 .5 1 .8 2.3.8 1.2 0 2.3-.3 2.3-.8 0-.4-1-.7-2.3-.7Zm14.5 1.3v15l-14 8.3V13.3l14-6.5Zm-2.3 5.4c0-1-.6-1.2-1.5-.8-.9.3-1.7 1.7-1.6 2.7.1 1 .7 1.2 1.6.8 1-.4 1.6-1.8 1.5-2.7Zm-5.6 9.4c0-1-.7-1.3-1.7-.8-1 .4-1.8 2-1.7 3 .2 1.1.8 1.3 1.7.9 1-.5 1.8-2.1 1.7-3.1Zm-7.1-8.3v16.8l-14-8.4v-15l14 6.6Zm-11-3.2c-.8-.5-1.5 0-1.5 1s.7 2.1 1.5 2.6 1.5 0 1.5-1c0-.9-.7-2-1.5-2.6ZM8.1 16c-1-.5-1.7-.1-1.7.9s.8 2.2 1.7 2.8c.8.5 1.6 0 1.6-1S8.9 16.6 8 16Zm3.7 6.2c-1-.5-1.7-.1-1.7 1 0 1 .8 2.2 1.7 2.8 1 .6 1.7.2 1.7-.9 0-1-.7-2.3-1.7-2.9Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "down": {
        "contents": "<path d=\"M10 21 2 8c-3-4 0-4 1-4h26c1 0 4 0 1 4l-8 13c-6 10-6 10-12 0Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "download": {
        "contents": "<path d=\"M27,27C29,27 29,27 29,29L29,30C29,32 29,32 27,32L5,32C3,32 3,32 3,30L3,29C3,27 3,27 5,27L27,27ZM21,12C21,13 21,13 22,13C22,13 25.429,13 27,13C28,13 29,13 28,14C24.841,17.159 16,26 16,26L4,14C3,13 4,13 5,13L10,13C11,13 11,13 11,12L11,1C11,0 11,0 12,0L20,0C21,0 21,0 21,1L21,12Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "edit": {
        "contents": "<path d=\"M26 9v16c0 2-1 3-3 3H3c-2 0-3-1-3-3V5c0-2 1-3 3-3h16l-3 3H5C3 5 3 5 3 7v16c0 2 0 2 2 2h16c2 0 2 0 2-2V12l3-3ZM9 14 20 3c2 0 5 3 5 5L14 19l-6 2H7v-1l2-6Zm.5 1-1 3c1 0 1.5 1.5 1.5 1.5l3-1C13 17 11 15 9.5 15Zm.5-1h1L21 4h-1L10 14ZM28 4c0 1-1 2-1 2l-1.5 1.5c0-2-3-5-5-5L22 1s1-1 2-1c2 0 4 2 4 4Z\"/>",
        "viewBox": "0 0 28 28"
    },
    "eye": {
        "contents": "<path d=\"M16 26C7 26 0 16 0 16S7 6 16 6s16 10 16 10-7 10-16 10Zm0-4c4 0 6-2 6-6 0-3-2-6-6-6-3 0-6 3-6 6 0 4 3 6 6 6Zm0-6c2-2 0-3 0-3a3 3 0 1 1-3 3c0-1 1 2 3 0Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "fill": {
        "contents": "<path d=\"m60 40.7-24 24c-3.6 3.5-16.6-1.5-25-10-8.6-8.5-13-22-10-25l7-7h1l3 4-5 5c-3.6 3.5 2 12 9 19s14.4 11.5 18 8l21-21c-5.8-1.4-11-6-16-11s-9.7-10.3-11-16l-12 12 1 1c3.6 3.7 8.1 6 10 7 .5.4 1 0 1 0a5 5 0 1 1 7 7c-2 2-5 2-7 0-2.2-2.1-2-3-2-3s-5-2-12-9c-8-7.8-6-13.2-3-16 6.3-6.4 13-4.4 14-4l5-5c2.7-2.8 14.4 3.5 23 12a66.6 66.6 0 0 1 14 20 66 66 0 0 1 4 18c0 3.7-1 7-6 7s-6-3-6-7c0-4.1 3.8-7.1 1-10Zm-37-33a10 10 0 0 0-9 3 6 6 0 0 0-1 7l10-10Zm9-2c-2 2 3.2 10.3 9 16 1 1 4.8 0 9 0 4 0 7 3 7 3-2-3-4.7-5.6-7-8-5.8-5.7-16-13.1-18-11Z\"/>",
        "viewBox": "0 0 71 66"
    },
    "float": {
        "contents": "<path d=\"M20 10c2 0 2 0 2 2v18c0 2 0 2-2 2H2c-2 0-2 0-2-2V12c0-2 0-2 2-2h18Zm-2 20c2 0 2 0 2-2V17c0-2 0-2-2-2H4c-2 0-2 0-2 2v11c0 2 0 2 2 2h14Zm-2-13c2 0 2 0 2 2v7c0 2 0 2-2 2H6c-2 0-2 0-2-2v-7c0-2 0-2 2-2h10Zm8 8h5V3H15v5h-3V3H5v5H2V2c0-2 0-2 2-2h26c2 0 2 0 2 2v24c0 2 0 2-2 2h-6v-3Z\"/>\n  <g class=\"icon-offset-shadow\">\n     <path d=\"M20 10c2 0 2 0 2 2v18c0 2 0 2-2 2H2c-2 0-2 0-2-2V12c0-2 0-2 2-2h18Zm-2 20c2 0 2 0 2-2V17c0-2 0-2-2-2H4c-2 0-2 0-2 2v11c0 2 0 2 2 2h14Zm-2-13c2 0 2 0 2 2v7c0 2 0 2-2 2H6c-2 0-2 0-2-2v-7c0-2 0-2 2-2h10Zm8 8h5V3H15v5h-3V3H5v5H2V2c0-2 0-2 2-2h26c2 0 2 0 2 2v24c0 2 0 2-2 2h-6v-3Z\"/>     \n  </g>",
        "viewBox": "0 0 32 32"
    },
    "gelframe": {
        "contents": "<svg xmlns=\"http://www.w3.org/2000/svg\" \n  xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 32 32\">\n    <defs>\n    <radialGradient id=\"myGradient\">\n      <stop offset=\"10%\" stop-color=\"rgb(255 255 255 / 0.4)\" />\n      <stop offset=\"95%\" stop-color=\"rgb(0 0 0 / 0.3)\" />\n    </radialGradient>\n  </defs>\n   <circle class=\"gel-frame-center\" cx=\"16\" cy=\"16\" r=\"8\"/>\n   <path class=\"gel-frame-frame\" d=\"M28 0c4 0 4 0 4 4v24c0 4 0 4-4 4H4c-4 0-4 0-4-4V4c0-4 0-4 4-4h24ZM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 24a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM28 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 24a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z\"/>\n   <circle class=\"gel-frame-center\" fill=\"url('#myGradient')\" cx=\"16\" cy=\"16\" r=\"9\"/>\n   <g class=\"icon-offset-shadow\"> \n      <path class=\"gel-frame-frame\" d=\"M28 0c4 0 4 0 4 4v24c0 4 0 4-4 4H4c-4 0-4 0-4-4V4c0-4 0-4 4-4h24ZM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 24a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM28 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 24a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z\"/>\n   </g>",
        "viewBox": "0 0 32 32"
    },
    "github": {
      "contents": "<path d=\"M23.5 57.8c-9 0-10.2-3.7-10.7-5.5-.5-1.7-1.1-3.8-2.1-4.3-1-.6-3.4-2.2 0-2.2 2.2 0 3.4 3 4.2 4.3.9 1.4 2.9 3.3 5.4 3.3 2.4 0 3.2-.5 3.2-.5l.1-.2a8.8 8.8 0 0 1 2.6-4.6c-14.7 0-15-15.4-15-15.4 0-4 1.4-7.3 3.7-9.8-1.2-2.5-1-5.5 0-8.7a14 14 0 0 1 9.1 3.2 27.1 27.1 0 0 1 16 0 14 14 0 0 1 9-3.2c1 3.2 1.3 6.2 0 8.7 2.4 2.5 3.8 5.8 3.8 9.8 0 0-.3 15.4-15 15.4a8.8 8.8 0 0 1 2.7 6.4v8.8l.3.6h.7A32.7 32.7 0 0 0 64 32.7C64 14.7 49.7.1 32 .1S0 14.7 0 32.7a32.7 32.7 0 0 0 22 31l.5.3.7-.1.3-.6v-5.5Z\"/>",
      "viewBox": "0 0 64 64"
    },
    "handshake": {
        "contents": "<path d=\"M27 46c1-3-3-6-4-5 1-2-2-7-6-4 0-1-4-4-7-1l-1 1-3-3 9-15 6 2v1c-1 1-7 9-1 9 4 0 7-4 9-6 3-3 20 11 20 11 .8.7 1 1.3 3 3 3.5 3 .1 6-3 4l-7.5-5c-3-2-4.5-2-2.5 0l9.5 6.2c2 1 1 5-3 3L38 43c-5-3-4 0 5 4 4 2 1 5.7-2.5 4l-6-3c-1.5-.5-2.5.4 2.5 2.4 3.2 1.3 1 4.5-2 3.5-2-.6-5.3-1.7-5-2 3.2-4.5-1.2-7.7-3-5.9ZM11 13l2 2c1 1 2 1 1 3L5 33c-1 2-2 2-3 1l-2-2 11-19Zm40 4c-1-2-1-2 1-3l2-1 10 19-2 2c-1 1-2 1-3-1l-8-16Zm-26 2c2-2 2-3 9-2l12 2 4-1 8 16s-4.6 4.4-5 4c-3.9-4.2-17.4-15-22-15-2 0-3 0-5 3-3 3-6 4-7 3s6-10 6-10ZM8 41l3-4c2-2 5 0 4 2l-4 5c-2 2-4-1-3-3Zm4 4 5-6c2-3 6 0 4 3l-5 6c-2 3-6 0-4-3Zm5 4 4-5c2-3 6 0 4 3l-5 6c-2 2-6-1-3-4Zm5 4 3-4c2-4 6-1 4 2l-3 4c-2 2-5 0-4-2Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "home": {
        "contents": "<path class=\"Chimney\" d=\"M27 7c0-2 0-2-2-2h-1c-2 0-2 0-2 2v3l5 5V7Z\"/>\n  <path class=\"House\" d=\"M19 10c-3-2-3-2-6 0L3 18c-1 1-3-1-2-2C1 16 14 4 16 4s15 12 15 12c1 1-1 3-2 2l-10-8Zm-2 12h-2c-2 0-2 0-2 2v5H7c-2 0-3-1-3-3v-8l9-7c3-2 3-2 6 0l9 7v8c0 2-1 3-3 3h-6v-5c0-2 0-2-2-2Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "identity": {
        "contents": "<path d=\"M52 63H12C6 63 1 59 1 53V17C1 10 5 6 12 6v6c0 2 2 4 5 4s5-2 5-4V6h20v6c0 2 2 4 5 4s5-2 5-4V6c7 0 11 4 11 11v36c0 6-5 10-11 10Zm2-14c3 0 3-4 0-4H40c-3 0-3 4 0 4h14Zm0-9c3 0 3-4 0-4H40c-3 0-3 4 0 4h14Zm0-9c3 0 3-4 0-4H40c-3 0-3 4 0 4h14Zm-28 7c-3 3-9 3-12 0-3 1-6 5-6 8s6 4 12 4 12-1 12-4-3-7-6-8Zm-6-12c-3 0-6 3-6 6s3 6 6 6 6-3 6-6-3-6-6-6Zm0-14c0 1-1 2-3 2s-3-1-3-2V3c0-1 1-2 3-2s3 1 3 2v9Zm24 0V3c0-1 1-2 3-2s3 1 3 2v9c0 1-1 2-3 2s-3-1-3-2Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "info": {
        "contents": "<path fill-rule=\"nonzero\" d=\"M36 0c20 0 36 16 36 36S56 72 36 72 0 56 0 36 16 0 36 0ZM25 31v3c7-2 9 3 4 14-7 17 12 15 16 12v-3c-12 3-7-6-5-13 5-15-1-18-15-13Zm11-21c-3 0-6 3-6 6s3 6 6 6 6-3 6-6-3-6-6-6Z\"/>",
        "viewBox": "0 0 72 72"
    },
    "layers": {
        "contents": "<path d=\"M29 10c2 0 3 1 3 3v16c0 2-1 3-3 3H13c-2 0-3-1-3-3V13c0-2 1-3 3-3h16ZM8 27c-2 0-3-1-3-3V8c0-2 1-3 3-3h17c2 0 3 1 3 3H11c-2 0-3 1-3 3v16Zm-5-5c-2 0-3-1-3-3V3c0-2 1-3 3-3h17c2 0 3 1 3 3H6C4 3 3 4 3 6v16Z\"/>\n  <g class=\"icon-offset-shadow\"><path d=\"M29 10c2 0 3 1 3 3v16c0 2-1 3-3 3H13c-2 0-3-1-3-3V13c0-2 1-3 3-3h16ZM8 27c-2 0-3-1-3-3V8c0-2 1-3 3-3h17c2 0 3 1 3 3H11c-2 0-3 1-3 3v16Zm-5-5c-2 0-3-1-3-3V3c0-2 1-3 3-3h17c2 0 3 1 3 3H6C4 3 3 4 3 6v16Z\"/></g>",
        "viewBox": "0 0 32 32"
    },
    "lock": {
        "contents": "<path d=\"M26 32H6c-2 0-3-1-3-3V18c0-2 1-3 3-3V9s0-9 10-9 10 9 10 9v6c2 0 3 1 3 3v11c0 2-1 3-3 3Zm-5-17V9s0-4-5-4-5 4-5 4v6h10Zm-6 9-1 3h4l-1-3c5-6-7-6-2 0Z\"/>\n  <g class=\"icon-offset-shadow\"><path d=\"M26 32H6c-2 0-3-1-3-3V18c0-2 1-3 3-3V9s0-9 10-9 10 9 10 9v6c2 0 3 1 3 3v11c0 2-1 3-3 3Zm-5-17V9s0-4-5-4-5 4-5 4v6h10Zm-6 9-1 3h4l-1-3c5-6-7-6-2 0Z\"/></g>",
        "viewBox": "0 0 32 32"
    },
    "mail":{
      "contents" : "<path d=\"M0 49.8V14.2L19.4 32 0 49.8Zm22.4-15 6.2 5.7c.4.3.9.5 1.4.5h4c.5 0 1-.2 1.4-.5l6.2-5.8 20.5 18.8c-1 1-2.4 1.5-3.9 1.5H5.8C4.3 55 3 54.4 2 53.5l20.5-18.8ZM44.6 32 64 14.2v35.6L44.6 32ZM1.9 10.5c1-1 2.4-1.5 3.9-1.5h52.5c1.4 0 2.8.6 3.8 1.5L33.2 37c-.8.4-1.6.4-2.4 0l-29-26.5Z\"/>",
      "viewBox" : "0 0 64 64"
    },
    "main": {
        "contents": "<path d=\"M32 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2c0-2 0-2 2-2h28c2 0 2 0 2 2Zm-3 25V5c0-2 0-2-2-2H13c-2 0-2 0-2 2v22c0 2 0 2 2 2h14c2 0 2 0 2-2ZM13 7c0-2 0-2 2-2h10c2 0 2 0 2 2v18c0 2 0 2-2 2H15c-2 0-2 0-2-2V7ZM8 28V4H3v24h5Z\"/>\n  <g class=\"icon-offset-shadow\">\n       <path d=\"M32 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2c0-2 0-2 2-2h28c2 0 2 0 2 2Zm-3 25V5c0-2 0-2-2-2H13c-2 0-2 0-2 2v22c0 2 0 2 2 2h14c2 0 2 0 2-2ZM13 7c0-2 0-2 2-2h10c2 0 2 0 2 2v18c0 2 0 2-2 2H15c-2 0-2 0-2-2V7ZM8 28V4H3v24h5Z\"/>\n  </g>",
        "viewBox": "0 0 32 32"
    },
    "maximize": {
        "contents": "<path d=\"M0 2c0-2 0-2 2-2h28c2 0 2 0 2 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2Zm29 4H3v23h26V6Z\"/>\n  <path d=\"M27 27h-6v-3h3v-3h3v6ZM5 27v-6h3v3h3v3H5ZM5 8h6v3H8v3H5V8Zm22 0v6h-3v-3h-3V8h6Z\"/>\n  <g class=\"icon-offset-shadow\">\n      <path d=\"M0 2c0-2 0-2 2-2h28c2 0 2 0 2 2v28c0 2 0 2-2 2H2c-2 0-2 0-2-2V2Zm29 4H3v23h26V6Z\"/>\n      <path d=\"M27 27h-6v-3h3v-3h3v6ZM5 27v-6h3v3h3v3H5ZM5 8h6v3H8v3H5V8Zm22 0v6h-3v-3h-3V8h6Z\"/>\n   </g>",
        "viewBox": "0 0 32 32"
    },
    "menu": {
        "contents": "<rect class=\"menu-piece top\"    x=\"1\"  y=\"1\" width=\"28\" height=\"4\" rx=\"2\" ry=\"2\"/>\n    <rect class=\"menu-piece middle\" x=\"1\" y=\"11\" width=\"28\" height=\"4\" rx=\"2\" ry=\"2\"/>\n    <rect class=\"menu-piece bottom\" x=\"1\" y=\"21\" width=\"28\" height=\"4\" rx=\"2\" ry=\"2\"/>",
        "viewBox": "0 0 30 26"
    },
    "minus": {
        "contents": "<path d=\"M64 6v52c0 3-3 6-6 6H6c-3 0-6-3-6-6V6c0-3 3-6 6-6h52c3 0 6 3 6 6ZM50 27H14c-2 0-3 1-3 3v4c0 2 1 3 3 3h36c2 0 3-1 3-3v-4c0-2-1-3-3-3Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "moon": {
        "contents": "<path class=\"gel moon\" d=\"M21 2a32 32 0 0 1 43 30 32 32 0 0 1-63 8A25 25 0 1 0 21 2ZM10.6 22.3l-1.9-2.8H4.8a.5.5 0 0 1-.1-1l2.8-1.8v-3.9c0-.2.2-.5.5-.5.2 0 .4.2.5.4l1.8 2.8h3.9c.2 0 .5.2.5.5 0 .2-.2.4-.4.5l-2.8 1.8v3.8c0 .3-.2.6-.5.6a.5.5 0 0 1-.5-.4h.1Zm22 4L28 21.7l-7 1.8h-.3a.5.5 0 0 1-.3-1l4.9-4.6-1.9-6.8v-.3c0-.2.2-.5.5-.5l.4.3 4.7 4.8 6.8-1.9h.3c.2 0 .5.2.5.4s-.1.4-.3.5L31.6 19l1.9 6.8v.3c0 .2-.2.5-.5.5a.5.5 0 0 1-.4-.3Zm-9 21-4.8-5.8H11a.5.5 0 0 1-.3-.9l5.8-4.8V28c0-.3.2-.5.5-.5.2 0 .3 0 .4.2l5.8 6.8 6.7-1h.3c.2 0 .5.2.5.5l-.3.4-5.9 5.8V47c0 .3-.2.5-.5.5-.2 0-.3 0-.4-.2Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "notification": {
        "contents": "<path  d=\"M20 28c0 2-2 4-4 4s-4-2-4-4h8ZM13 3V2c0-2 2-2 3-2s3 0 3 2v1c6 1 8 5 8 10v9c0 2 2 3 4 3v2H1v-2c2 0 4-1 4-3v-9c0-5 2-9 8-10Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "open": {
        "contents": "<path d=\"M55 21h-6v-1c0-2-1-3-3-3H35c-8 0-9-6-16-6h-8c-3 0-4 1-4 4v34c0 2 0 3 2 3s2-1 3-3l8-22c2-4 3-4 6-4h33c3 0 4 1 4 2l-1 4-8 22c-2 5-4 6-8 6H7c-4 0-6-2-6-6V12c0-3 3-6 6-6h14c8 0 9 6 16 6h12c3 0 6 2 6 5v4Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "pin": {
        "contents": "<path d=\"M26 18c0 2-5 3-10 3S6 20 6 18s0-5 3-5l2-7-2-3C8 1 24 1 23 3l-2 3 2 7c3 0 3 3 3 5Zm-12 4h4v5c0 2-4 2-4 0v-5Zm5 5 1 1c0 2-2 3-4 3s-4-1-4-3l1-1c0 3 6 3 6 0Z\"/>\n  <g class=\"icon-offset-shadow\">\n      <path d=\"M26 18c0 2-5 3-10 3S6 20 6 18s0-5 3-5l2-7-2-3C8 1 24 1 23 3l-2 3 2 7c3 0 3 3 3 5Zm-12 4h4v5c0 2-4 2-4 0v-5Zm5 5 1 1c0 2-2 3-4 3s-4-1-4-3l1-1c0 3 6 3 6 0Z\"/>\n   </g>",
        "viewBox": "0 0 32 32"
    },
    "play": {
        "contents": "<path d=\"M21.75,10C31.75,16 31.75,16 21.75,22L8.75,30C4.75,33 4.75,30 4.75,29L4.75,3C4.75,2 4.75,-1 8.75,2L21.75,10Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "plot": {
        "contents": "<path d=\"M26 23h1l12 6-1 2-11-6-14 13-1-2 14-13Zm26-9L40 29l-2-1 13-16 1 2Z\"/>\n  <path d=\"M27 21a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm11 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm13-15a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 34a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z\"/>\n  <path d=\"M52 64H12c-2 0-2-1-2-3s0-3 2-3h7v-3c0-3 0-4 2-4H5c-3 0-5-2-5-5V5c0-3 2-5 5-5h54c3 0 5 2 5 5v41c0 3-2 5-5 5H43c2 0 2 1 2 4v3h7c2 0 2 1 2 3s0 3-2 3Zm6-58H6v39h52V6Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "plus": {
        "contents": "<path d=\"M64 6v52c0 3-3 6-6 6H6c-3 0-6-3-6-6V6c0-3 3-6 6-6h52c3 0 6 3 6 6ZM27 24c0 2-1 3-3 3H14c-2 0-3 1-3 3v4c0 2 1 3 3 3h10c2 0 3 1 3 3v10c0 2 1 3 3 3h4c2 0 3-1 3-3V40c0-2 1-3 3-3h10c2 0 3-1 3-3v-4c0-2-1-3-3-3H40c-2 0-3-1-3-3V14c0-2-1-3-3-3h-4c-2 0-3 1-3 3v10Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "profile": {
        "contents": "<path d=\"M16 14c0 2-4 2-8 2s-8 0-8-2 1-3 3-3 3-1 3-2V8C5 8 4 7 4 5V4c0-2 2-4 4-4s4 2 4 4v1c0 2-1 3-2 3v1c0 1 1 2 3 2s3 1 3 3Z\"/>",
        "viewBox": "0 0 16 16"
    },
    "question": {
        "contents": "<path d=\"M0 58V6c0-3 3-6 6-6h52c3 0 6 3 6 6v52c0 3-3 6-6 6H6c-3 0-6-3-6-6Zm38-7c0-2-1-3-3-3h-6c-2 0-3 1-3 3v4c0 2 1 3 3 3h6c2 0 3-1 3-3v-4Zm16-36c0-4-5-9-9-9H19c-4 0-9 5-9 9v7c0 2 1 4 3 4h6c2 0 3-2 3-4 0-3 3-6 7-6h6c4 0 7 3 7 6v1c0 3-3 6-6 6h-4c-3 0-6 3-6 6v7c0 1 1 2 3 2h6c2 0 3-1 3-3s2-4 6-4c6 0 10-4 10-9V15Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "refresh": {
        "contents": "<path d=\"M5 7a14 14 0 0 1 25 7h-4c-1-4-5-8-10-8s-8 4-8 4l4 4H2V4l3 3Zm22 18a14 14 0 0 1-25-7h4c1 4 5 8 10 8s8-4 8-4l-4-4h10v10l-3-3Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "resize": {
        "contents": "<path d=\"M7 52a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm34 0a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12ZM24 52a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm34 17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Zm0-17a6 6 0 1 1-1 12 6 6 0 0 1 1-12Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "restore": {
        "contents": "<path d=\"M23 23v7c0 2 0 2-2 2H2c-2 0-2 0-2-2V11c0-2 0-2 2-2h7V2c0-2 0-2 2-2h19c2 0 2 0 2 2v19c0 2 0 2-2 2h-7Zm-3-8H3v14h17V15Zm3 5h6V6H12v3h9c2 0 2 0 2 2v9Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "revert": {
        "contents": "<path d=\"M42 13V1h1l13 14v1H45c-2 0-3-1-3-3Zm15 47c0 2-2 4-4 4H11c-2 0-4-2-4-4V4c0-2 2-4 4-4h24c2 0 4 2 4 4v10c0 3 2 5 5 5h10c2 0 3 1 3 3v38ZM44 33c-2-6-5-11-14-11-12 0-14 13-14 13h-3l5 7 5-7h-3c2-7 8-9 12-9 5 0 9 3 11 7h1ZM18 44c2 6 5 11 14 11 12 0 14-13 14-13h3l-5-7-5 7h3c-2 7-8 9-12 9s-9-3-11-7h-1Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "save": {
        "contents": "<path d=\"M26 28V6c0-4 2-6 6-6h26c4 0 6 2 6 6v52c0 4-2 6-6 6H6c-4 0-6-2-6-6V6c0-4 2-6 6-6h1c2 0 3 0 3 3v47c0 2 2 4 4 4h36c2 0 4-2 4-4V14c0-2-2-4-4-4h-8c-2 0-4 2-4 4v14h10L32 44 16 28h10Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "search": {
        "contents": "<path class=\"Lens\" d=\"M11 0a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM8 16C4 13 4 9 8 6c-2 3-2 7 0 10Z\"/>\n  <path class=\"Handle\" d=\"m17 19 2-2 4 4h1l6 6c1 1 2 2 1 3l-1 1c-1 1-2 0-3-1l-6-6v-1l-4-4Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "shopping": {
        "contents": "<path fill-rule=\"nonzero\" d=\"M2 0C0 0 0 3 2 3s3 0 4 3l2 10-3 5c-1 2-1 3 2 3h22v-3H8l2-3h16c2 0 5-12 5-12 1-3 1-3-2-3H7c0-2-1-3-3-3H2Zm17 5 5 5-5 5v-3h-6V8h6V5Z\"/>\n  <circle cx=\"8\" cy=\"29\" r=\"3\"/>\n  <circle cx=\"26\" cy=\"29\" r=\"3\"/>",
        "viewBox": "0 0 32 32"
    },
    "signout": {
        "contents": "<path d=\"M32 0v32H11v-4h17V4H11V0h21Zm-8 19H12v4c0 2 0 2-2 0l-7-7 7-7c2-2 2-2 2 0v4h12c2 0 2 0 2 2v2c0 2 0 2-2 2Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "sound": {
        "contents": "<path d=\"M44.1 42a2.1 2.1 0 0 1-3.6-2.2 15 15 0 0 0 0-15.6 2.1 2.1 0 0 1 3.6-2.3c3.8 6.2 3.8 14 0 20.2ZM46 18.4a2.1 2.1 0 0 1 3.4-2.5c7 9.7 7 22.7 0 32.4a2.1 2.1 0 0 1-3.4-2.5 23.5 23.5 0 0 0 0-27.4Zm8.5 36a2.1 2.1 0 0 1-3.3-2.8 31.2 31.2 0 0 0 0-39 2.1 2.1 0 0 1 3.3-2.7 35.5 35.5 0 0 1 0 44.4ZM1.7 37V27a4 4 0 0 1 4-4h11l15-16.3A2 2 0 0 1 35.2 8v48a2 2 0 0 1-2 2h-.1a2 2 0 0 1-1.6-.7L16.7 41h-11a4 4 0 0 1-4-4Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "stackOverflow": {
      "contents": "<path d=\"M27 29.2v-8.6h3.4V32H0V20.6h3.4v8.6H27ZM7 19.8l.8-2.8 16.5 2.9-.7 2.8-16.5-3ZM9.4 13l1.4-2.6 15.3 6-1.4 2.6-15.3-6Zm4.2-6.3 2.2-2.2 13 9.1-2.2 2.2-13-9.1ZM22 0 32 11.5l-2.7 1.7-10-11.5L21.8 0ZM6.7 26.3h17v-2.9h-17v2.9Z\"/>",
      "viewBox": "0 0 32 32"
    },
    "star": {
        "contents": "<path d=\"m16 22-8 6c-1 1-2 1-1-1l3-8v-1l-6-5c-2-2-2-2 0-2h8l3-8c1-2 1-2 2 0l3 8h8c2 0 2 0 0 2l-6 5v1l3 8c1 2 0 2-1 1l-8-6Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "stop": {
        "contents": "<path d=\"M30 4v24c0 2 0 2-2 2H4c-2 0-2 0-2-2V4c0-2 0-2 2-2h24c2 0 2 0 2 2Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "sun": {
        "contents": "<path class=\"gel sun\" d=\"M32 15a17 17 0 0 1 17 17 17 17 0 0 1-17 17 17 17 0 0 1-17-17 17 17 0 0 1 17-17ZM12.8 28.5c-.4 2.3-.4 4.7 0 7L0 32l12.8-3.5Zm.8 10c.8 2.3 2 4.3 3.5 6.1L4.3 48l9.3-9.4v-.1Zm5.8 8.4c1.8 1.5 3.8 2.7 6 3.5L16 59.7 19.4 47v-.1Zm9.1 4.3c2.3.4 4.7.4 7 0L32 64l-3.5-12.8Zm10-.8c2.3-.8 4.3-2 6.1-3.5L48 59.7l-9.4-9.3h-.1Zm8.4-5.8c1.5-1.8 2.7-3.8 3.5-6l9.3 9.4L47 44.6h-.1Zm4.3-9.1c.4-2.3.4-4.7 0-7L64 32l-12.8 3.5Zm-.8-10c-.8-2.3-2-4.3-3.5-6.1L59.7 16l-9.3 9.4v.1ZM44.6 17a19.5 19.5 0 0 0-6-3.5L48 4.3 44.6 17Zm-9.1-4.3c-2.3-.4-4.7-.4-7 0L32 0l3.5 12.8v-.1Zm-10 .8c-2.3.8-4.3 2-6.1 3.5L16 4.3l9.4 9.3.1-.1ZM17 19.4a19.5 19.5 0 0 0-3.5 6L4.3 16 17 19.4Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "tab": {
        "contents": "<path d=\"M7 0a6 6 0 0 0 12 0h7a6 6 0 0 0 12 0h7a6 6 0 0 0 12 0h.6C61.1 0 64 2.9 64 6.4v.7a6 6 0 0 0 0 11.8v7.2a6 6 0 0 0 0 11.8v7.2a6 6 0 0 0 0 11.8v.7c0 3.5-2.9 6.4-6.4 6.4h-.7a6 6 0 0 0-11.8 0h-7.2a6 6 0 0 0-11.8 0h-7.2a6 6 0 0 0-11.8 0h-.7A6.4 6.4 0 0 1 0 57.6v-.7a6 6 0 0 0 0-11.8v-7.2a6 6 0 0 0 0-11.8v-7.2A6 6 0 0 0 0 7.1v-.7C0 2.9 2.9 0 6.4 0h.7Zm25 17a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "tag": {
        "contents": "<path d=\"M32 16 18 30c-2 2-5 2-7 0l-9-9c-2-2-2-5 0-7L16 0h16v16Zm-11 3-8-8-1 1 8 8 1-1Zm-6 6-8-8-1 1 8 8 1-1Zm3-3-8-8-1 1 8 8 1-1Zm6-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "terminal": {
        "contents": "<path fill-rule=\"nonzero\" d=\"M0 58V6c0-3 3-6 6-6h52c3 0 6 3 6 6v52c0 3-3 6-6 6H6c-3 0-6-3-6-6Zm14-28v2h3v-2c2 0 5-1 5-5 0-5-9-5-9-8 0-4 8-2 8-1v-3l-3-1v-2h-3v2c-2 0-5 1-5 5 0 5 9 5 9 8 0 4-9 2-9 1v3l4 1Zm25-1H25v3h14v-3Z\"/>",
        "viewBox": "0 0 64 64"
    },
    "trends": {
        "contents": "<path d=\"M8 28H3v-5l4-4h1v9Zm14 0h-5v-5l4-4h1v9Zm6-16 1 1v15h-5V16l4-4Zm-18 9h1l4 4v3h-5v-7ZM26 8l-1-1c-2-2-2-2 3-2h3v3c0 5 0 5-2 3l-1-1-11 11c-2 2-2 2-4 0l-3-3c-2-2-2-2-4 0l-4 4c-1 1-2-2-1-3l5-5c2-2 2-2 4 0l3 3c2 2 2 2 4 0l9-9Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "up": {
        "contents": "<path d=\"M10 11c6-10 6-10 12 0l8 13c3 4 0 4-1 4H3c-1 0-4 0-1-4l8-13Z\"/>",
        "viewBox": "0 0 32 32"
    },
    "warning": {
        "contents": "<path d=\"M48 9C56-3 64-3 72 9l42 73c5 8 6 18-10 18H16C0 100 1 90 6 82L48 9Zm2 23c-2 6 5 31 7 37 1 2 5 2 6 0 2-6 9-31 7-37s-18-6-20 0Zm10 44a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z\"/>",
        "viewBox": "0 0 120 100"
    }
}

const Gelicons = (function(){ 
   const 
      icons = funcs.makeEl('template', {
         id: 'gelicon-templates-container',
         contents: Object.entries(iconIndex) 
            .map(([name, def]) => funcs.makeEl('template', { 
               id: `gelicon-${name}-template`,
               class: name + ' svg-template',
               contents: funcs.makeEl('svg', {
                  contents: def.contents, 
                  viewBox: def.viewBox,
                  class: `gel-${name}-icon gelicon icon` 
               })
            }))
      }).content, 
      getTemplate = (iconName) => icons.querySelector(`template.${iconName}.svg-template`), 
      parseNames = function(el, attr) {     
         
         if (el.hasAttribute('all'))
            return Gelicons.availableIcons; 

         const nameSource = el.hasAttribute(attr) ?
            el.getAttribute(attr).split(/[\,\s]/g)
            : el.getAttributeNames()

         return nameSource.filter( name => name.includes(':') ?
            !(name.split(':').map(Gelicons.iconExists).includes(false))
            : Gelicons.iconExists(name)) 
      }  

      return {
         parseNames,
          
         get availableIcons(){
             return Object.keys(iconIndex)
         },
          
         iconExists: (iconName)=> (iconName=='spacer' || Gelicons.availableIcons.includes(iconName)),
          
         getIcon: (iconName)=> getTemplate(iconName)?.content.cloneNode(true) ?? null,
          
         makeButton(name, opts={}) { 
            const names = [].concat(name.includes(':') ? name.split(':') : name),
                  stopProp = e => e.stopPropagation();

            if (name == 'spacer')
               return funcs.makeEl('span', { class: `gel-strip-spacer` });
            
            return funcs.makeEl('button', { 
               contents: names.map( _name => [
                  funcs.makeEl('span', { class: 'gel-button-description', contents: _name }),
                  Gelicons.getIcon(_name).children[0]
               ]).flat(),
               class: `gel-button ${names.join(' ')}`,   
               title: `${names.join(' & ')} button`, 
               type: 'button',
               listeners: (opts['no-listeners'] ? undefined : ({ 
                  dblclick:    stopProp,
                  pointerdown: stopProp, 
                  click: function(e) { 
                     this.dispatchEvent( 
                     new CustomEvent(
                        opts['event-name'] ?? 'gel-button-command',
                        {  cancelable: true,
                           bubbles:    true,
                           composed:   true,
                           detail : {
                              name:    (opts['btn-id'] ?? name),
                              prefix:   opts['detail-prefix'] ?? ''
                           }
                        }
                     ))}
               }))   
            }) 
         }
      }
})()
 
Object.entries({

   'gel-icon': function(opts) {  
      if (this.name.length)  
         this.replaceChildren(Gelicons.getIcon(this.name))    
   },

   'gel-btn': function(opts) {  
      this.replaceChildren(Gelicons.makeButton(this.name, opts))
   },

   'gel-strip': function(opts) {   
      this.replaceChildren( funcs.makeEl('template', {
         contents: [].concat(this.name).map( name => 
            Gelicons.makeButton(name, opts))  
      }).content )
   }

}).forEach( ([elTag, initFunc]) => {

   if (customElements.get(elTag) === undefined) {

      const nameAttr = {
         'gel-icon'  : 'icon',
         'gel-btn'   : 'button',
         'gel-strip' : 'buttons' }[elTag]; 

      customElements.define(elTag, class extends HTMLElement {

         static get observedAttributes() { return [ nameAttr ] }

         constructor() { super() }

         attributeChangedCallback(prop, oldVal, newVal) { this.connectedCallback() }

         connectedCallback(){
            this.classList.add('gel');
            this.opts = {};
            ['no-listeners','event-name','btn-id','detail-prefix'].forEach(attr=> {
               if (this.hasAttribute(attr))  
                  this.opts[attr] = this.getAttribute(attr)
            });
            this.initialize() 
         } 

         initialize() {
            let names = Gelicons.parseNames(this, nameAttr)  
            if (names.length === 1) { names = names[0] } 
            if (!this.name || (this.name && this.name !== names)){
               this.name = names;
               initFunc.call(this, this.opts )
            } 
         }   
      })  
   }
})  
