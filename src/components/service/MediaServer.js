import axios from 'axios';

class MediaServer {

    constructor() {
        this.$axios = axios;
    }

    getOnlineMediaServerList(callback) {
        this.$axios({
            method: 'get',
            url: `/webapi/mediaServer/list`,
            params: {
                status: true,
            }
        }).then((res) => {
            if (typeof (callback) == "function") callback(res.data)
        }).catch((error) => {
            console.log(error);
        });
    }

    getMediaServerList(callback) {
        this.$axios({
            method: 'get',
            url: `/webapi/mediaServer/list`,
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    getMediaServer(id, callback) {
        this.$axios({
            method: 'get',
            url: `/api/server/media_server/one/` + id,
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    checkServer(param, callback) {
        this.$axios({
            method: 'get',
            url: `/webapi/mediaServer/check`,
            params: {
                ip: param.ip,
                port: param.httpPort,
                secret: param.secret
            }
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    checkRecordServer(param, callback) {
        this.$axios({
            method: 'get',
            url: `/api/server/media_server/record/check`,
            params: {
                ip: param.ip,
                port: param.recordAssistPort
            }
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    addServer(param, callback) {
        this.$axios({
            method: 'post',
            url: `/webapi/mediaServer/edit`,
            data: param
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }

    delete(id, callback) {
        this.$axios({
            method: 'delete',
            url: `/webapi/mediaServer/delete/` + id,
        }).then(function (res) {
            if (typeof (callback) == "function") callback(res.data)
        }).catch(function (error) {
            console.log(error);
        });
    }
}

export default MediaServer;
