# LEGO Mario 

This is a code for using LEGO Mario as a controller for playing on any generic emulator website like [Super Mario HTML5](https://supermarioemulator.com/supermario.php)

If you need to change the keymap for your own emulator/game change the lines from here:

That's it! enjoy!

## Requisites

- Node
- Typescript
- XCode: abandonaware/noble is the library used for Bluetooth communication needs xcode for building the module
- A Lego Mario!

## Usage

First be sure that Typescript is installed and then:

```
npm install
node js/app.js
```

and push pairing button on back of LEGO Mario.

# Disclaimer

Only tested on MacOS 


# Credits

This project is inspired by the initial work of [nearprosmith](https://github.com/nearprosmith/legomario-on-mac)
and the documentation from [Lego Mario Reverse Engineering](https://github.com/bricklife/LEGO-Mario-Reveng)
