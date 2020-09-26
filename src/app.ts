const noble = require('@abandonware/noble');
const chalk = require('chalk');
// https://www.playemulator.com/nes-online/super-mario-bros/
var robot = require("robotjs");

const knownDevices = [];
const LEGO_MARIO_MANUFACTURE_DATA = Buffer.from([0x97,0x03,0x00,0x43,0x0a,0x00,0x41,0x00]).toString('base64');
const LWP_SERVICE_UUID = '00001623-1212-EFDE-1623-785FEABCD123';
const LWP_CHARACTERISTIC_UUID = '00001624-1212-EFDE-1623-785FEABCD123';

const PortId = {
  COLOR_BARCODE: 0x01,
  PANTS: 0x02,
};

//discovered BLE device
const discovered =  async (peripheral : any) => {
    if(peripheral.advertisement.manufacturerData &&
      peripheral.advertisement.manufacturerData.toString('base64') == LEGO_MARIO_MANUFACTURE_DATA)
    {
      console.log('success to connect to LEGO Mario!\n')
      await peripheral.connectAsync();
      const services = await peripheral.discoverServicesAsync([LWP_SERVICE_UUID]);
      
      const characteristics = await services[0].discoverCharacteristicsAsync([LWP_CHARACTERISTIC_UUID]);
      const characteristic = characteristics[0];
      await characteristic.subscribeAsync();
      characteristic.on('data',(data : any, isNotification : any) => {
        if(data.slice(0,4).toString('base64') == Buffer.from([0x07,0x00,0x45,0x01]).toString('base64')){
          /*
          const red = data[4];
          const green = data[5];
          const blue = data[6];
          //console.log(`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`);
          console.log(chalk.hex(`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`).bold('Color'));
          //robot.setKeyboardDelay(5000);
          //robot.keyToggle('right','down');
          */
         console.log(data.slice(1,3).toString('base64'));
        } else {
          console.log(data.slice(0,4).toString('base64'));
        }
        
      });
      characteristic.write(Buffer.from([0x0a,0x00,0x41,0x01,0x01,0x05,0x00,0x00,0x00,0x01]),true);
    }
}

//BLE scan start
const scanStart = () => {
  console.log('finding LEGO Mario...')
    noble.startScanning();
    noble.on('discover', discovered);
}

if(noble.state === 'poweredOn'){
    scanStart();
}else{
    noble.on('stateChange', scanStart);
}
