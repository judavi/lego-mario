import  noble, { Peripheral } from '@abandonware/noble';
import chalk from 'chalk';
import robot from 'robotjs';


const LEGO_MARIO_MANUFACTURE_DATA = Buffer.from([0x97,0x03,0x00,0x43,0x0a,0x00,0x41,0x00]).toString('base64');
const LWP_SERVICE_UUID = '00001623-1212-EFDE-1623-785FEABCD123';
const LWP_CHARACTERISTIC_UUID = '00001624-1212-EFDE-1623-785FEABCD123';
const SUBSCRIBE_IMU_ID = Buffer.from([0x0a,0x00,0x41,0x00,0x00,0x05,0x00,0x00,0x00,0x01]);
const SUBSCRIBE_RGB_ID = Buffer.from([0x0a,0x00,0x41,0x01,0x01,0x05,0x00,0x00,0x00,0x01]);

let posX = 0;
let posY = 0;
let posZ = 0;


//discovered BLE device
const discovered =  async (peripheral : Peripheral) => {
    if(peripheral.advertisement.manufacturerData &&
      peripheral.advertisement.manufacturerData.toString('base64') == LEGO_MARIO_MANUFACTURE_DATA)  {
      console.log('success to connect to LEGO Mario!\n')
      await peripheral.connectAsync();
      const services = await peripheral.discoverServicesAsync([LWP_SERVICE_UUID]);
      const characteristics = await services[0].discoverCharacteristicsAsync([LWP_CHARACTERISTIC_UUID]);
      const characteristic = characteristics[0];
      await characteristic.subscribeAsync();
      characteristic.on('data',(data : any, isNotification : any) => {
        switch (data[0]) {
          // Position
          case 7:
            const x = data[4];
            const y = data[5];
            const z = data[6];
            //console.log(`X ${x } Y ${y}  Z ${z}`);
            //robot.setKeyboardDelay(5000);
            //robot.keyToggle('right','down');
            movement(x, y , z);
            
            break;
          // Camera
          case 8:
            const red = data[4];
            const green = data[5];
            const blue = data[6];
            console.log(chalk.hex(`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`).bold('Color'));
            break;
        
          default:
            break;
        }
        
        
        //console.log(data[0]+data[1]+data[2]);
        /*
        const red = data[4];
            const green = data[5];
            const blue = data[6];
            console.log(chalk.hex(`#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`).bold('Color'));
            */
      });
      characteristic.write(SUBSCRIBE_IMU_ID, true);
      /*
      // Query the different channels 
      while (peripheral.state == 'connected') {

        // Subscribe to Accelerometer channel 
        characteristic.write(SUBSCRIBE_IMU_ID, true);
        // Subscribe to Camera channel 
        await new Promise(resolve => setTimeout(resolve, 100));
        characteristic.write(SUBSCRIBE_RGB_ID,true);
      }
      */
      
    }
}

async function movement ( x: Number , y : number , z : number)  {
  let testX = true;
  let posY = false;
  let testZ = true;
  let jumpToogle = true;

  if(testX) {
    console.log(x);
    if(x < 100 ) {
      robot.keyToggle('up','down');
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
      robot.keyToggle('right','up');
      robot.keyToggle('left','down');
    } else if(z > 100 && z > posZ) {
      console.log('press right');
      robot.keyToggle('left','up');
      robot.keyToggle('right','down');
    } 
    posZ = z;
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
