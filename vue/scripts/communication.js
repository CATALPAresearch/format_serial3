import ajax from 'core/ajax';

export default class Communication {

    static setPluginName(name) {
        Communication.fullName = name;
    }

    static webservice(method, param = {}) {
        console.log(Communication.fullName + '_x_' + method)
        if (typeof Communication.fullName !== 'string') {
            console.log('No plugin name given at communication class.');
            throw new Error('No plugin name given at communication class.');
        }
        return new Promise(
            (resolve, reject) => {
                ajax.call([{
                    methodname: Communication.fullName + '_' + method,
                    args: param ? param : {},
                    timeout: 3000,
                    done: function (data) {
                        return resolve(data);
                    },
                    fail: function (error) {
                        console.log('Error at Webservice: '+Communication.fullName + '_' + method, error, param);
                        return reject(error);
                    }
                }]);
            }
        );
    }
} 