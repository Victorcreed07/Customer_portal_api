import axios from 'axios'
import { Authenticate, GetHosts, GetItems } from './ZabbixCommunication.js'
import { v4 as uuidv4 } from 'uuid';


const MaadaniyahReport = async () => {

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
    // let from3 = 
    // let to3 = 
    let from=await converttoUnix(formattedFirstDayOfLastMonth)
    let to =await converttoUnix(formattedLastDayOfLastMonth)
    let from1 = ''
    let to1 = ''
    let token = ""
    let link = ""

    console.log('from date',from)
    console.log('to date',to)

    let requestBody
    let requestBody2
    let requestBody3
    let requestBody4

    let service2 = {
        MAAECCPRDDISP: [],
        MAABWPRDGW: [],
        MAABWPRDDISP: [],
        MAABOPRDHTTP: [],
        MAABWHNAPRDIDX: [],
        MAABOHNAPRDIDX: [],
        MAAHNAPRDSSH: [],
        MAAHNAPRDBIDX1 : [],
        MAAHNAPRDBIDX2 : [],
        MAAHNAPRDBIDX3 : [],
        MAAECCPRDGW: [],
        MAABWPRDMSG: [],
        MAAHNAPRDSYSTEMDB: [],
        MAAHNAPRDIDX: [],
        MAAECCPRDMSG: [],
        MAASOLPRDAPP1: [],
        MAASOLPRDAPP2: [],
        MAASOLPRDDB1: [],
        MAASOLPRDDB2: [],
    };


    let maadaniyah = {
        BPCPrd: [],
        SolPrd: [],
        DMSPrd: [],
        HanaPrdB: [],
        HanaPrdA: [],
        ECCPrd: [],
        WinMGMT: [],
        BoPrd: [],
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
                '10588', '10589', '10590', '10591', '10592', '10593',  '10595',
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

    requestBody4 = {
        jsonrpc: "2.0",
        method: "trend.get",
        params: {
            output: "extend",
            itemids:  [
                '53084', '53082','53081', '53074', '53070','53069', '53085', '53083',
                '53072',  '53071', '53086', '60414','60417'
                ,'60415','60416','60739','60743','60741','60745'
                ]
            ,
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

    // console.log('i am at last',newarr)

    let lastCategory = null;


    const newRows = await newarr.map((row) => {
        if (row.host !== lastCategory) {
            lastCategory = row.host;
            return row;
        } else {
            return { ...row, host: '' };
        }
    });

    tservice = newRows
    // console.log('----------')
    // console.log('new rows')
    // console.log(tservice)

    const response2 = await GetHosts(newbody2)

    console.log('maadaniyah service data')
     console.log(response2.result)
    const maadata = response2?.result;

    service2 = await {
        ...service2,
        MAAECCPRDDISP: maadata.filter((i) => i.itemid === '53084'),
        MAABWPRDGW: maadata.filter((i) => i.itemid === '53082'),
        // MAAECCHNADEVIDX: maadata.filter((i) => i.itemid === '53101'),
        MAABWPRDDISP: maadata.filter((i) => i.itemid === '53081'),
        MAABOPRDHTTP: maadata.filter((i) => i.itemid === '53074'),
        MAABWHNAPRDIDX: maadata.filter((i) => i.itemid === '53070'),
        // MAABWHNADEVIDX: maadata.filter((i) => i.itemid === '53100'),
        MAABOHNAPRDIDX: maadata.filter((i) => i.itemid === '53069'),
        MAAECCPRDGW: maadata.filter((i) => i.itemid === '53085'),
        MAABWPRDMSG: maadata.filter((i) => i.itemid === '53083'),
        MAAHNAPRDSYSTEMDB: maadata.filter((i) => i.itemid === '53072'),
        // MAAECCHNAQASIDX: maadata.filter((i) => i.itemid === '53102'),
        // MAABWDEVGW: maadata.filter((i) => i.itemid === '53097'),
        // MAABOHNADEVIDX: maadata.filter((i) => i.itemid === '53099'),
        MAAHNAPRDIDX: maadata.filter((i) => i.itemid === '53071'),
        MAAECCPRDMSG: maadata.filter((i) => i.itemid === '53086'),
        // MAABWDEVDISP: maadata.filter((i) => i.itemid === '53096'),
        // MAABODEVHTTP: maadata.filter((i) => i.itemid === '53095'),
        // MAABWDEVMSG: maadata.filter((i) => i.itemid === '53098'),

        MAASOLPRDAPP1: maadata.filter((i) => i.itemid === '60415'),
        MAASOLPRDAPP2: maadata.filter((i) => i.itemid === '60414'),
        MAASOLPRDDB1: maadata.filter((i) => i.itemid === '60416'),
        MAASOLPRDDB2: maadata.filter((i) => i.itemid === '60417'),

        MAAHNAPRDSSH: maadata.filter((i) => i.itemid === '60745'),
        MAAHNAPRDBIDX1: maadata.filter((i) => i.itemid === '60739'),
        MAAHNAPRDBIDX2: maadata.filter((i) => i.itemid === '60741'),
        MAAHNAPRDBIDX3: maadata.filter((i) => i.itemid === '60743'),

    };
 


    //  console.log(service2)

    requestBody = {
        jsonrpc: '2.0',
        method: 'host.get',
        params: {
            output: ['host'], // Specify the desired output fields
            groupids: '29', // ID of the host group
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
    // console.log(host)

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
            itemids: ['49712', '50114', '49779', '49913', '50047', '49846', '49601','60739','60741','60743','60745'],
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
    const maaserdata = response4?.result;
    // console.log(maaserdata)

    maadaniyah = await {
        ...maadaniyah,
        // BoDev: maaserdata.filter((i) => i.itemid === '49534'),
        BPCPrd: maaserdata.filter((i) => i.itemid === '49712'),
        SolPrd: maaserdata.filter((i) => i.itemid === '50114'),
        DMSPrd: maaserdata.filter((i) => i.itemid === '49779'),
        HanaPrdB: maaserdata.filter((i) => i.itemid === '49913'),
        HanaPrdA: maaserdata.filter((i) => i.itemid === '50047'),
        ECCPrd: maaserdata.filter((i) => i.itemid === '49846'),
        // WinMGMT: maaserdata.filter((i) => i.itemid === '51141'),
        BoPrd: maaserdata.filter((i) => i.itemid === '49601'),
        // BPCDev: maaserdata.filter((i) => i.itemid === '49645'),
        // HanaDevQas: maaserdata.filter((i) => i.itemid === '49980'),
    };


    const CreateTable = async (arr2,param2) => {

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

            arr1 = arr1.slice(-7)

            const sum = arr1.reduce((accumulator, currentValue) => accumulator + currentValue);
            average = sum / arr1?.length;

            console.log('average-->', average)
        }

    }

    const CreateTable2 = async (arr2,param2) => {

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

            arr3 = arr3.slice(-19)

            const sum = arr3.reduce((accumulator, currentValue) => accumulator + currentValue);
            average2 = sum / arr3?.length;
            console.log('average2-->', average2)
        }

    }


    // await CreateTable(maadaniyah.BPCDev);
    // await CreateTable(maadaniyah.HanaDevQas);
    // await CreateTable(maadaniyah.BoDev);
    await CreateTable(maadaniyah.BPCPrd);
    await CreateTable(maadaniyah.SolPrd);
    await CreateTable(maadaniyah.DMSPrd);
    await CreateTable(maadaniyah.HanaPrdB);
    await CreateTable(maadaniyah.HanaPrdA);
    await CreateTable(maadaniyah.ECCPrd);
    // await CreateTable(maadaniyah.WinMGMT);
    await CreateTable(maadaniyah.BoPrd,'last');

    // await CreateTable2(service2.MAABODEVHTTP);
    // await CreateTable2(service2.MAABOHNADEVIDX);
    await CreateTable2(service2.MAABOHNAPRDIDX);
    await CreateTable2(service2.MAABOPRDHTTP);
    // await CreateTable2(service2.MAABWDEVDISP);
    // await CreateTable2(service2.MAABWDEVMSG);
    // await CreateTable2(service2.MAABWDEVGW);
    // await CreateTable2(service2.MAABWHNADEVIDX);
    await CreateTable2(service2.MAABWHNAPRDIDX);
    await CreateTable2(service2.MAABWPRDMSG);
    await CreateTable2(service2.MAABWPRDGW);
    await CreateTable2(service2.MAABWPRDDISP);
    
    // await CreateTable2(service2.MAAECCHNADEVIDX);
    // await CreateTable2(service2.MAAECCHNAQASIDX);
    await CreateTable2(service2.MAAECCPRDDISP);
    await CreateTable2(service2.MAAECCPRDGW);
    await CreateTable2(service2.MAAECCPRDMSG);

    await CreateTable2(service2.MAAHNAPRDSSH);
    await CreateTable2(service2.MAAHNAPRDIDX);
    await CreateTable2(service2.MAAHNAPRDSYSTEMDB);

    await CreateTable2(service2.MAAHNAPRDBIDX1);
    await CreateTable2(service2.MAAHNAPRDBIDX2);
    await CreateTable2(service2.MAAHNAPRDBIDX3);

    await CreateTable2(service2.MAASOLPRDAPP2);
    await CreateTable2(service2.MAASOLPRDAPP1);
    await CreateTable2(service2.MAASOLPRDDB1);
    await CreateTable2(service2.MAASOLPRDDB2,'last');




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


    const maadaniayhContent = {
        HostAvailability: arr1,
        ServiceAvailability: arr3,
        HostAverageAvailability: average,
        ServiceAverageAvailability: average2,
        HAColumns:columns,
        HARows:rows,
        SAColumns:columns2,
        SARows:rows2,
        customer:"Maadaniyah",
        status:"New",
        comment:"",
        version:"v1",
        reportName:`Maadaniyah-${lastMonthName} ${lastMonthYear}`,
        id:uuidv4(),
        fromData:formattedFirstDayOfLastMonth,
        toDate:formattedLastDayOfLastMonth,
        titleCard:`${lastMonthName}-${lastMonthYear}`,
    }

    return maadaniayhContent


}

export default MaadaniyahReport