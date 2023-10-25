import axios from 'axios';
import https from 'https';

export function Authenticate(data) {
    try {
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        axios.defaults.httpsAgent = agent;

        return axios.post(data.url + '/api_jsonrpc.php', data.content, { headers: data.header })
            .then(function (response) {
                return response.data.result;
            })
            .catch(function (error) {
                console.log(error);
                return {
                    status: false
                };
            });
    } catch (err) {
        // Handle any synchronous errors here
        throw err; // Rethrow the error if needed
    }
}


export function GetHosts(data) {

    try {

        // console.log(data)
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        axios.defaults.httpsAgent = agent;

        return axios.post(data.url + '/api_jsonrpc.php', data.content, { header: data.header })
            .then(function (response) {
                // res.status(200).json({ result: response.data })
                // console.log(response.data)
                console.log('------------')
                console.log('------success')
                return response.data

            })
            .catch(function (error) {
                // res.status(409).json({ message: error })
                console.log(error)
            });

    }
    catch (err) {
        console.log(err)
    }
}


export function GetItems(data) {

    try {

        // console.log(data)
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        axios.defaults.httpsAgent = agent;

        return axios.post(data.url + '/api_jsonrpc.php', data.content, { header: data.header })
            .then(function (response) {
                // res.status(200).json({ result: response.data })
                // console.log(response.data)

                return response.data

            })
            .catch(function (error) {
                // res.status(409).json({ message: error })
                console.log(error)
            });

    }
    catch (err) {

    }
}