import axios from 'axios'
import { Authenticate, GetHosts, GetItems } from './ZabbixCommunication.js'
import { v4 as uuidv4 } from 'uuid';

const AraReport = async () => {

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
            lastDayOfLastMonth: lastDayOfPreviousMonth
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

    let service3 = {
        ARASLMPRDDISP: [],
        ARAFIORIPRDMSG: [],
        ARASLMPRDMSG: [],
        ARAFIORIPRDGW: [],
        ARAS4HNAPRDIDX: [],
        ARAFIORIPRDDISP: [],
        ARAS4PRDSSH: [],
        ARAWDPRDSSH: [],
        ARAFIORIPRDSSH: [],
        ARAWDPRDPORT: [],
        ARASLMPRDGW: [],
        ARAS4HNAPRDSSH: [],
        ARAS4PRDGW: [],
        ARASLMPRDSSH: [],
        ARAS4PRDDISP: [],
        ARAS4PRDMSG: [],
        ARAFIORIPRDHTTP: [],
    };

    let ara = {
        PBIP: [],
        S4PRD: [],
        HANAPRD: [],
        NWGPRD: [],
        SLMPRD: [],
        WDPRD: []
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
        jsonrpc: '2.0',
        method: 'item.get',
        params: {
            output: ['itemid', 'name', 'key_', 'lastvalue'],
            hostids: [
                '10563', '10638', '10639', '10640', '10641', '10642'],
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

    requestBody4 = {
        jsonrpc: "2.0",
        method: "trend.get",
        params: {
            output: "extend",
            itemids: [
                '56946', '56004', '56950', '56002', '56787', '56001', '56942', '56960', '56936', '56958', '56948', '56940', '56792',
                '56952', '56791', '56793', '56003'
            ]
            ,
            time_from: from ? from : '1693566435',
            time_till: to ? to : '1695208035',
        },
        id: 1,
        auth: token,
    }; 1
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
    console.log('maadaniyah service data')
    console.log(response2.result)
    const aradata = response2?.result;

    service3 = await {
        ...service3,
        ARASLMPRDDISP: aradata.filter((i) => i.itemid === '56946'),
        ARAFIORIPRDMSG: aradata.filter((i) => i.itemid === '56004'),
        ARASLMPRDMSG: aradata.filter((i) => i.itemid === '56950'),
        ARAFIORIPRDGW: aradata.filter((i) => i.itemid === '56002'),
        ARAS4HNAPRDIDX: aradata.filter((i) => i.itemid === '56787'),
        ARAFIORIPRDDISP: aradata.filter((i) => i.itemid === '56001'),
        ARAS4PRDSSH: aradata.filter((i) => i.itemid === '56942'),
        ARAWDPRDSSH: aradata.filter((i) => i.itemid === '56960'),
        ARAFIORIPRDSSH: aradata.filter((i) => i.itemid === '56936'),
        ARAWDPRDPORT: aradata.filter((i) => i.itemid === '56958'),
        ARASLMPRDGW: aradata.filter((i) => i.itemid === '56948'),
        ARAS4HNAPRDSSH: aradata.filter((i) => i.itemid === '56940'),
        ARAS4PRDGW: aradata.filter((i) => i.itemid === '56792'),
        ARASLMPRDSSH: aradata.filter((i) => i.itemid === '56952'),
        ARAS4PRDDISP: aradata.filter((i) => i.itemid === '56791'),
        ARAS4PRDMSG: aradata.filter((i) => i.itemid === '56793'),
        ARAFIORIPRDHTTP: aradata.filter((i) => i.itemid === '56003'),
    };

    requestBody = {
        jsonrpc: '2.0',
        method: 'host.get',
        params: {
            output: ['host'], // Specify the desired output fields
            groupids: '37', // ID of the host group
        },
        id: 1,
        auth: token,
    }

    const newbody4 = {
        content: requestBody,
        header: { "Content-Type": "application/json-rpc" },
        url: zabbixauthentication.url,
    };

    const response3 = await GetItems(newbody4)
    host = response3.result

    requestBody2 = {
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
            itemids: ['50368', '54752', '54819', '54886', '54953', '55020'],
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
    const araserdata = response4?.result;

    ara = await {
        ...ara,
        PBIP: araserdata.filter((i) => i.itemid === '50368'),
        S4PRD: araserdata.filter((i) => i.itemid === '54752'),
        HANAPRD: araserdata.filter((i) => i.itemid === '54819'),
        NWGPRD: araserdata.filter((i) => i.itemid === '54886'),
        SLMPRD: araserdata.filter((i) => i.itemid === '54953'),
        WDPRD: araserdata.filter((i) => i.itemid === '55020'),
    };

    const CreateTable = async (arr2, param2) => {

        if (arr2.length === 0) {
            arr2 = [0, 0, 0]
        }

        const countOnes = await arr2.filter(value => value.value_min === "1")?.length;
        const totalElements = arr2.length;
        const percentage = ((countOnes / totalElements) * 100);

        arr1.push(Number(percentage.toFixed(2)))
        console.log(arr1)

        if (param2 === 'last') {

            arr1 = arr1.slice(-6)

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

            arr3 = arr3.slice(-17)

            const sum = arr3.reduce((accumulator, currentValue) => accumulator + currentValue);
            average2 = sum / arr3?.length;
            console.log('average2-->', average2)
        }

    }


    await CreateTable(ara.PBIP);
    await CreateTable(ara.S4PRD);
    await CreateTable(ara.HANAPRD);
    await CreateTable(ara.NWGPRD);
    await CreateTable(ara.SLMPRD);
    await CreateTable(ara.WDPRD, 'last');

    await CreateTable2(service3.ARAFIORIPRDHTTP);
    await CreateTable2(service3.ARAFIORIPRDMSG);
    await CreateTable2(service3.ARAFIORIPRDGW);
    await CreateTable2(service3.ARAFIORIPRDDISP);
    await CreateTable2(service3.ARAFIORIPRDSSH);

    await CreateTable2(service3.ARAS4HNAPRDIDX);
    await CreateTable2(service3.ARAS4HNAPRDSSH);

    await CreateTable2(service3.ARAS4PRDSSH);
    await CreateTable2(service3.ARAS4PRDGW);
    await CreateTable2(service3.ARAS4PRDDISP);
    await CreateTable2(service3.ARAS4PRDMSG);



    await CreateTable2(service3.ARASLMPRDDISP);
    await CreateTable2(service3.ARASLMPRDMSG);
    await CreateTable2(service3.ARASLMPRDGW);
    await CreateTable2(service3.ARASLMPRDSSH);

    await CreateTable2(service3.ARAWDPRDSSH);
    await CreateTable2(service3.ARAWDPRDPORT, 'last');


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

  const araContent = {
    HostAvailability: arr1,
    ServiceAvailability: arr3,
    HostAverageAvailability: average,
    ServiceAverageAvailability: average2,
    HAColumns:columns,
    HARows:rows,
    SAColumns:columns2,
    SARows:rows2,
    customer:"Ara",
    status:"New",
    comment:"",
    version:"v1",
    reportName:`Ara-${lastMonthName} ${lastMonthYear}`,
    id:uuidv4(),
}

return araContent







}
export default AraReport