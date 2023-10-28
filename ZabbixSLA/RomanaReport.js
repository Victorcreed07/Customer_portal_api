import axios from 'axios'
import { Authenticate, GetHosts, GetItems } from './ZabbixCommunication.js'
import { v4 as uuidv4 } from 'uuid';

const RomanaReport = async () => {
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
  var dates = await getFirstAndLastDayOfLastMonth();

  // Format the dates as desired
  var formattedFirstDayOfLastMonth = dates.firstDayOfLastMonth.toString();
  var formattedLastDayOfLastMonth = dates.lastDayOfLastMonth.toString();

  const converttoUnix = async (val) => {


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
  // let from3 = 
  // let to3 = 
  let from = await converttoUnix(formattedFirstDayOfLastMonth)
  let to = await converttoUnix(formattedLastDayOfLastMonth)
  let from1 = ''
  let to1 = ''
  let token = ""
  let link = ""

  console.log('from date', from)
  console.log('to date', to)

  let requestBody
  let requestBody2
  let requestBody3
  let requestBody4

  let service1 = {
    ROMECCDP: [],
    ROMECCHTTP: [],
    ROMECCSMTP: [],
    ROMECCGW: [],
    ROMECCHTTPS: [],
    ROMECCSSH: [],
    ROMNWGDP: [],
    ROMNWGSSH: [],
    ROMNWGGW: [],
    ROMNWGHTTP: [],
    ROMSOLJAVA: [],
    ROMSOLHTTP: [],
    ROMSOLGW: [],
    ROMSOLSSH: [],
    ROMSOLDP: [],
    ROMS4PRDDP: [],
    ROMS4HNAPRDSSH: [],
    ROMS4HNAPRDIDX2: [],
    ROMS4HNAPRDIDX1: []
  };


  let romana = {
    RomEccPrd: [],
    RomHanaPrd: [],
    RomNwgPrd: [],
    RomSolPrd: [],
    RomWdPrd: [],
  };

  let arr1 = []
  let arr3 = []

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
      token = await Authenticate(zabbixauthentication);

      console.log(token)
    } catch (error) {
      console.error(error);
    }
  }

  await doAuthentication();

  console.log('token--', token)


  requestBody3 = {
    jsonrpc: "2.0",
    method: "item.get",
    params: {
      output: ["itemid", "name", "key_", "lastvalue"],
      hostids: [
        "10624",
        "10627",
        "10631",
        "10632",
        "10633",
      ],
      selectTags: ["tag", "value"],
      evaltype: 0,
      tags: [
        { tag: "Application", value: "SAP", operator: 0 },
        { tag: "Application", value: "SQL", operator: 0 },
      ],
    },
    auth: token,
    id: 1,
  };

  requestBody4 = {
    jsonrpc: "2.0",
    method: "trend.get",
    params: {
      output: "extend",
      itemids: [
        '56892',
        '56896',
        '56900',
        '56894',
        '56898',
        '56902',
        '56876',
        '56882',
        '56878',
        '56880',
        '56930',
        '56928',
        '56926',
        '56932',
        '56924',
        '57007',
        '60723',
        '60721',
        '60719',

      ],
      time_from: from ? from : '1693566435',
      time_till: to ? to : '1695208035',
    },
    id: 1,
    auth: token,
  };


  const newbody = {
    content: requestBody3,
    header: { "Content-Type": "application/json-rpc" },
    url: zabbixauthentication.url,
  };

  const newbody2 = {
    content: requestBody4,
    header: { "Content-Type": "application/json-rpc" },
    url: zabbixauthentication.url,
  };

  const response = await GetHosts(newbody)

  const newarr = await response.result.map((i) => {
    return {
      itemid: i.itemid,
      host: i.name.split("-").slice(0, -1).join(""),
      name: i.name,
      key: i.key_,
    };
  });
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

  const newRows = await newarr.map((row) => {
    if (row.host !== lastCategory) {
      lastCategory = row.host;
      return row;
    } else {
      return { ...row, host: "" };
    }
  });

  tservice = newRows

  const response2 = await GetHosts(newbody2)

  console.log('Romana Services')

  console.log(response2.result)
  const romdata = response2?.result;

  service1 = await {
    ...service1,
    ROMECCDP: romdata.filter((i) => i.itemid === '56892'),
    ROMECCHTTP: romdata.filter((i) => i.itemid === '56896'),
    ROMECCSMTP: romdata.filter((i) => i.itemid === '56900'),
    ROMECCGW: romdata.filter((i) => i.itemid === '56894'),
    ROMECCHTTPS: romdata.filter((i) => i.itemid === '56898'),
    ROMECCSSH: romdata.filter((i) => i.itemid === '56902'),
    ROMNWGDP: romdata.filter((i) => i.itemid === '56876'),
    ROMNWGSSH: romdata.filter((i) => i.itemid === '56882'),
    ROMNWGGW: romdata.filter((i) => i.itemid === '56878'),
    ROMNWGHTTP: romdata.filter((i) => i.itemid === '56880'),
    ROMSOLJAVA: romdata.filter((i) => i.itemid === '56930'),
    ROMSOLHTTP: romdata.filter((i) => i.itemid === '56928'),
    ROMSOLGW: romdata.filter((i) => i.itemid === '56926'),
    ROMSOLSSH: romdata.filter((i) => i.itemid === '56932'),
    ROMSOLDP: romdata.filter((i) => i.itemid === '56924'),
    // ROMSOLDP: data.filter((i) => i.itemid === '56926'),
    ROMS4PRDDP: romdata.filter((i) => i.itemid === '57007'),
    ROMS4HNAPRDIDX1: romdata.filter((i) => i.itemid === '60719'),
    ROMS4HNAPRDIDX2: romdata.filter((i) => i.itemid === '60721'),
    ROMS4HNAPRDSSH: romdata.filter((i) => i.itemid === '60723'),
  }

  requestBody = {
    jsonrpc: "2.0",
    method: "host.get",
    params: {
      output: ["host"], // Specify the desired output fields
      groupids: "35", // ID of the host group
    },
    id: 1,
    auth: token,
  };

  const newbody4 = {
    content: requestBody,
    header: { "Content-Type": "application/json-rpc" },
    url: zabbixauthentication.url,
  };

  const response3 = await GetItems(newbody4)
  host = response3.result

  requestBody2 = {
    jsonrpc: "2.0",
    method: "trend.get",
    params: {
      output: [
        "itemid",
        "clock",
        "num",
        "value_min",
        "value_avg",
        "value_max",
      ],
      itemids: [
        // '56892',
        // '56896',
        // '56900',
        // '56894',
        // '56898',
        // '56902',
        // '56876',
        // '56882',
        // '56878',
        // '56880',
        // '56930',
        // '56928',
        // '56926',
        // '56932',
        // '56924',
        // '57007',
        '53728',
        '54016',
        '54284',
        '54351',
        '54418',
      ],
      time_from: from ? from : '1693566435',
      time_till: to ? to : '1695208035',
    },
    id: 1,
    auth: token,
  }

  const newbody3 = {
    content: requestBody2,
    header: { "Content-Type": "application/json-rpc" },
    url: zabbixauthentication.url,
  };

  const response4 = await GetItems(newbody3)
  const romserdata = response4?.result;

  romana = await {
    ...romana,
    RomEccPrd: romserdata.filter((i) => i.itemid === "53728"),
    RomHanaPrd: romserdata.filter((i) => i.itemid === "54016"),
    RomNwgPrd: romserdata.filter((i) => i.itemid === "54284"),
    RomSolPrd: romserdata.filter((i) => i.itemid === "54351"),
    RomWdPrd: romserdata.filter((i) => i.itemid === "54418"),
  }

  const CreateTable = async (arr2, param2) => {


    if (arr2.length === 0) {
      arr2 = [0, 0, 0]
    }
    const countOnes = await arr2.filter(value => value.value_min === "1")?.length;
    const totalElements = arr2.length;
    const percentage = ((countOnes / totalElements) * 100);

    arr1.push(Number(percentage.toFixed(2)))

    if (param2 === 'last') {
      arr1 = arr1.slice(-7)

      const sum = arr1.reduce((accumulator, currentValue) => accumulator + currentValue);
      average = sum / arr1?.length;

      console.log('average-->', average)
    }

  }


  const CreateTable2 = async (arr2, param2) => {

    if (arr2.length === 0) {
      arr2 = [0, 0, 0]
    }

    const countOnes = await arr2.filter(value => value.value_min === "1")?.length;
    const totalElements = arr2?.length;
    const percentage = ((countOnes / totalElements) * 100);

    arr3.push(Number(percentage.toFixed(2)))
    console.log(arr3)
    // if(arr3?.length === 17 || arr3?.length === 11)
    if (param2 === 'last') {

      arr3 = arr3.slice(-19)

      const sum = arr3.reduce((accumulator, currentValue) => accumulator + currentValue);
      average2 = sum / arr3?.length;
      console.log('average2-->', average2)
    }

  }

  await CreateTable(romana.RomEccPrd);
  await CreateTable(romana.RomHanaPrd);
  await CreateTable(romana.RomNwgPrd);
  await CreateTable(romana.RomSolPrd);
  await CreateTable(romana.RomWdPrd, 'last');

  await CreateTable2(service1.ROMECCDP);
  await CreateTable2(service1.ROMECCHTTP);
  await CreateTable2(service1.ROMECCSMTP);
  await CreateTable2(service1.ROMECCHTTPS);
  await CreateTable2(service1.ROMECCGW);
  await CreateTable2(service1.ROMECCSSH);

  await CreateTable2(service1.ROMNWGDP);
  await CreateTable2(service1.ROMNWGSSH);
  await CreateTable2(service1.ROMNWGHTTP);
  await CreateTable2(service1.ROMNWGGW);

  await CreateTable2(service1.ROMS4HNAPRDSSH);

  await CreateTable2(service1.ROMS4HNAPRDIDX2);
  await CreateTable2(service1.ROMS4HNAPRDIDX1);

  await CreateTable2(service1.ROMS4PRDDP);

  await CreateTable2(service1.ROMSOLJAVA);
  await CreateTable2(service1.ROMSOLHTTP);
  await CreateTable2(service1.ROMSOLGW);
  await CreateTable2(service1.ROMSOLSSH);
  await CreateTable2(service1.ROMSOLDP, 'last');

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
    {
      field: 'Host',
      headerName: 'Host',
      width: 170
      // renderCell: (params) => {
      //   if (params.rowIndex === 0 || params.value !== params.api.getRow(params.rowIndex - 1)?.Host) {
      //     return <div>{params.value}</div>;
      //   } else {
      //     return <div></div>;
      //   }
      // },
    },
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

  const romanaContent = {
    HostAvailability: arr1,
    ServiceAvailability: arr3,
    HostAverageAvailability: average,
    ServiceAverageAvailability: average2,
    HAColumns:columns,
    HARows:rows,
    SAColumns:columns2,
    SARows:rows2,
    customer:"Romana",
    status:"New",
    comment:"",
    version:"v1",
    reportName:`Romana-${lastMonthName} ${lastMonthYear}`,
    id:uuidv4(),
    fromData:formattedFirstDayOfLastMonth,
    toDate:formattedLastDayOfLastMonth,
    titleCard:`${lastMonthName}-${lastMonthYear}`,
}

return romanaContent


}

export default RomanaReport
