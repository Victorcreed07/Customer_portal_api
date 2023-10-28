



import axios from 'axios'

import { Authenticate,GetHosts,GetItems } from './ZabbixCommunication.js'
import { v4 as uuidv4 } from 'uuid';



 

const TanmaiahReport = async() => {

  async function getFirstAndLastDayOfLastMonth() {
    // Get the current date
    var currentDate = new Date();
  
    // Calculate the first day of the current month
    var firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
    // Subtract one day from the first day of the current month to get the last day of the previous month
    var lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth);
    lastDayOfPreviousMonth.setDate(firstDayOfCurrentMonth.getDate() - 1);
  
    // Calculate the first day of the last month
    var firstDayOfLastMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);
  
    return {
      firstDayOfLastMonth: firstDayOfLastMonth,
      lastDayOfLastMonth: firstDayOfCurrentMonth
    };
  }
  
  // Get the first day and last day of the last month
  var dates =await getFirstAndLastDayOfLastMonth();
  
  // Format the dates as desired
  var formattedFirstDayOfLastMonth = dates.firstDayOfLastMonth.toString();
  var formattedLastDayOfLastMonth = dates.lastDayOfLastMonth.toString();
  
   const converttoUnix = async(val) => {


       const dateObj = new Date(val);

       // Get the Unix timestamp (time in milliseconds since January 1, 1970)
       const unixTimestamp = dateObj.getTime();
       return unixTimestamp / 1000

   }


  let host
  let tservice
  let disabled = true
  let mservice
  let clicked = true
  let average = 99
  let average2 = 99
  let load = true
  let from=await converttoUnix(formattedFirstDayOfLastMonth)
  let to =await converttoUnix(formattedLastDayOfLastMonth)
  let from1 = ''
  let to1 = ''
  let token = ""
  let link = ""

  console.log(formattedFirstDayOfLastMonth)
  console.log(from)





  let service1 = {
    SPFMRNAPRDSQL: [],
    SPFPOPRDNIMSH: [],
    SPFPOPRDDISP: [],
    SPFPOPRDJAVA: [],
    SPFPOPRDGATEWAY: [],
    SPFPOPRDSMTP: [],
    SPFDMSPRDDMS: [], 
    SPFPOWBISQL: [], 
  };

  let tanmiah = {
    EY: [],
    MrnaPrd: [],
    APPR: [],
    PowerBI: [],
    POPrd: [],
    DMSPrd: [],
    TaxDbPrd: [],
    TaxPrd: [],
    EccPrd: []

  }


  let arr1 = []
  let arr3 = []


  const data = [
    {
      labels: ['Unavailability', 'Availability'],
      values: [100 - average, average],
      type: 'pie'
    }
  ];

  const data2 = [
    {
      labels: ['Unavailability', 'Availability'],
      values: [100 - average2, average2],
      type: 'pie'
    }
  ];

  const layout = {
    title: 'Host Availability'
  };

  const layout2 = {
    title: 'Services Availability'
  };

 


  //zabbix authentication

  const zabbixauthentication = {
    content: {
      jsonrpc: '2.0',
      method: 'user.login',
      params: { user: 'kcroadmin', password: 'ie%{sHdiMEd60P@' },
      id: 1,
      auth: null
    },
    header: { 'Content-Type': 'application/json-rpc' },
    url: 'http://172.17.36.68/zabbix'
  }

  async function doAuthentication() {
    try {
      token =  await Authenticate(zabbixauthentication);
    } catch (error) {
      console.error(error);
    }
  }

  await doAuthentication();

  console.log('token--',token)

  const requestBody3 = {
    jsonrpc: '2.0',
    method: 'item.get',
    params: {
      output: ['itemid', 'name', 'key_', 'lastvalue'],
      hostids: [
        '10572', '10573', '10574', '10575',
        '10579', '10580', '10582', '10587', '10596'
      ],
      selectTags: ['tag', 'value'],
      evaltype: 0,
      tags: [
        { tag: 'Application', value: 'SAP', operator: 0 },
        { tag: 'Application', value: 'SQL', operator: 0 }
      ],

    },
    auth: token,
    id: 1
  };

  const requestBody4 = {
    jsonrpc: "2.0",
    method: "trend.get",
    params: {
      output: "extend",
      itemids: [
        "53167", "53125", "53115",
        "53110", "53113", "53108", "53106", "53152"
      ],
      time_from: from ? from : '1693566435',
      time_till: to ? to : '1695208035',
    },
    id: 1,
    auth: token,
  };



  const newbody = {

    content: requestBody3,
    header: { 'Content-Type': 'application/json-rpc' },
    url: zabbixauthentication.url,
  };

  const newbody2 = {

    content: requestBody4,
    header: { 'Content-Type': 'application/json-rpc' },
    url: zabbixauthentication.url,
  };


     const response = await GetHosts(newbody)

      const newarr = await response.result.map((i) => {

        return {
          itemid: i.itemid,
          host: i.name.split('-').slice(0, -1).join(''),
          name: i.name,
          key: i.key_

        }
      })

      

      await newarr.sort((a, b) => {
        if (a.host < b.host) {
          return -1;
        } else if (a.host > b.host) {
          return 1;
        } else {
          return a.id - b.id;
        }
      });

      let lastCategory = null;

      console.log('--sorted Array -------')
      console.log(newarr)


      const newRows = await newarr.map((row) => {
        if (row.host !== lastCategory) {
          lastCategory = row.host;
          return row;
        } else {
          return { ...row, host: '' };
        }
      });

      // tservice=newRows
      tservice =newarr
      console.log('----------')
      console.log('new rows')
      console.log(tservice)


      const response2 = await GetHosts(newbody2)

          console.log('tanmaiah service data')

          const tandata = response2?.result;
          
            service1 = await {
              ...service1,
              
              SPFPOWBISQL:await tandata.filter((i) => i.itemid === '53167'),
              SPFDMSPRDDMS:await tandata.filter((i) => i.itemid === '53125'),
              SPFPOPRDSMTP:await tandata.filter((i) => i.itemid === '53115'), 
              SPFPOPRDGATEWAY:await tandata.filter((i) => i.itemid === '53110'),
              SPFPOPRDJAVA:await tandata.filter((i) => i.itemid === '53113'),
              SPFPOPRDDISP:await tandata.filter((i) => i.itemid === '53108'),
              SPFPOPRDNIMSH:await tandata.filter((i) => i.itemid === '53106'),       
              SPFMRNAPRDSQL:await tandata.filter((i) => i.itemid === '53152'),
            };


            console.log("-------service1------")
            console.log(service1.SPFPOWBISQL)
       




        const requestBody = {
          jsonrpc: '2.0',
          method: 'host.get',
          params: {
            output: ['host'], // Specify the desired output fields
            groupids: '26', // ID of the host group
          },
          id: 1,
          auth: token,
        }





      const newbody4 = {
        content: requestBody,
        header: { 'Content-Type': 'application/json-rpc' },
        url: zabbixauthentication.url,
      };

      const response3 = await GetItems(newbody4)

        host = response3.result
        
        console.log('------hosts-----')
        console.log(host)


        const requestBody2 = {
          jsonrpc: '2.0',
          method: 'trend.get',
          params: {
            output: [
              "itemid",
              "clock",
              "num",
              "value_min",
              "value_avg",
              "value_max"
            ],
            itemids: ['50838', '50952', '50425', '51027', '49333', '49199', '49467', '50482', '50671'],
            time_from: from ? from : '1693566435',
            time_till: to ? to : '1695208035',


          },
          id: 1,
          auth: token,
        }


      const newbody3 = {

        content: requestBody2,
        header: { 'Content-Type': 'application/json-rpc' },
        url: zabbixauthentication.url,
      };

      const response4 = await GetItems(newbody3)


          const tanserdata = response4?.result;

          
            tanmiah = await {
                  ...tanmiah,
                  EY: await tanserdata.filter((i) => i.itemid === '50838'),
                  MrnaPrd:await tanserdata.filter((i) => i.itemid === '50952'),
                  APPR:await tanserdata.filter((i) => i.itemid === '50425'),
                  PowerBI:await tanserdata.filter((i) => i.itemid === '51027'),   
                  POPrd:await tanserdata.filter((i) => i.itemid === '49333'),
                  DMSPrd:await tanserdata.filter((i) => i.itemid === '49199'),
                  TaxDbPrd:await tanserdata.filter((i) => i.itemid === '49467'),
                  TaxPrd:await tanserdata.filter((i) => i.itemid === '50482'),
                  EccPrd:await tanserdata.filter((i) => i.itemid === '50671'),
                };

                console.log('--------------------')
                // console.log(tanmiah)



  const CreateTable = async(arr2,param2) => {

    if(arr2.length === 0)
    {
      arr2 = [0,0,0]
    }

    const countOnes = await arr2.filter(value => value.value_min === "1")?.length;
    const totalElements = arr2.length;
    const percentage = ((countOnes / totalElements) * 100);

    arr1.push(Number(percentage.toFixed(2)))
    console.log(arr1)

    if (param2 === 'last') {

      arr1 = await arr1.slice(-9)

      const sum = arr1.reduce((accumulator, currentValue) => accumulator + currentValue);
      average = sum / arr1?.length;

      console.log('average-->',average)
    }

  }

  const CreateTable2 = async(arr2,param2) => {

    if(arr2.length === 0)
    {
      arr2 = [0,0,0]
    }

    const countOnes = await arr2.filter(value => value.value_min === "1")?.length;
    const totalElements = arr2?.length;
    const percentage = ((countOnes / totalElements) * 100);

    arr3.push(Number(percentage.toFixed(2)))
    console.log(arr3)
    // if(arr3?.length === 17 || arr3?.length === 11)
    if (param2 === 'last') {

      arr3 = arr3.slice(-8)

      const sum = arr3.reduce((accumulator, currentValue) => accumulator + currentValue);
      average2 = sum / arr3?.length;
      console.log('average2-->',average2)
    }

  }



        await CreateTable(tanmiah.EY)
        await CreateTable(tanmiah.MrnaPrd)
        await CreateTable(tanmiah.APPR)
        await CreateTable(tanmiah.PowerBI)
        await CreateTable(tanmiah.POPrd)
        await CreateTable(tanmiah.DMSPrd)
        await CreateTable(tanmiah.TaxDbPrd)
        await CreateTable(tanmiah.TaxPrd)
        await CreateTable(tanmiah.EccPrd,'last')

        await CreateTable2(service1.SPFPOWBISQL);
        await CreateTable2(service1.SPFDMSPRDDMS);
        await CreateTable2(service1.SPFPOPRDSMTP);
        await CreateTable2(service1.SPFPOPRDGATEWAY);
        await CreateTable2(service1.SPFPOPRDJAVA);
        await CreateTable2(service1.SPFPOPRDDISP);
        await CreateTable2(service1.SPFPOPRDNIMSH);
        await CreateTable2(service1.SPFMRNAPRDSQL,'last');






  const columns = [
    { field: 'Host', headerName: 'Host', width: 200 },
    { field: 'Up', headerName: 'Up', width: 170 },
    { field: 'Down', headerName: 'Down', width: 170 },
    { field: 'Unreachable', headerName: 'Unreachable', width: 170 }]

const rows = await host?.map((i, index) => {

    return {
      id: index,
      Host: i.host,
      Up: arr1[index] + '%',
      Down: (100 - arr1[index]).toFixed(2) + '%',
      Unreachable: (100 - arr1[index]).toFixed(2)
    }
  }).filter(row => row.Up !== 'undefined%');


  const columns2 = [
    {field: 'Host', headerName: 'Host',width: 170},
    { field: 'Services', headerName: 'Services', width: 200 },

    { field: 'Up', headerName: 'Up', width: 170 },
    { field: 'Down', headerName: 'Down', width: 170 },
    { field: 'Unreachable', headerName: 'Unreachable', width: 170 }]

  const rows2 = await tservice?.map((i, index) => {

    return {
      id: index,
      Host: i.host,
      Services: i.name,
      Up: arr3[index] + '%',
      Down: (100 - arr3[index]).toFixed(2) + '%',
      Unreachable: (100 - arr3[index]).toFixed(2)
    }
  }).filter(row => row.Up !== 'undefined%');



  const today = new Date();
  today.setMonth(today.getMonth() - 1); // Go back one month

  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  const lastMonthName = monthNames[today.getMonth()];
  const lastMonthYear = today.getFullYear();

const tanmaiahContent = {
    HostAvailability: arr1,
    ServiceAvailability: arr3,
    HostAverageAvailability: average,
    ServiceAverageAvailability: average2,
    HAColumns:columns,
    HARows:rows,
    SAColumns:columns2,
    SARows:rows2,
    customer:"Tanmaiah",
    status:"New",
    comment:"",
    version:"v1",
    reportName:`Tanmaiah-${lastMonthName} ${lastMonthYear}`,
    id:uuidv4(),
    fromData:formattedFirstDayOfLastMonth,
    toDate:formattedLastDayOfLastMonth,
    titleCard:`${lastMonthName}-${lastMonthYear}`,
    
}

  

  return tanmaiahContent
  

}

export default TanmaiahReport
