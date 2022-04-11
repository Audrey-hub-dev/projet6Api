//importation du package HTTP natif de Node et utilisation pour créer un serveur
const http = require('http');

//importation du fichier app.js
const app = require('./app');

//fonction qui renvoie un port valide qu'il soit fourni sous la forme d'un numéro ou d'une chaine.
const normalizePort = val => {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
    if (port >= 0) {
      return port;
    }
    return false;
  };



const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
  

/*fonction qui recherche les différentes erreurs et les gère de manière appropriée. 
Elle est ensuite enregistrée dans le serveur. Un écouteur d'évènements est également enregistré;
consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console.
*/
const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.');
        process.exit(1);
        break;
      default:
        throw error;
    }
  };


/*fonction qui sera exécutée à chaque appel effectué vers ce serveur. 
Cette fonction reçoit les objets request et response en tant qu'arguments. 
On utilise la méthode end de la réponse pour renvoyer une réponse de type string à l'appelant. 
*/
const server = http.createServer(app);


server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});


/*on configure le serveur pour qu'il écoute soit la variable d'environnement du port, soit le port 3000.
Ensuite on exécute nodemon server dans le backend. 
*/
server.listen(process.env.PORT || 3000);