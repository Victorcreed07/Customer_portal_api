import Action2Model from '../model/action2.js'
import { ComputeManagementClient } from "@azure/arm-compute";
import { ClientSecretCredential } from "@azure/identity";
import { ConsumptionManagementClient } from "@azure/arm-consumption";
import { BillingManagementClient }  from "@azure/arm-billing";
import  {MonitorClient }  from "@azure/arm-monitor";


import mongoose from 'mongoose'
import axios from 'axios'


export const UploadDoc = async(req,res) => {

	const data = req.body;
const modeldata = new Action2Model({...data,creator:req.userid,createdAt: new Date().toISOString()})

	try{
		await modeldata.save()
		return res.status(200).json({message:'Data successfully posted'})
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}

export const getDoc = async (req,res) => {

	

	try{
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		const data = await Action2Model.find({})

		res.status(200).json(data)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}

export const AzureVM = async(req,res) => {

const data = req.body
console.log(data)

try{

const tenantId = data.tenant;
const clientId = data.clientid;
const clientSecret = data.clientsecret;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const subscriptionId = data.subscription;
const computeClient = new ComputeManagementClient(credential, subscriptionId);

const vms = [];

for await (const page of computeClient.virtualMachines.listAll().byPage()) {
  vms.push(...page);
}


// const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName);
// console.log(vm);
const extra = vms?.map((i) => {

	const vmdet = i.id
	const regex = /\/subscriptions\/.+?\/resourceGroups\/(.+?)\/providers\/Microsoft\.Compute\/virtualMachines\/(.+)/;
const match = vmdet.match(regex);


  const resourceGroup = match[1];
  const vmName = match[2];



	return {

		resourceGroupName:resourceGroup,
		vmName:vmName
	}
})

console.log(extra)
async function getIpAndStatus(extra) {
  const result = [];

  for (const i of extra) {
    const vm = await computeClient.virtualMachines.get(i.resourceGroupName, i.vmName, { expand: "instanceView" });
    // const ipAddress = vm.networkProfile.networkInterfaces[0];

    // const nicId = vm.networkProfile.networkInterfaces[0].id;
    
    // console.log(vm,nicId)
// const nic = await computeClient.networkInterfaces.get(nicId);
// console.log(nic)
// const ipAddress = nic.ipConfigurations[0].privateIpAddress;

    const status = vm.instanceView.statuses[1].displayStatus;

    result.push({
      status: status
    });
  }

  return result;
}

const newdata = await getIpAndStatus(extra);
console.log(newdata)

// console.log(`VM IP address: ${ipAddress}`);
// console.log(`VM status: ${status}`);
// console.log(vm1)
res.status(200).json({Allvms:vms,status:newdata})
// console.log(vms);

// Call the describeInstances method to retrieve all EC2 instances


}

catch(err)
{
console.log(err)
res.status(409).json({message:err})

}

	}

export const AzureCost = async(req,res) => {

		const data = req.body
		console.log(data)
		
		try{
		
		const tenantId = data.tenant;
		const clientId = data.clientid;
		const clientSecret = data.clientsecret;
		const subscriptionId = data.subscription;
		const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
		const url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Consumption/usageDetails?api-version=2017-06-30-preview&$filter=properties/usageStart ge '2023-08-01T00:00:00Z' and properties/usageEnd le '2023-08-31T23:59:59Z'`
		
		// const consumptionClient = new ConsumptionManagementClient(credential, subscriptionId);
		
		
			
				// Specify the billing period name (e.g., "2023-07")
				const billingPeriodName = "2023-07";

				credential.getToken('https://management.azure.com/.default')
  .then(tokenResponse => {
    const accessToken = tokenResponse.token;
	console.log(accessToken)
    // Configure Axios with authentication headers
    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    };

    // Make the authenticated API request
    axios.get(url, axiosConfig)
      .then(response => {
        // Handle the response data here
        console.log('Response:', response.data);
		let totalCost = 0;
		const usageDetails = response.data.value;
		usageDetails.forEach(detail => {
		  totalCost += detail.properties.pretaxCost; // or detail.properties.totalCost
		});
	
		console.log(`Total cost for the month: $${totalCost.toFixed(2)}`);
		res.status(200).json({values:usageDetails,totalCost:totalCost})
      })
      .catch(error => {
        // Handle errors here
        console.error('Error:', error);
		res.status(409).json({message:error})
      });
  })
  
		
				// Fetch the list of usage details for the specified billing period
				// const usageDetails = await consumptionClient.usageDetails.list({
				// 	billingPeriodName: billingPeriodName
				// });
				// const asyncIterator = usageDetails[Symbol.asyncIterator]();
				// const asyncIteratorResult = await asyncIterator.next();
				// // const asyncIteratorValue = asyncIteratorResult.value;
				// // console.log(asyncIteratorValue.toString()); // Logs: "hello"
				// console.log(asyncIteratorResult)
				// res.status(200).json(usageDetails)
		
				// // Process the usage details as needed
				// console.log("Usage details for billing period", billingPeriodName, ":", usageDetails);
			} 
			catch (err) {
				console.error("Error fetching Azure cost data:", error.message);
				res.status(409).json({message:err})
			}
		}

		
		
		
		
		
		// const vm = await computeClient.virtualMachines.get(resourceGroupName, vmName);
		// console.log(vm);
	
		
		
		
		
		
		
		
		
		
		
		

		



export const AzureRsg = async(req,res) => {

	const data = req.body
	console.log(data)
	const tenantId = data.tenant;
const clientId = data.clientid;
const clientSecret = data.clientsecret;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

	const subscriptionId = data.subscription;
	const token = await credential.getToken("https://management.azure.com/.default");
		const headers = {
  "Authorization": `Bearer ${token.token}`,
  "Content-Type": "application/json"
};

const endpoint = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2021-04-01`

axios.get(endpoint, {
  headers: headers

}).then((response) => {
  console.log(response.data);
  res.status(200).json(response.data)
}).catch((error) => {
  console.log(error);
});


}

export const Azurelistvm = async(req,res) => {

	const data = req.body.sub
	const resgrp = req.body.rsg
	console.log(data)
	const tenantId = data.tenant;
const clientId = data.clientid;
const clientSecret = data.clientsecret;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

	const subscriptionId = data.subscription;
	const token = await credential.getToken("https://management.azure.com/.default");
		const headers = {
  "Authorization": `Bearer ${token.token}`,
  "Content-Type": "application/json"
};

const endpoint = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resgrp}/resources?api-version=2021-04-01`

axios.get(endpoint, {
  headers: headers

}).then((response) => {
  console.log(response.data);
  res.status(200).json(response.data)
}).catch((error) => {
  console.log(error);
});


}


export const AzureMetric = async(req,res) => {

	const data = req.body
	console.log(data)
	const tenantId = data.cred.tenant;
const clientId = data.cred.clientid;
const clientSecret = data.cred.clientsecret;
const metric = (data.params.metric).replace(/ /g, "%20");
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const subscriptionId = data.cred.subscription;
console.log(typeof(subscriptionId))
// const client = new MonitorClient(credential, subscriptionId);
// const resourceGroupName = "DEFAULTRESOURCEGROUP-EUS";
// const resourceName = "kokki78";
// const interval = "PT1H"; // 1 hour interval
// const timeSpan = "P7D"; // last 7 days
// const metricName = "Percentage CPU";
// const aggregation = {
//   type: "Average",
//   field: "total"
// };

//eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2IwNDQ3YjM5LTIzZGYtNGQxNi05MGIwLTJlMjFkY2VmZjM3My8iLCJpYXQiOjE2ODM0NDQ3OTUsIm5iZiI6MTY4MzQ0NDc5NSwiZXhwIjoxNjgzNDQ5MjczLCJhY3IiOiIxIiwiYWlvIjoiQVlRQWUvOFRBQUFBWU9kaDcva3FwaTBrT1E5SzlKbEw2T0tXZHN2YUtWWUlUQkVyTVg4SzMxejVlZWFTYWRuNlJEbXdNa01xdUp5ODQrWVVOS3BqUnprT2FvSGdqY0cwQUpvcHlObFZpMmtGSnl1UFZwWDZHSDVqb3UveWVLWEhnNGRkRkhRNjJTblgyUGdQNU1peDR3YXhkZTRqbGs2OC94ZFBiamR0ZE9NbWk1Z0Fla0pRYzVVPSIsImFsdHNlY2lkIjoiMTpsaXZlLmNvbTowMDAzMDAwMDVBMkVFNjJDIiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBpZCI6IjE4ZmJjYTE2LTIyMjQtNDVmNi04NWIwLWY3YmYyYjM5YjNmMyIsImFwcGlkYWNyIjoiMCIsImVtYWlsIjoic2lkZGhhcmRoYXNpZGR1MzMzQGdtYWlsLmNvbSIsImZhbWlseV9uYW1lIjoiVCIsImdpdmVuX25hbWUiOiJTaWRkaGFyZGhhIiwiZ3JvdXBzIjpbIjFkZWZiNTQ5LWVjYTQtNDUyNi1iOTlkLWE1NzhkOTU0YWRkZiJdLCJpZHAiOiJsaXZlLmNvbSIsImlwYWRkciI6IjI0MDE6NDkwMDoxY2M5OmM0YTg6ZTRlZjo2YTA3OmQxMjk6NDk2NSIsIm5hbWUiOiJTaWRkaGFyZGhhIFQiLCJvaWQiOiIyYzAxNGZlOC1hYjg2LTRmZTMtYmZjYi0zNDVmNmRmNjM3ZTciLCJwdWlkIjoiMTAwMzIwMDI4MjZFRDhGMyIsInJoIjoiMC5BVllBT1h0RXNOOGpGazJRc0M0aDNPX3pjMFpJZjNrQXV0ZFB1a1Bhd2ZqMk1CT2ZBUEkuIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiUE5SZEZrc3J5VG1BMF9jeFpFcU1mYTFUbjIzOHc3aVM4UU5hdi1ZLVpydyIsInRpZCI6ImIwNDQ3YjM5LTIzZGYtNGQxNi05MGIwLTJlMjFkY2VmZjM3MyIsInVuaXF1ZV9uYW1lIjoibGl2ZS5jb20jc2lkZGhhcmRoYXNpZGR1MzMzQGdtYWlsLmNvbSIsInV0aSI6IjVVaUFQVEFoNlVpTXdnbGlYTVZhQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCIsImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfdGNkdCI6MTY3ODM0OTI1MX0.TlD7Wydvv_6rJ37EVtmMbGasyDupgPm7jtqbQkaeC4DL1QRSdF1aIrKCfT_Xlo_TV8lNEEMSm-5ruesfyG9uvTmiKSm3PsBnJGigKabhWdQXGGzirw8YDrJcjSaTn2rZv0vIV78LdngGUgh9JRrXD3AlkeuXEnmdBoxOs0v2LdCsKaZqaY8pC6KZV5AOHsLtvaoQLaWKba9TudCRxW3DrSOB4rHYW2HORAfU58ZwHRsvmjXEvHoEnA2CMhwU_UO0aApOWG5q-0dsufqZMblbtv3SUp88HO7VrV715ktZye8lSrvCMdnPJ3YHgDwzyafrw03s4ka11zKIhJBxxqvFdQ

	try{

		const token = await credential.getToken("https://management.azure.com/.default");

const params = {
  api_version: "2018-01-01",
  interval: "PT1H",
  metricnames: "Percentage CPU",
  timespan: "P7D"
};
		const headers = {
  "Authorization": `Bearer ${token.token}`,
  "Content-Type": "application/json"
};

const endpoint = `https://management.azure.com//subscriptions/${subscriptionId}/resourceGroups/${data.params.resgrp}/providers/Microsoft.Compute/virtualMachines/${data.params.vm}/providers/Microsoft.Insights/metrics?api-version=2018-01-01&interval=${data.params.value2}&metricnames=${metric}&timespan=${data.params.value}`

console.log(endpoint)
axios.get(endpoint, {
  headers: headers

}).then((response) => {
  console.log(response.data);
  res.status(200).json(response.data)
}).catch((error) => {
  console.log(error);
});


// 		const resourceGroupName = 'DEFAULTRESOURCEGROUP-EUS';
// const vmName = 'kokki78';
// const filter = "name.value eq 'Percentage CPU'";
// const options = {
//   metricnames: 'Percentage CPU',
//   timespan: 'P7D'
// };




	}
	catch(err)
	{
		res.status(409).json(err)
		console.log(err)

	}
}


// export const AzureCost = async(req,res) => {

// const data = req.body
// console.log(data)

// try{

// const tenantId = data.tenant;
// const clientId = data.clientid;
// const clientSecret = data.clientsecret;

// const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
// const billingPeriodName = "202305-1";
// const subscriptionId = data.subscription;
// console.log(typeof(subscriptionId))
// const billingClient = new BillingManagementClient(credential, subscriptionId);
// const client = new ConsumptionManagementClient(credential, subscriptionId);

// // const usageDetails = await billingClient.usageDetails.list('202305-1');


// // Promise.resolve(client.usageDetails.list({
// //   billingPeriodName: billingPeriodName
// // })).then((result) => {
// //   console.log(result);
// // }).catch((err) => {
// //   console.log(err);
// // });

// Promise.resolve(client.usageDetails.list({
//   billingPeriodName: billingPeriodName
// })).then(async (iterator) => {
//   for await (const page of iterator) {
//     for (const usageDetail of page) {
//       console.log(usageDetail);
//     }
//   }
// }).catch((err) => {
//   console.log(err);
// });



// // async function listUsageDetails() {
// //   for await (const usageDetail of client.usageDetails.list({
// //     billingPeriodName: billingPeriodName
// //   })) {
// //     console.log(usageDetail);
// //   }
// // }

// // listUsageDetails().catch((err) => {
// //   console.log(err);
// // });


// async function getBillingData() {
//   const billingPeriods = await billingClient.billingPeriods.list();

//   for await (const billingPeriod of billingPeriods) {

  	
//   // console.log(`Invoices for billing period ${billingPeriod.name}:`);
  
// //   	if(billingPeriod?.invoiceIds)
// //   	{
// //   		const invoiceDetails = await billingClient.invoices.get(billingPeriod.name, billingPeriod.invoiceIds[0]);
// // console.log(invoiceDetails);
// //   	}
  	
//   // console.log(billingPeriod)
// }

//   // for await (const billingPeriod of billingPeriods) {
//   //   const usageDetails = await billingClient.usageDetails.list(billingPeriod.name);
//   //   console.log(`Usage details for billing period ${billingPeriod.name}:`);
//   //   // for (const usageDetail of usageDetails) {
//   //   //   console.log(`Cost for ${usageDetail.meterDetails.meterName}: ${usageDetail.meterDetails.usageGrossCost}`);
//   //   // }
//   // }
//   // console.log(usageDetails)
// }


// getBillingData();

// res.status(200).json("Hi")

// }

// catch(err)
// {
// console.log(err)
// res.status(409).json({message:err})

// }

// 	}

