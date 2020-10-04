import  noble, { Peripheral } from '@abandonware/noble';
import chalk from 'chalk';
import robot from 'robotjs';

// Change for your own keyboard mapping here
let keyLeft = 'left';
let keyRight = 'right';
let keyJump = 'up';


const LEGO_MARIO_MANUFACTURE_DATA = Buffer.from([0x97,0x03,0x00,0x43,0x0a,0x00,0x41,0x00]).toString('base64');
const LWP_SERVICE_UUID = '00001623-1212-EFDE-1623-785FEABCD123';
const LWP_CHARACTERISTIC_UUID = '00001624-1212-EFDE-1623-785FEABCD123';
const SUBSCRIBE_IMU_ID = Buffer.from([0x0a,0x00,0x41,0x00,0x00,0x05,0x00,0x00,0x00,0x01]);
const SUBSCRIBE_RGB_ID = Buffer.from([0x0a,0x00,0x41,0x01,0x01,0x05,0x00,0x00,0x00,0x01]);

let posX = 0;
let posY = 0;
let posZ = 0;
let jumpToogle = true;
let pipeToogle = true;


//discovered BLE device
const discovered =  async (peripheral : Peripheral) => {
    if(peripheral.advertisement.manufacturerData &&
      peripheral.advertisement.manufacturerData.toString('base64') == LEGO_MARIO_MANUFACTURE_DATA)  {
      console.log('Success to connect to LEGO Mario!\n')
      await peripheral.connectAsync();
      const services = await peripheral.discoverServicesAsync([LWP_SERVICE_UUID]);
      const characteristics = await services[0].discoverCharacteristicsAsync([LWP_CHARACTERISTIC_UUID]);
      const characteristic = characteristics[0];
      await characteristic.subscribeAsync();
      characteristic.on('data',(data : any, isNotification : any) => {
        console.log(data[0]);
        switch (data[0]) {
          // Position
          case 10:
            const x = data[4];
            const y = data[5];
            const z = data[6];
            console.log(`Accelerometer X: ${x} Y:${y} Z:${z}`);
            //movement(x, y , z);
            
            break;
          // Camera
          case 7:
            const red = data[4];
            const green = data[5];
            const blue = data[6];
            //console.log(`color X: ${red} Y:${green} Z:${blue}`);
            //console.log(chalk.hex(`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`).bold('Color'));
            //movementPipes(red, green, blue);
            break;
        
          default:
            break;
        }

      });

      //characteristic.write(SUBSCRIBE_RGB_ID,true);
      //characteristic.write(SUBSCRIBE_IMU_ID, true);
      
      // Query the different channels 
      console.log('saaaaaaaaaa' + peripheral.state == 'connected');
      while (true) {

        // Subscribe to Accelerometer channel 
        characteristic.write(SUBSCRIBE_IMU_ID, true);
        
        await new Promise(resolve => setTimeout(resolve, 120));

        // Subscribe to Camera channel 
        characteristic.write(SUBSCRIBE_RGB_ID,true);
      }
      
      
    }
}

async function movementPipes(red : Number , green : Number , blue : Number) {
  if(blue.toString(16) == "0x25") {
    console.log('Greeen')
    robot.keyToggle('down','down');
    pipeToogle = true;
  } else {
    if(pipeToogle) {
      robot.keyToggle('down','up');
      pipeToogle = false;
    }
  }
}


// The move
async function movement ( x: Number , y : number , z : number)  {
  let testX = true;
  let posY = false;
  let testZ = true;

  // Jump
  if(testX) {
    console.log(x);
    if(x < 100 ) {
      robot.keyToggle(keyJump,'down');
      jumpToogle = true;
      console.log('x');
    } else {
      if(jumpToogle) {
        robot.keyToggle('up','up');
        jumpToogle = false;
      }
    }
  }
  
  // Linear movement 
  if(testZ) {
    //console.log('z : ' + z  + 'posZ : '+ posZ);
    if(z < 100 && z < posZ) {
      console.log('press left');
      robot.keyToggle(keyRight,'up');
      robot.keyToggle(keyLeft,'down');
    } else if(z > 100 && z > posZ) {
      console.log('press right');
      robot.keyToggle(keyLeft,'up');
      robot.keyToggle(keyRight,'down');
    } 
    posZ = z;
  }
  
}


//BLE scan start
const scanStart = () => {
  console.log('Finding LEGO Mario...')
    noble.startScanning();
    noble.on('discover', discovered);
}

if(noble.state === 'poweredOn'){
    scanStart();
}else{
    noble.on('stateChange', scanStart);
}
