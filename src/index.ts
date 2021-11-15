import axios from "axios";
import telegram from "node-telegram-bot-api";
import { datos } from "./datos";
import { parametroDTO } from "./parametroDTO";


const TELEGRAM_KEY = "2014934960:AAEVqN8OJ7cB0I_JKGWUgOPeOQZGB4zK0Yo";

const Bot = new telegram(TELEGRAM_KEY, { polling: true });
const url = "http://localhost:8089/";
var token: datos;
var cobros;

Bot.onText(/\/start/, (msg: any) => {
    Bot.sendMessage(msg.chat.id, "Hola, " + msg.chat.first_name + "\nBienvenido/a al Bot de consultas municipales\n\n Para ver mis comandos Utilice el comando /comandos");
});

Bot.onText(/\/comandos/, (msg: any) => {
    var comandos = "<strong>a)</strong>\t\t/horario\n\tMuestra el horario de la municipalidad.\n\n" +
        "<strong>b)</strong>\t\t/correo\n\tMuestra el correo de la municipalidad.\n\n" +
        "<strong>c)</strong>\t\t/telefono\n\tMuestra el telefono de la municipalidad.\n\n" +
        "<strong>d)</strong>\t\t/total {número de cédula}\n\tMuestra la suma de todos los cobros pendientes del usuario indicado.\n\n" +
        "<strong>e)</strong>\t\t/especifico {número de cédula}\n\tMuestra una lista de todos los cobros pendientes del usuario indicado.\n\n" +
        "<strong>f)</strong>\t\t/vImpositivos {número de cédula}\n\tMuestra una lista de todos los valores impositivos asociados al usuario indicado.\n\n" +
        "<strong>g)</strong>\t\t/porFecha {número de cédula} <strong><i>fecha inicial fecha final</i></strong>\n\tMuestra los últimos pagos realizados del usuario indicado en rango de fechas especifico.\n\n" +
        "** <strong>TODOS LOS NUMEROS DE CEDULA DEBEN IR SIN ESPACIOS NI CEROS</strong> **\n\n" +
        "** El comando entre llaves, se debe sustituir por un número sin las llaves. **\nPor ejemplo: /total 102340567\n\n" +
        "** En lugar de “fecha inicial” y “fecha final”, se debe escribir las fechas con el formato <strong><i>dd/mm/aaaa</i></strong>. **\nPor ejemplo: 102340567 26/06/2021 26/09/2021";
    Bot.sendMessage(msg.chat.id, comandos, { parse_mode: "HTML" });

});

function conectar(msg: any, opcion: string, cedula: string) {

    axios.post(url + 'authentication/', {
        cedula: "BOT",
        password: "botpassword"
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        token = response.data as datos
        var t: string;
        t = token.jwt;
        console.log(response.status);

        consulta(msg, t, opcion, cedula);

    }, (error) => {
        console.log(error);
    });

};

const currency = function (number: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }).format(number);
};

function consulta(msg: any, token: string, op: string, ced: string) {

    switch (op) {
        case "1":
            axios.post(url + 'cobros/cedula/' + ced, {

            },
                {
                    headers: {
                        'AUTHORIZATION': 'bearer ' + token
                    }
                }).then((response) => {
                    var total: string;

                    cobros = response.data as number;
                    //cobros.toLocaleString('es-CRC',{style: 'currency',currency: '₡', minimumFractionDigits: 2});
                    //total = cobros.monto;
                    var re = /CRC/gi
                    var newstr = currency(cobros).replace(re, "₡")
                    console.log(cobros);
                    Bot.sendMessage(msg.chat.id, "La suma total de los cobros del usuario cedula:" + ced + " es de: " + newstr);


                    console.log(response.status);
                    console.log(response.statusText);

                }, (error) => {
                    console.log(error);
                });
            break;

        case "2":
            axios.post(url + 'cobros/cedula/pendientes/' + ced, {

            },
                {
                    headers: {
                        'AUTHORIZATION': 'bearer ' + token
                    }
                }).then((response) => {
                    var cobrosEspecificos: string;
                    cobrosEspecificos = response.data as string;
                    Bot.sendMessage(msg.chat.id, "Los cobros pendientes del usuario: " + ced + " son:\n" + cobrosEspecificos);
                    console.log(response.status);
                    console.log(response.statusText);

                });
            break;

        case "3":
            axios.post(url + 'listaDuenios/cedula/' + ced, {

            },
                {
                    headers: {
                        'AUTHORIZATION': 'bearer ' + token
                    }
                }).then((response) => {
                    var valoresImpositivos: string;
                    valoresImpositivos = response.data as string;
                    Bot.sendMessage(msg.chat.id, "Los valores impositivos asociados al usuario: " + ced + " son:\n" + valoresImpositivos);
                    console.log(response.status);
                    console.log(response.statusText);

                });
            break;
        case "4":
            var horario = "Nuestro horario es:\n\n\n";
            
            axios.get(url + 'parametros/nombre/horario_lunes', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
                console.log("status "+response.status);
            });
            

            axios.get(url + 'parametros/nombre/horario_martes', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });

            axios.get(url + 'parametros/nombre/horario_miercoles', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });

            axios.get(url + 'parametros/nombre/horario_jueves', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });

            axios.get(url + 'parametros/nombre/horario_viernes', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });

            axios.get(url + 'parametros/nombre/horario_sabado', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });

            axios.get(url + 'parametros/nombre/horario_domingo', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                horario += txt.dato +"\n\n";
            });
            console.log("Horario ");
            console.log(horario);
            console.log("termina ");
            Bot.sendMessage(msg.chat.id, horario);
            break;
        case "5":
            axios.get(url + 'parametros/nombre/correo_electronico_muni', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                var correo = "Nuestro correo es: ";
                txt=response.data as parametroDTO;
                correo+=txt.dato;
                Bot.sendMessage(msg.chat.id, correo);
            });
            break;
        case "6":
            var telefono = "";
            axios.get(url + 'parametros/nombre/telefono_muni', {
                headers: {
                    'AUTHORIZATION': 'bearer ' + token
                }
            }).then((response) => {
                var txt:parametroDTO;
                txt = response.data as parametroDTO;
                telefono+="Nuestro telefono es: "+txt.dato+"\n\n";
                Bot.sendMessage(msg.chat.id, telefono);
            });
            
            break;

    }
};


Bot.onText(/\/horario/, (msg: any) => {
    conectar(msg, "4", "")
});

Bot.onText(/\/correo/, (msg: any) => {
    conectar(msg, "5", "")
});

Bot.onText(/\/telefono/, (msg: any) => {
    conectar(msg, "6", "")
});

Bot.onText(/\/total (.+)/, (msg: any, match: any) => {

    var cedula = match[1];
    conectar(msg, "1", cedula);

});

Bot.onText(/\/especifico (.+)/, (msg: any, ced: any) => {
    var cedula = ced[1];
    conectar(msg, "2", cedula)
});

Bot.onText(/\/vImpositivos (.+)/, (msg: any, ced: any) => {
    var cedula = ced[1];
    conectar(msg, "3", cedula)
});

Bot.onText(/\/porFecha (.+)/, (msg: any, match: any) => {
    var mensaje = match[1].split(" ");
    if (mensaje.length != 3) return Bot.sendMessage(msg.chat.id, "Por favor revise el formato del comando.\n\n Si necesita ayuda, puede utilizar el comando /comandos");
    var cedula = mensaje[0];
    var fi = mensaje[1];
    var ff = mensaje[2];
    Bot.sendMessage(msg.chat.id, cedula + " " + fi + " " + ff);
});


Bot.on('message', (msg: any) => {
    var total = "/total";
    var especifico = "/especifico";
    var vImpositivos = "/vimpositivos";
    var porFecha = "/porfecha";
    var cadena = msg.text.toString().toLowerCase();

    if (cadena.indexOf(vImpositivos) === 0) {
        var cedula = msg.text.substring(vImpositivos.length, msg.text.lenght);
        if (cedula === "") {
            Bot.sendMessage(msg.chat.id, "Por favor ingrese un numero de cedula después del comando /vImpositivos\n\n Si necesita ayuda, puede utilizar el comando /comandos");
        }
    }

    if (cadena.indexOf(total) === 0) {
        var cedula = msg.text.substring(total.length, msg.text.lenght);
        if (cedula === "") {
            Bot.sendMessage(msg.chat.id, "Por favor ingrese un numero de cedula después del comando " + total + "\n\n Si necesita ayuda, puede utilizar el comando /comandos");
        }
    }

    if (cadena.indexOf(especifico) === 0) {
        var cedula = msg.text.substring(especifico.length, msg.text.lenght);
        if (cedula === "") {
            Bot.sendMessage(msg.chat.id, "Por favor ingrese un numero de cedula después del comando " + especifico + "\n\n Si necesita ayuda, puede utilizar el comando /comandos");
        }
    }

    if (cadena.indexOf(porFecha) === 0) {
        var cedula = msg.text.substring(porFecha.length, msg.text.lenght);
        if (cedula === "") {
            Bot.sendMessage(msg.chat.id, "Por favor ingrese un numero de cedula y el rango de fechas con el formato solicitado después del comando /porFecha\n\n Si necesita ayuda, puede utilizar el comando /comandos");
        }
    }

});

Bot.onText(/\/salir/, (msg: any) => {
    Bot.sendMessage(msg.chat.id, "Fue un placer ayudarle.\nSi desea iniciar una nueva conversación, digite /iniciar");
});


