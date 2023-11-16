import { faker } from '@faker-js/faker';
import delay from 'delay';
import fs from 'fs';
import Mailjs from "@cemalgnlts/mailjs";
const mailjs = new Mailjs();
import axios from 'axios';
import cluster from 'cluster';
import os from 'os';





function generateRandom(length) {
	const characters = '0123456789';
	let randomString = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}

	return randomString;
}


function get_between(string, start, end) {
	string = ' ' + string;
	let ini = string.indexOf(start);
	if (ini == 0) return '';
	ini += start.length;
	let len = string.indexOf(end, ini) - ini;
	return string.substr(ini, len);
}

const options = {
	retry: 5,
	timeout: 3000,
};


async function register(email, username, password, deviceId, reff_id) {
	try {
		const headers = {
  		'accept': 'application/json, text/plain, */*',
			'version': '1',
			'app-build-number': '179',
			'app-version': '4.1.2',
			'platform-os': 'android',
			'Content-Type': 'application/json',
			'Host': 'api.release.oxygean.com',
			'User-Agent': 'okhttp/4.9.2',
		};

		const data = {
			data: {
				email: email,
				username: username,
				password: password,
			},
			meta: {
				deviceId: deviceId,
				provider: 'default',
				invitedBy: reff_id,
			},
		};

		const response = await axios.post('https://api.release.oxygean.com/auth/register', data, { headers });
		console.log(response.data);
		
	} catch (error) {
		console.error('Error making requests:', error);
	}
}

async function get_referral_id(link_reff) {
	try {
		const headers = {
  		'Content-Type': 'application/json',
	    'Accept': 'application/json',
	    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 12; M2101K9AG Build/SKQ1.210908.001)',
	    'Host': 'api2.branch.io',
	    'Connection': 'close',
	    'Accept-Encoding': 'gzip, deflate',
		};

		const data = {
			"hardware_id": "14e52c28-ed6c-4ffa-b9ab-ddc9eb578ce5",
			"is_hardware_id_real": true,
			"anon_id": generateRandom(8)+"-369e-4397-8de8-a056c75a744c",
			"brand": "Xiaomi",
			"model": "M2101K9AG",
			"screen_dpi": 440,
			"screen_height": 2252,
			"screen_width": 1080,
			"wifi": true,
			"ui_mode": "UI_MODE_TYPE_NORMAL",
			"os": "Android",
			"os_version": 31,
			"cpu_type": "aarch64",
			"build": "SKQ1.210908.001 test-keys",
			"locale": "in_ID",
			"connection_type": "wifi",
			"device_carrier": "by.U",
			"os_version_android": "12",
			"plugin_name": "ReactNative",
			"plugin_version": "5.9.0",
			"country": "ID",
			"language": "in",
			"local_ip": "192.168.1.5",
			"debug": false,
			"partner_data": {},
			"app_version": "4.1.2",
			"initial_referrer": "android-app://org.mozilla.firefox",
			"update": 0,
			"latest_install_time": 1696568199478,
			"latest_update_time": 1696568199478,
			"first_install_time": 1696568199478,
			"previous_update_time": 0,
			"environment": "FULL_APP",
			"android_app_link_url": link_reff,
			"external_intent_uri": link_reff,
			"metadata": {},
			"advertising_ids": {
				"aaid": "00000000-0000-0000-0000-000000000000"
			},
			"lat_val": 0,
			"google_advertising_id": "00000000-0000-0000-0000-000000000000",
			"instrumentation": {
				"v1/install-qwt": "0"
			},
			"sdk": "android5.7.0",
			"branch_key": "key_live_pcWH05hbqP8BooS0a9RJAkjeuCaGL0DS",
			"retryNumber": 0
		};

		const response = await axios.post('https://api2.branch.io/v1/install', data, { headers })
		const re_data = response.data.data;
		const reff_id = get_between(re_data, '"code":"','"');

		return {
			reff_id,
		}
		
	} catch (error) {
		console.error('Error making requests:', error);
	}
}






async function run(link_reff) {


		const create = await mailjs.createOneAccount();
		const email = create.data.username;
		const password = create.data.password;
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const username = faker.person.firstName()+generateRandom(4);
		const name = faker.person.fullName();
		const lowerCaseString = username.toLowerCase();

		const exec_get = await get_referral_id(link_reff);

		const deviceId = generateRandom(4)+'bb3014f'+generateRandom(5);

		const exec_reg = await register(email, lowerCaseString, password, deviceId, exec_get.reff_id);



}



const numIterations = 1; // Number of iterations

if (cluster.isMaster) {
  // Get the number of available CPU cores
  const numCPUs = os.cpus().length;

  // Create worker processes for each core
  for (let i = 0; i < 1; i++) {
    cluster.fork();
  }

  // Handle worker process exits and respawn if needed
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {

  async function runRepeatedly(iterations) {
	  const link_reff = process.argv[2] || 'https://share-oxygean.app.link/d5AJYvjexDb'; // Use the first command-line argument as code_reff, or a default value if not provided

	  for (let i = 0; i < iterations; i++) {
	    await run(link_reff); // Pass code_reff as an argument
	    await delay(5000);

	  }
	  process.exit(0); // Worker finished its task
	}

	console.log(`Worker ${process.pid} started`);
	runRepeatedly(numIterations); // No need to pass code_reff here

}





