# Much-Assembly-Required-Frontend
Frontend files for the https://muchassemblyrequired.com/ game. 
Information about the backend can be found [here](https://github.com/simon987/Much-Assembly-Required).

Installation instructions:
1. Install a PHP environnment and a MySQL server (e.g. XAMPP on Windows). 
2. Configure the MAR database, using the installation script [database.sql](https://github.com/simon987/Much-Assembly-Required-Frontend/blob/master/database.sql):
```bash
$ pwd
~/Much-Assembly-Required-Frontend/
$ mysql -u root -p
Enter password:  # type your MySQL root user password

MariaDB [(none)]>
MariaDB [(none)]> CREATE DATABASE mar;
MariaDB [(none)]> GRANT ALL PRIVILEGES ON mar.* to 'mar'@'localhost' identified by 'mar';
MariaDB [(none)]> FLUSH PRIVILEGES;
MariaDB [(none)]> USE mar;
MariaDB [mar]> \. database.sql
MariaDB [(none)]> exit
Bye
$ # if '\. database.sql' failed you were not in the right directory. make sure you are in the repo root directory
$ # before running these commands
```

Running instructions:
1. Start Apache and MySQL.
2. Start the backend (see [here](https://github.com/simon987/Much-Assembly-Required) for further details).
3. Run the frontend from localhost. 
When using XAMPP, for example, you can place the frontend files in the ```xampp/htdocs/MAR``` folder, 
and you can run the frontend by typing ```http://localhost/MAR``` in your web browser. 

If you didn't use the MySQL snippet above to configure your database, you may need to change the configuration in /include/config.php.    

HTML template by ajlkn  
Pixel art for the 'Factory' sprite by harveydentmd   
