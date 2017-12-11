var noble = require("noble");

const PERIPHERAL_NAME = "Adafruit Bluefruit LE";
const SERVICE_UUID = "6e400001b5a3f393e0a9e50e24dcca9e";
const CHARACTERISTIC_UUID = "6e400002b5a3f393e0a9e50e24dcca9e";

// Scan for bluetooth devices
console.log(`Discovering devices ...`);
noble.on("stateChange", function(state) {
  if (state === "poweredOn") {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on("discover", function(peripheral) {
  let deviceName = peripheral.advertisement.localName;
  // Discovered device
  console.log(`${deviceName}`);

  // Is it the one we are looking for?
  if (deviceName === PERIPHERAL_NAME) {
    noble.stopScanning();

    // printDeviceInfo(peripheral);

    // Exit program if disconnected
    peripheral.on("disconnect", function() {
      process.exit(0);
    });

    // Try to connect to device
    console.log(`Connecting to ${deviceName} ...`);
    peripheral.connect(function(error) {
      console.log(`Success`);

      let serviceUUIDs = [SERVICE_UUID];
      let characteristicUUIDs = [CHARACTERISTIC_UUID];

      console.log(`Discovering service and characteristics ...`);
      peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        (error, services, characteristics) => {
          if (error) {
            console.log(`Failed.  Unable to discover services`);
            return;
          }
          console.log(`Success`);

          // printServiceInfo(services, characteristics);

          let buffer = Buffer.alloc(6);
          buffer.write("!C");
          buffer.writeUInt8(0, 2);
          buffer.writeUInt8(0, 3);
          buffer.writeUInt8(255, 4);

          // let checksum = calcCRC(buffer);
          // buffer.writeInt8(checksum, 5);

          // Send change color
          characteristics[0].write(buffer, false, err => {
            if (err) {
              console.log(`Failed to write to device service`);
              return;
            }
            console.log(`sent color!`);
          });
        }
      );

      setTimeout(() => {
        peripheral.disconnect();
      }, 5000);
    });
  }
});

function calcCRC(buffer) {
  let checksum = 0;
  for (let i = 0; i < buffer.length - 1; i++) {
    checksum += buffer.readUInt8(i);
  }
  // truncate to only 8 bits
  checksum = checksum & ((1 << 8) - 1);
  checksum = ~checksum;
  console.log(checksum);
  return checksum;
}

function printDeviceInfo(peripheral) {
  var advertisement = peripheral.advertisement;
  var localName = advertisement.localName;
  var txPowerLevel = advertisement.txPowerLevel;
  var manufacturerData = advertisement.manufacturerData;
  var serviceData = advertisement.serviceData;
  var serviceUuids = advertisement.serviceUuids;

  // console.log(`Local Name: ${localName}`);
  // console.log(`TX Power Level: ${txPowerLevel}`);
  // console.log(`Manufacturer Data: ${manufacturerData.toString("hex")}`);
  // console.log(`Service Data: ${serviceData}`);
  // console.log(`Service UUIDs: ${serviceUuids}`);
}

function printServiceInfo(services, characteristics) {
  console.log(`SERVICE: ${services}`);
  console.log(`CHARACTERISTICS:  ${characteristics}`);
}
